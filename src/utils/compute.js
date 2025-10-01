import { sqrt, Tvalues, Cvalues, ZERO } from "./constants.js";

const arcfn = function (t, derivativeFn) {
  const d = derivativeFn(t);
  let l = d.x * d.x + d.y * d.y;
  if (typeof d.z !== "undefined") {
    l += d.z * d.z;
  }
  return sqrt(l);
};

const compute = function (t, points, _3d) {
  // shortcuts
  if (t === 0) {
    points[0].t = 0;
    return points[0];
  }

  const order = points.length - 1;

  if (t === 1) {
    points[order].t = 1;
    return points[order];
  }

  const mt = 1 - t;
  let p = points;

  // constant?
  if (order === 0) {
    points[0].t = t;
    return points[0];
  }

  // linear?
  if (order === 1) {
    const ret = {
      x: mt * p[0].x + t * p[1].x,
      y: mt * p[0].y + t * p[1].y,
      t: t,
    };
    if (_3d) {
      ret.z = mt * p[0].z + t * p[1].z;
    }
    return ret;
  }

  // quadratic/cubic curve?
  if (order < 4) {
    let mt2 = mt * mt,
      t2 = t * t,
      a,
      b,
      c,
      d = 0;
    if (order === 2) {
      p = [p[0], p[1], p[2], ZERO];
      a = mt2;
      b = mt * t * 2;
      c = t2;
    } else if (order === 3) {
      a = mt2 * mt;
      b = mt2 * t * 3;
      c = mt * t2 * 3;
      d = t * t2;
    }
    const ret = {
      x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
      y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
      t: t,
    };
    if (_3d) {
      ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
    }
    return ret;
  }

  // higher order curves: use de Casteljau's computation
  const dCpts = JSON.parse(JSON.stringify(points));
  while (dCpts.length > 1) {
    for (let i = 0; i < dCpts.length - 1; i++) {
      dCpts[i] = {
        x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t,
        y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t,
      };
      if (typeof dCpts[i].z !== "undefined") {
        dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t;
      }
    }
    dCpts.splice(dCpts.length - 1, 1);
  }
  dCpts[0].t = t;
  return dCpts[0];
};

const computeWithRatios = function (t, points, ratios, _3d) {
  const mt = 1 - t,
    r = ratios,
    p = points;

  let f1 = r[0],
    f2 = r[1],
    f3 = r[2],
    f4 = r[3],
    d;

  // spec for linear
  f1 *= mt;
  f2 *= t;

  if (p.length === 2) {
    d = f1 + f2;
    return {
      x: (f1 * p[0].x + f2 * p[1].x) / d,
      y: (f1 * p[0].y + f2 * p[1].y) / d,
      z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
      t: t,
    };
  }

  // upgrade to quadratic
  f1 *= mt;
  f2 *= 2 * mt;
  f3 *= t * t;

  if (p.length === 3) {
    d = f1 + f2 + f3;
    return {
      x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
      y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
      z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
      t: t,
    };
  }

  // upgrade to cubic
  f1 *= mt;
  f2 *= 1.5 * mt;
  f3 *= 3 * mt;
  f4 *= t * t * t;

  if (p.length === 4) {
    d = f1 + f2 + f3 + f4;
    return {
      x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
      y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
      z: !_3d
        ? false
        : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
      t: t,
    };
  }
};

const derive = function (points, _3d) {
  const dpoints = [];
  for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
    const list = [];
    for (let j = 0, dpt; j < c; j++) {
      dpt = {
        x: c * (p[j + 1].x - p[j].x),
        y: c * (p[j + 1].y - p[j].y),
      };
      if (_3d) {
        dpt.z = c * (p[j + 1].z - p[j].z);
      }
      list.push(dpt);
    }
    dpoints.push(list);
    p = list;
  }
  return dpoints;
};

const length = function (derivativeFn) {
  const z = 0.5,
    len = Tvalues.length;

  let sum = 0;

  for (let i = 0, t; i < len; i++) {
    t = z * Tvalues[i] + z;
    sum += Cvalues[i] * arcfn(t, derivativeFn);
  }
  return z * sum;
};

export { arcfn, compute, computeWithRatios, derive, length };
