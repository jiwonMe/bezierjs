import {
  abs,
  cos,
  sin,
  atan2,
  sqrt,
  quart,
  tau,
  nMax,
  nMin,
} from "./constants.js";
import { dist, lli8 } from "./geometry.js";

const bboxoverlap = function (b1, b2) {
  const dims = ["x", "y"],
    len = dims.length;

  for (let i = 0, dim, l, t, d; i < len; i++) {
    dim = dims[i];
    l = b1[dim].mid;
    t = b2[dim].mid;
    d = (b1[dim].size + b2[dim].size) / 2;
    if (abs(l - t) >= d) return false;
  }
  return true;
};

const expandbox = function (bbox, _bbox) {
  if (_bbox.x.min < bbox.x.min) {
    bbox.x.min = _bbox.x.min;
  }
  if (_bbox.y.min < bbox.y.min) {
    bbox.y.min = _bbox.y.min;
  }
  if (_bbox.z && _bbox.z.min < bbox.z.min) {
    bbox.z.min = _bbox.z.min;
  }
  if (_bbox.x.max > bbox.x.max) {
    bbox.x.max = _bbox.x.max;
  }
  if (_bbox.y.max > bbox.y.max) {
    bbox.y.max = _bbox.y.max;
  }
  if (_bbox.z && _bbox.z.max > bbox.z.max) {
    bbox.z.max = _bbox.z.max;
  }
  bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
  bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
  if (bbox.z) {
    bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
  }
  bbox.x.size = bbox.x.max - bbox.x.min;
  bbox.y.size = bbox.y.max - bbox.y.min;
  if (bbox.z) {
    bbox.z.size = bbox.z.max - bbox.z.min;
  }
};

const pairiteration = function (c1, c2, curveIntersectionThreshold) {
  const c1b = c1.bbox(),
    c2b = c2.bbox(),
    r = 100000,
    threshold = curveIntersectionThreshold || 0.5;

  if (
    c1b.x.size + c1b.y.size < threshold &&
    c2b.x.size + c2b.y.size < threshold
  ) {
    return [
      (((r * (c1._t1 + c1._t2)) / 2) | 0) / r +
        "/" +
        (((r * (c2._t1 + c2._t2)) / 2) | 0) / r,
    ];
  }

  let cc1 = c1.split(0.5),
    cc2 = c2.split(0.5),
    pairs = [
      { left: cc1.left, right: cc2.left },
      { left: cc1.left, right: cc2.right },
      { left: cc1.right, right: cc2.right },
      { left: cc1.right, right: cc2.left },
    ];

  pairs = pairs.filter(function (pair) {
    return bboxoverlap(pair.left.bbox(), pair.right.bbox());
  });

  let results = [];

  if (pairs.length === 0) return results;

  pairs.forEach(function (pair) {
    results = results.concat(pairiteration(pair.left, pair.right, threshold));
  });

  results = results.filter(function (v, i) {
    return results.indexOf(v) === i;
  });

  return results;
};

const getccenter = function (p1, p2, p3) {
  const dx1 = p2.x - p1.x,
    dy1 = p2.y - p1.y,
    dx2 = p3.x - p2.x,
    dy2 = p3.y - p2.y,
    dx1p = dx1 * cos(quart) - dy1 * sin(quart),
    dy1p = dx1 * sin(quart) + dy1 * cos(quart),
    dx2p = dx2 * cos(quart) - dy2 * sin(quart),
    dy2p = dx2 * sin(quart) + dy2 * cos(quart),
    // chord midpoints
    mx1 = (p1.x + p2.x) / 2,
    my1 = (p1.y + p2.y) / 2,
    mx2 = (p2.x + p3.x) / 2,
    my2 = (p2.y + p3.y) / 2,
    // midpoint offsets
    mx1n = mx1 + dx1p,
    my1n = my1 + dy1p,
    mx2n = mx2 + dx2p,
    my2n = my2 + dy2p,
    // intersection of these lines:
    arc = lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n),
    r = dist(arc, p1);

  // arc start/end values, over mid point:
  let s = atan2(p1.y - arc.y, p1.x - arc.x),
    m = atan2(p2.y - arc.y, p2.x - arc.x),
    e = atan2(p3.y - arc.y, p3.x - arc.x),
    _;

  // determine arc direction (cw/ccw correction)
  if (s < e) {
    // if s<m<e, arc(s, e)
    // if m<s<e, arc(e, s + tau)
    // if s<e<m, arc(e, s + tau)
    if (s > m || m > e) {
      s += tau;
    }
    if (s > e) {
      _ = e;
      e = s;
      s = _;
    }
  } else {
    // if e<m<s, arc(e, s)
    // if m<e<s, arc(s, e + tau)
    // if e<s<m, arc(s, e + tau)
    if (e < m && m < s) {
      _ = e;
      e = s;
      s = _;
    } else {
      e += tau;
    }
  }
  // assign and done.
  arc.s = s;
  arc.e = e;
  arc.r = r;
  return arc;
};

const findbbox = function (sections) {
  let mx = nMax,
    my = nMax,
    MX = nMin,
    MY = nMin;
  sections.forEach(function (s) {
    const bbox = s.bbox();
    if (mx > bbox.x.min) mx = bbox.x.min;
    if (my > bbox.y.min) my = bbox.y.min;
    if (MX < bbox.x.max) MX = bbox.x.max;
    if (MY < bbox.y.max) MY = bbox.y.max;
  });
  return {
    x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
    y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my },
  };
};

const shapeintersections = function (
  s1,
  bbox1,
  s2,
  bbox2,
  curveIntersectionThreshold
) {
  if (!bboxoverlap(bbox1, bbox2)) return [];
  const intersections = [];
  const a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
  const a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
  a1.forEach(function (l1) {
    if (l1.virtual) return;
    a2.forEach(function (l2) {
      if (l2.virtual) return;
      const iss = l1.intersects(l2, curveIntersectionThreshold);
      if (iss.length > 0) {
        iss.c1 = l1;
        iss.c2 = l2;
        iss.s1 = s1;
        iss.s2 = s2;
        intersections.push(iss);
      }
    });
  });
  return intersections;
};

const getminmax = function (curve, d, list) {
  if (!list) return { min: 0, max: 0 };
  let min = nMax,
    max = nMin,
    t,
    c;
  if (list.indexOf(0) === -1) {
    list = [0].concat(list);
  }
  if (list.indexOf(1) === -1) {
    list.push(1);
  }
  for (let i = 0, len = list.length; i < len; i++) {
    t = list[i];
    c = curve.get(t);
    if (c[d] < min) {
      min = c[d];
    }
    if (c[d] > max) {
      max = c[d];
    }
  }
  return { min: min, mid: (min + max) / 2, max: max, size: max - min };
};

export {
  bboxoverlap,
  expandbox,
  pairiteration,
  getccenter,
  findbbox,
  shapeintersections,
  getminmax,
};
