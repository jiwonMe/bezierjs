import { abs, ZERO } from "../utils/constants.js";
import { utils } from "../utils.js";
import { PolyBezier } from "./poly-bezier.js";

/**
 * Bezier curve constructor.
 *
 * ...docs pending...
 */
class BezierCore {
  constructor(coords) {
    let args =
      coords && coords.forEach ? coords : Array.from(arguments).slice();
    let coordlen = false;

    if (typeof args[0] === "object") {
      coordlen = args.length;
      const newargs = [];
      args.forEach(function (point) {
        ["x", "y", "z"].forEach(function (d) {
          if (typeof point[d] !== "undefined") {
            newargs.push(point[d]);
          }
        });
      });
      args = newargs;
    }

    let higher = false;
    const len = args.length;

    if (coordlen) {
      if (coordlen > 4) {
        if (arguments.length !== 1) {
          throw new Error(
            "Only new Bezier(point[]) is accepted for 4th and higher order curves"
          );
        }
        higher = true;
      }
    } else {
      if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
        if (arguments.length !== 1) {
          throw new Error(
            "Only new Bezier(point[]) is accepted for 4th and higher order curves"
          );
        }
      }
    }

    const _3d = (this._3d =
      (!higher && (len === 9 || len === 12)) ||
      (coords && coords[0] && typeof coords[0].z !== "undefined"));

    const points = (this.points = []);
    for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
      var point = {
        x: args[idx],
        y: args[idx + 1],
      };
      if (_3d) {
        point.z = args[idx + 2];
      }
      points.push(point);
    }
    const order = (this.order = points.length - 1);

    const dims = (this.dims = ["x", "y"]);
    if (_3d) dims.push("z");
    this.dimlen = dims.length;

    // is this curve, practically speaking, a straight line?
    const aligned = utils.align(points, { p1: points[0], p2: points[order] });
    const baselength = utils.dist(points[0], points[order]);
    this._linear = aligned.reduce((t, p) => t + abs(p.y), 0) < baselength / 50;

    this._lut = [];
    this._t1 = 0;
    this._t2 = 1;
    this.update();
  }

  /**
   * Create a quadratic Bezier from three points
   * @param {Object} p1 - Start point
   * @param {Object} p2 - Mid point
   * @param {Object} p3 - End point
   * @param {number} t - Parameter value (default: 0.5)
   * @returns {Bezier} New quadratic Bezier curve
   */
  static quadraticFromPoints(p1, p2, p3, t = 0.5) {
    // shortcuts, although they're really dumb
    if (t === 0) {
      return new this(p2, p2, p3);
    }
    if (t === 1) {
      return new this(p1, p2, p2);
    }
    // real fitting.
    const abc = this.getABC(2, p1, p2, p3, t);
    return new this(p1, abc.A, p3);
  }

  /**
   * Create a cubic Bezier from three points
   * @param {Object} S - Start point
   * @param {Object} B - Mid point
   * @param {Object} E - End point
   * @param {number} t - Parameter value (default: 0.5)
   * @param {number} d1 - Distance (optional)
   * @returns {Bezier} New cubic Bezier curve
   */
  static cubicFromPoints(S, B, E, t = 0.5, d1) {
    const abc = this.getABC(3, S, B, E, t);
    if (typeof d1 === "undefined") {
      d1 = utils.dist(B, abc.C);
    }
    const d2 = (d1 * (1 - t)) / t;

    const selen = utils.dist(S, E),
      lx = (E.x - S.x) / selen,
      ly = (E.y - S.y) / selen,
      bx1 = d1 * lx,
      by1 = d1 * ly,
      bx2 = d2 * lx,
      by2 = d2 * ly;
    // derivation of new hull coordinates
    const e1 = { x: B.x - bx1, y: B.y - by1 },
      e2 = { x: B.x + bx2, y: B.y + by2 },
      A = abc.A,
      v1 = { x: A.x + (e1.x - A.x) / (1 - t), y: A.y + (e1.y - A.y) / (1 - t) },
      v2 = { x: A.x + (e2.x - A.x) / t, y: A.y + (e2.y - A.y) / t },
      nc1 = { x: S.x + (v1.x - S.x) / t, y: S.y + (v1.y - S.y) / t },
      nc2 = {
        x: E.x + (v2.x - E.x) / (1 - t),
        y: E.y + (v2.y - E.y) / (1 - t),
      };
    // ...done
    return new this(S, nc1, nc2, E);
  }

  static getUtils() {
    return utils;
  }

  getUtils() {
    return utils;
  }

  static get PolyBezier() {
    return PolyBezier;
  }

  valueOf() {
    return this.toString();
  }

  toString() {
    return utils.pointsToString(this.points);
  }

  toSVG() {
    if (this._3d) return false;
    const p = this.points,
      x = p[0].x,
      y = p[0].y,
      s = ["M", x, y, this.order === 2 ? "Q" : "C"];
    for (let i = 1, last = p.length; i < last; i++) {
      s.push(p[i].x);
      s.push(p[i].y);
    }
    return s.join(" ");
  }

  setRatios(ratios) {
    if (ratios.length !== this.points.length) {
      throw new Error("incorrect number of ratio values");
    }
    this.ratios = ratios;
    this._lut = []; //  invalidate any precomputed LUT
  }

  verify() {
    const print = this.coordDigest();
    if (print !== this._print) {
      this._print = print;
      this.update();
    }
  }

  coordDigest() {
    return this.points
      .map(function (c, pos) {
        return "" + pos + c.x + c.y + (c.z ? c.z : 0);
      })
      .join("");
  }

  update() {
    // invalidate any precomputed LUT
    this._lut = [];
    this.dpoints = utils.derive(this.points, this._3d);
    this.computedirection();
  }

  computedirection() {
    const points = this.points;
    const angle = utils.angle(points[0], points[this.order], points[1]);
    this.clockwise = angle > 0;
  }

  length() {
    return utils.length(this.derivative.bind(this));
  }

  static getABC(order = 2, S, B, E, t = 0.5) {
    const u = utils.projectionratio(t, order),
      um = 1 - u,
      C = {
        x: u * S.x + um * E.x,
        y: u * S.y + um * E.y,
      },
      s = utils.abcratio(t, order),
      A = {
        x: B.x + (B.x - C.x) / s,
        y: B.y + (B.y - C.y) / s,
      };
    return { A, B, C, S, E };
  }

  getABC(t, B) {
    B = B || this.get(t);
    let S = this.points[0];
    let E = this.points[this.order];
    return this.constructor.getABC(this.order, S, B, E, t);
  }

  get(t) {
    return this.compute(t);
  }

  point(idx) {
    return this.points[idx];
  }

  compute(t) {
    if (this.ratios) {
      return utils.computeWithRatios(t, this.points, this.ratios, this._3d);
    }
    return utils.compute(t, this.points, this._3d, this.ratios);
  }

  raise() {
    const p = this.points,
      np = [p[0]],
      k = p.length;
    for (let i = 1, pi, pim; i < k; i++) {
      pi = p[i];
      pim = p[i - 1];
      np[i] = {
        x: ((k - i) / k) * pi.x + (i / k) * pim.x,
        y: ((k - i) / k) * pi.y + (i / k) * pim.y,
      };
    }
    np[k] = p[k - 1];
    return new this.constructor(np);
  }

  derivative(t) {
    return utils.compute(t, this.dpoints[0], this._3d);
  }

  dderivative(t) {
    return utils.compute(t, this.dpoints[1], this._3d);
  }

  curvature(t) {
    return utils.curvature(t, this.dpoints[0], this.dpoints[1], this._3d);
  }

  inflections() {
    return utils.inflections(this.points);
  }
}

export { BezierCore };
