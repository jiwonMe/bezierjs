import { abs, cos, sin, atan2, sqrt, pow, epsilon } from "./constants.js";

const between = function (v, m, M) {
  return (m <= v && v <= M) || approximately(v, m) || approximately(v, M);
};

const approximately = function (a, b, precision) {
  return abs(a - b) <= (precision || epsilon);
};

const map = function (v, ds, de, ts, te) {
  const d1 = de - ds,
    d2 = te - ts,
    v2 = v - ds,
    r = v2 / d1;
  return ts + d2 * r;
};

const lerp = function (r, v1, v2) {
  const ret = {
    x: v1.x + r * (v2.x - v1.x),
    y: v1.y + r * (v2.y - v1.y),
  };
  if (v1.z !== undefined && v2.z !== undefined) {
    ret.z = v1.z + r * (v2.z - v1.z);
  }
  return ret;
};

const pointToString = function (p) {
  let s = p.x + "/" + p.y;
  if (typeof p.z !== "undefined") {
    s += "/" + p.z;
  }
  return s;
};

const pointsToString = function (points) {
  return "[" + points.map(pointToString).join(", ") + "]";
};

const copy = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

const angle = function (o, v1, v2) {
  const dx1 = v1.x - o.x,
    dy1 = v1.y - o.y,
    dx2 = v2.x - o.x,
    dy2 = v2.y - o.y,
    cross = dx1 * dy2 - dy1 * dx2,
    dot = dx1 * dx2 + dy1 * dy2;
  return atan2(cross, dot);
};

// round as string, to avoid rounding errors
const round = function (v, d) {
  const s = "" + v;
  const pos = s.indexOf(".");
  return parseFloat(s.substring(0, pos + 1 + d));
};

const dist = function (p1, p2) {
  const dx = p1.x - p2.x,
    dy = p1.y - p2.y;
  return sqrt(dx * dx + dy * dy);
};

const closest = function (LUT, point) {
  let mdist = pow(2, 63),
    mpos,
    d;
  LUT.forEach(function (p, idx) {
    d = dist(point, p);
    if (d < mdist) {
      mdist = d;
      mpos = idx;
    }
  });
  return { mdist: mdist, mpos: mpos };
};

const abcratio = function (t, n) {
  // see ratio(t) note on http://pomax.github.io/bezierinfo/#abc
  if (n !== 2 && n !== 3) {
    return false;
  }
  if (typeof t === "undefined") {
    t = 0.5;
  } else if (t === 0 || t === 1) {
    return t;
  }
  const bottom = pow(t, n) + pow(1 - t, n),
    top = bottom - 1;
  return abs(top / bottom);
};

const projectionratio = function (t, n) {
  // see u(t) note on http://pomax.github.io/bezierinfo/#abc
  if (n !== 2 && n !== 3) {
    return false;
  }
  if (typeof t === "undefined") {
    t = 0.5;
  } else if (t === 0 || t === 1) {
    return t;
  }
  const top = pow(1 - t, n),
    bottom = pow(t, n) + top;
  return top / bottom;
};

const lli8 = function (x1, y1, x2, y2, x3, y3, x4, y4) {
  const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
    ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (d == 0) {
    return false;
  }
  return { x: nx / d, y: ny / d };
};

const lli4 = function (p1, p2, p3, p4) {
  const x1 = p1.x,
    y1 = p1.y,
    x2 = p2.x,
    y2 = p2.y,
    x3 = p3.x,
    y3 = p3.y,
    x4 = p4.x,
    y4 = p4.y;
  return lli8(x1, y1, x2, y2, x3, y3, x4, y4);
};

const lli = function (v1, v2) {
  return lli4(v1, v1.c, v2, v2.c);
};

const align = function (points, line) {
  const tx = line.p1.x,
    ty = line.p1.y,
    a = -atan2(line.p2.y - ty, line.p2.x - tx),
    d = function (v) {
      return {
        x: (v.x - tx) * cos(a) - (v.y - ty) * sin(a),
        y: (v.x - tx) * sin(a) + (v.y - ty) * cos(a),
      };
    };
  return points.map(d);
};

const numberSort = function (a, b) {
  return a - b;
};

export {
  between,
  approximately,
  map,
  lerp,
  pointToString,
  pointsToString,
  copy,
  angle,
  round,
  dist,
  closest,
  abcratio,
  projectionratio,
  lli8,
  lli4,
  lli,
  align,
  numberSort,
};
