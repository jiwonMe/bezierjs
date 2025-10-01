import { sqrt } from "../utils/constants.js";
import { utils } from "../utils.js";
import { PolyBezier } from "./poly-bezier.js";
import { KirbError, ErrorCodes } from "../utils/errors.js";

const offsetMethods = {
  /**
   * Get an offset point at parameter t
   * @param {number} t - Parameter value (0-1)
   * @param {number} distance - Offset distance
   * @returns {Object} Offset point with metadata
   */
  offsetPoint(t, distance) {
    if (t < 0 || t > 1) {
      throw new KirbError(
        `Parameter t must be between 0 and 1, got ${t}`,
        ErrorCodes.OUT_OF_RANGE,
        { t, validRange: [0, 1] }
      );
    }

    const c = this.get(t);
    const n = this.normal(t);
    const result = {
      point: {
        x: c.x + n.x * distance,
        y: c.y + n.y * distance,
      },
      normal: n,
      curve: c,
      t: t,
      distance: distance,
    };

    if (this._3d) {
      result.point.z = c.z + n.z * distance;
    }

    return result;
  },

  /**
   * Create offset curve(s)
   * @param {number} distance - Offset distance
   * @returns {Array} Array of Bezier curves
   */
  offsetCurve(distance) {
    if (this._linear) {
      const nv = this.normal(0);
      const coords = this.points.map(function (p) {
        const ret = {
          x: p.x + distance * nv.x,
          y: p.y + distance * nv.y,
        };
        if (p.z && nv.z) {
          ret.z = p.z + distance * nv.z;
        }
        return ret;
      });
      return [new this.constructor(coords)];
    }

    return this.reduce().map(function (s) {
      if (s._linear) {
        return s.offsetCurve(distance)[0];
      }
      return s.scale(distance);
    });
  },

  /**
   * Get offset point or curve (legacy method)
   * @deprecated Use offsetPoint() or offsetCurve() instead
   * @param {number} t - Parameter or distance
   * @param {number} d - Distance (optional)
   * @returns {Object|Array} Offset point or curves
   */
  offset(t, d) {
    if (typeof d !== "undefined") {
      return this.offsetPoint(t, d);
    }
    return this.offsetCurve(t);
  },

  translate(v, d1, d2) {
    d2 = typeof d2 === "number" ? d2 : d1;

    // TODO: make this take curves with control points outside
    //       of the start-end interval into account

    const o = this.order;
    let d = this.points.map((_, i) => (1 - i / o) * d1 + (i / o) * d2);
    return new this.constructor(
      this.points.map((p, i) => ({
        x: p.x + v.x * d[i],
        y: p.y + v.y * d[i],
      }))
    );
  },

  scale(d) {
    const order = this.order;
    let distanceFn = false;
    if (typeof d === "function") {
      distanceFn = d;
    }
    if (distanceFn && order === 2) {
      return this.raise().scale(distanceFn);
    }

    // TODO: add special handling for non-linear degenerate curves.

    const clockwise = this.clockwise;
    const points = this.points;

    if (this._linear) {
      return this.translate(
        this.normal(0),
        distanceFn ? distanceFn(0) : d,
        distanceFn ? distanceFn(1) : d
      );
    }

    const r1 = distanceFn ? distanceFn(0) : d;
    const r2 = distanceFn ? distanceFn(1) : d;
    const v = [this.offsetPoint(0, 10), this.offsetPoint(1, 10)];
    const np = [];
    const o = utils.lli4(v[0].point, v[0].curve, v[1].point, v[1].curve);

    if (!o) {
      throw new KirbError("Cannot scale this curve", ErrorCodes.INVALID_CURVE, {
        suggestion: "Try reducing the curve first using reduce()",
        curve: this,
      });
    }

    // move all points by distance 'd' wrt the origin 'o',
    // and move end points by fixed distance along normal.
    [0, 1].forEach(function (t) {
      const p = (np[t * order] = utils.copy(points[t * order]));
      p.x += (t ? r2 : r1) * v[t].normal.x;
      p.y += (t ? r2 : r1) * v[t].normal.y;
    });

    if (!distanceFn) {
      // move control points to lie on the intersection of the offset
      // derivative vector, and the origin-through-control vector
      [0, 1].forEach((t) => {
        if (order === 2 && !!t) return;
        const p = np[t * order];
        const d = this.derivative(t);
        const p2 = { x: p.x + d.x, y: p.y + d.y };
        np[t + 1] = utils.lli4(p, p2, o, points[t + 1]);
      });
      return new this.constructor(np);
    }

    // move control points by "however much necessary to
    // ensure the correct tangent to endpoint".
    [0, 1].forEach(function (t) {
      if (order === 2 && !!t) return;
      var p = points[t + 1];
      var ov = {
        x: p.x - o.x,
        y: p.y - o.y,
      };
      var rc = distanceFn ? distanceFn((t + 1) / order) : d;
      if (distanceFn && !clockwise) rc = -rc;
      var m = sqrt(ov.x * ov.x + ov.y * ov.y);
      ov.x /= m;
      ov.y /= m;
      np[t + 1] = {
        x: p.x + rc * ov.x,
        y: p.y + rc * ov.y,
      };
    });
    return new this.constructor(np);
  },

  outline(d1, d2, d3, d4) {
    d2 = d2 === undefined ? d1 : d2;

    if (this._linear) {
      // TODO: find the actual extrema, because they might
      //       be before the start, or past the end.

      const n = this.normal(0);
      const start = this.points[0];
      const end = this.points[this.points.length - 1];
      let s, mid, e;

      if (d3 === undefined) {
        d3 = d1;
        d4 = d2;
      }

      s = { x: start.x + n.x * d1, y: start.y + n.y * d1 };
      e = { x: end.x + n.x * d3, y: end.y + n.y * d3 };
      mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
      const fline = [s, mid, e];

      s = { x: start.x - n.x * d2, y: start.y - n.y * d2 };
      e = { x: end.x - n.x * d4, y: end.y - n.y * d4 };
      mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
      const bline = [e, mid, s];

      const ls = utils.makeline(bline[2], fline[0]);
      const le = utils.makeline(fline[2], bline[0]);
      const segments = [
        ls,
        new this.constructor(fline),
        le,
        new this.constructor(bline),
      ];
      return new PolyBezier(segments);
    }

    const reduced = this.reduce(),
      len = reduced.length,
      fcurves = [];

    let bcurves = [],
      p,
      alen = 0,
      tlen = this.length();

    const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";

    function linearDistanceFunction(s, e, tlen, alen, slen) {
      return function (v) {
        const f1 = alen / tlen,
          f2 = (alen + slen) / tlen,
          d = e - s;
        return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
      };
    }

    // form curve oulines
    reduced.forEach(function (segment) {
      const slen = segment.length();
      if (graduated) {
        fcurves.push(
          segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen))
        );
        bcurves.push(
          segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen))
        );
      } else {
        fcurves.push(segment.scale(d1));
        bcurves.push(segment.scale(-d2));
      }
      alen += slen;
    });

    // reverse the "return" outline
    bcurves = bcurves
      .map(function (s) {
        p = s.points;
        if (p[3]) {
          s.points = [p[3], p[2], p[1], p[0]];
        } else {
          s.points = [p[2], p[1], p[0]];
        }
        return s;
      })
      .reverse();

    // form the endcaps as lines
    const fs = fcurves[0].points[0],
      fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1],
      bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1],
      be = bcurves[0].points[0],
      ls = utils.makeline(bs, fs),
      le = utils.makeline(fe, be),
      segments = [ls].concat(fcurves).concat([le]).concat(bcurves);

    return new PolyBezier(segments);
  },

  outlineshapes(d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    const outline = this.outline(d1, d2).curves;
    const shapes = [];
    for (let i = 1, len = outline.length; i < len / 2; i++) {
      const shape = utils.makeshape(
        outline[i],
        outline[len - i],
        curveIntersectionThreshold
      );
      shape.startcap.virtual = i > 1;
      shape.endcap.virtual = i < len / 2 - 1;
      shapes.push(shape);
    }
    return shapes;
  },
};

export { offsetMethods };
