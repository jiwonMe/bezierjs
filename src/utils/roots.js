import { abs, acos, sqrt, pow, crt, tau } from "./constants.js";
import { compute } from "./compute.js";
import { align, approximately } from "./geometry.js";

const roots = function (points, line) {
  line = line || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };

  const order = points.length - 1;
  const aligned = align(points, line);
  const reduce = function (t) {
    return 0 <= t && t <= 1;
  };

  if (order === 2) {
    const a = aligned[0].y,
      b = aligned[1].y,
      c = aligned[2].y,
      d = a - 2 * b + c;
    if (d !== 0) {
      const m1 = -sqrt(b * b - a * c),
        m2 = -a + b,
        v1 = -(m1 + m2) / d,
        v2 = -(-m1 + m2) / d;
      return [v1, v2].filter(reduce);
    } else if (b !== c && d === 0) {
      return [(2 * b - c) / (2 * b - 2 * c)].filter(reduce);
    }
    return [];
  }

  // see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm
  const pa = aligned[0].y,
    pb = aligned[1].y,
    pc = aligned[2].y,
    pd = aligned[3].y;

  let d = -pa + 3 * pb - 3 * pc + pd,
    a = 3 * pa - 6 * pb + 3 * pc,
    b = -3 * pa + 3 * pb,
    c = pa;

  if (approximately(d, 0)) {
    // this is not a cubic curve.
    if (approximately(a, 0)) {
      // in fact, this is not a quadratic curve either.
      if (approximately(b, 0)) {
        // in fact in fact, there are no solutions.
        return [];
      }
      // linear solution:
      return [-c / b].filter(reduce);
    }
    // quadratic solution:
    const q = sqrt(b * b - 4 * a * c),
      a2 = 2 * a;
    return [(q - b) / a2, (-b - q) / a2].filter(reduce);
  }

  // at this point, we know we need a cubic solution:

  a /= d;
  b /= d;
  c /= d;

  const p = (3 * b - a * a) / 3,
    p3 = p / 3,
    q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
    q2 = q / 2,
    discriminant = q2 * q2 + p3 * p3 * p3;

  let u1, v1, x1, x2, x3;
  if (discriminant < 0) {
    const mp3 = -p / 3,
      mp33 = mp3 * mp3 * mp3,
      r = sqrt(mp33),
      t = -q / (2 * r),
      cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
      phi = acos(cosphi),
      crtr = crt(r),
      t1 = 2 * crtr;
    x1 = t1 * (tau / 3) - a / 3;
    x2 = t1 * ((phi + tau) / 3) - a / 3;
    x3 = t1 * ((phi + 2 * tau) / 3) - a / 3;
    return [x1, x2, x3].filter(reduce);
  } else if (discriminant === 0) {
    u1 = q2 < 0 ? crt(-q2) : -crt(q2);
    x1 = 2 * u1 - a / 3;
    x2 = -u1 - a / 3;
    return [x1, x2].filter(reduce);
  } else {
    const sd = sqrt(discriminant);
    u1 = crt(-q2 + sd);
    v1 = crt(q2 + sd);
    return [u1 - v1 - a / 3].filter(reduce);
  }
};

const droots = function (p) {
  // quadratic roots are easy
  if (p.length === 3) {
    const a = p[0],
      b = p[1],
      c = p[2],
      d = a - 2 * b + c;
    if (d !== 0) {
      const m1 = -sqrt(b * b - a * c),
        m2 = -a + b,
        v1 = -(m1 + m2) / d,
        v2 = -(-m1 + m2) / d;
      return [v1, v2];
    } else if (b !== c && d === 0) {
      return [(2 * b - c) / (2 * (b - c))];
    }
    return [];
  }

  // linear roots are even easier
  if (p.length === 2) {
    const a = p[0],
      b = p[1];
    if (a !== b) {
      return [a / (a - b)];
    }
    return [];
  }

  return [];
};

const curvature = function (t, d1, d2, _3d, kOnly) {
  let num,
    dnm,
    adk,
    dk,
    k = 0,
    r = 0;

  //
  // We're using the following formula for curvature:
  //
  //              x'y" - y'x"
  //   k(t) = ------------------
  //           (x'² + y'²)^(3/2)
  //
  // from https://en.wikipedia.org/wiki/Radius_of_curvature#Definition
  //
  // With it corresponding 3D counterpart:
  //
  //          sqrt( (y'z" - y"z')² + (z'x" - z"x')² + (x'y" - x"y')²)
  //   k(t) = -------------------------------------------------------
  //                     (x'² + y'² + z'²)^(3/2)
  //

  const d = compute(t, d1);
  const dd = compute(t, d2);
  const qdsum = d.x * d.x + d.y * d.y;

  if (_3d) {
    num = sqrt(
      pow(d.y * dd.z - dd.y * d.z, 2) +
        pow(d.z * dd.x - dd.z * d.x, 2) +
        pow(d.x * dd.y - dd.x * d.y, 2)
    );
    dnm = pow(qdsum + d.z * d.z, 3 / 2);
  } else {
    num = d.x * dd.y - d.y * dd.x;
    dnm = pow(qdsum, 3 / 2);
  }

  if (num === 0 || dnm === 0) {
    return { k: 0, r: 0 };
  }

  k = num / dnm;
  r = dnm / num;

  // We're also computing the derivative of kappa, because
  // there is value in knowing the rate of change for the
  // curvature along the curve. And we're just going to
  // ballpark it based on an epsilon.
  if (!kOnly) {
    // compute k'(t) based on the interval before, and after it,
    // to at least try to not introduce forward/backward pass bias.
    const pk = curvature(t - 0.001, d1, d2, _3d, true).k;
    const nk = curvature(t + 0.001, d1, d2, _3d, true).k;
    dk = (nk - k + (k - pk)) / 2;
    adk = (abs(nk - k) + abs(k - pk)) / 2;
  }

  return { k: k, r: r, dk: dk, adk: adk };
};

const inflections = function (points) {
  if (points.length < 4) return [];

  // FIXME: TODO: add in inflection abstraction for quartic+ curves?

  const p = align(points, { p1: points[0], p2: points.slice(-1)[0] }),
    a = p[2].x * p[1].y,
    b = p[3].x * p[1].y,
    c = p[1].x * p[2].y,
    d = p[3].x * p[2].y,
    v1 = 18 * (-3 * a + 2 * b + 3 * c - d),
    v2 = 18 * (3 * a - b - 3 * c),
    v3 = 18 * (c - a);

  if (approximately(v1, 0)) {
    if (!approximately(v2, 0)) {
      let t = -v3 / v2;
      if (0 <= t && t <= 1) return [t];
    }
    return [];
  }

  const d2 = 2 * v1;

  if (approximately(d2, 0)) return [];

  const trm = v2 * v2 - 4 * v1 * v3;

  if (trm < 0) return [];

  const sq = Math.sqrt(trm);

  return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function (r) {
    return 0 <= r && r <= 1;
  });
};

export { roots, droots, curvature, inflections };
