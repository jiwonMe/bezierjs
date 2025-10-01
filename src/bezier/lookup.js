import { utils } from "../utils.js";
import { KirbError, ErrorCodes } from "../utils/errors.js";

// LUT(Look-Up Table) 및 조회 관련 메서드들
const lookupMethods = {
  /**
   * Get Look-Up Table for the curve
   * @param {number} steps - Number of steps (default: 100)
   * @returns {Array} Array of points
   */
  getLUT(steps = 100) {
    this.verify();
    if (this._lut.length === steps + 1) {
      return this._lut;
    }
    this._lut = [];
    // n steps means n+1 points
    steps++;
    this._lut = [];
    for (let i = 0, p, t; i < steps; i++) {
      t = i / (steps - 1);
      p = this.compute(t);
      p.t = t;
      this._lut.push(p);
    }
    return this._lut;
  },

  /**
   * Find parameter t for a point on the curve (legacy method)
   * @deprecated Use findParameter() instead
   * @param {Object} point - Point to find
   * @param {number} error - Tolerance (default: 5)
   * @returns {number|false} Parameter t or false if not found
   */
  on(point, error = 5) {
    const result = this.findParameter(point, { tolerance: error });
    return result ? result.t : false;
  },

  /**
   * Find parameter t for a point on the curve
   * @param {Object} point - Point to find
   * @param {Object} options - Options
   * @param {number} options.tolerance - Tolerance (default: 5)
   * @returns {Object|null} Result object or null if not found
   */
  findParameter(point, options = {}) {
    const { tolerance = 5 } = options;
    const lut = this.getLUT();
    const hits = [];
    let totalT = 0;

    for (let i = 0, c; i < lut.length; i++) {
      c = lut[i];
      if (utils.dist(c, point) < tolerance) {
        hits.push(c);
        totalT += i / lut.length;
      }
    }

    if (hits.length === 0) {
      return null;
    }

    return {
      t: totalT / hits.length,
      hits,
      tolerance,
    };
  },

  project(point) {
    // step 1: coarse check
    const LUT = this.getLUT(),
      l = LUT.length - 1,
      closest = utils.closest(LUT, point),
      mpos = closest.mpos,
      t1 = (mpos - 1) / l,
      t2 = (mpos + 1) / l,
      step = 0.1 / l;

    // step 2: fine check
    let mdist = closest.mdist,
      t = t1,
      ft = t,
      p;
    mdist += 1;
    for (let d; t < t2 + step; t += step) {
      p = this.compute(t);
      d = utils.dist(point, p);
      if (d < mdist) {
        mdist = d;
        ft = t;
      }
    }
    ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
    p = this.compute(ft);
    p.t = ft;
    p.d = mdist;
    return p;
  },

  bbox() {
    const extrema = this.extrema(),
      result = {};
    this.dims.forEach(
      function (d) {
        result[d] = utils.getminmax(this, d, extrema[d]);
      }.bind(this)
    );
    return result;
  },

  overlaps(curve) {
    const lbbox = this.bbox(),
      tbbox = curve.bbox();
    return utils.bboxoverlap(lbbox, tbbox);
  },

  extrema() {
    const result = {};
    let roots = [];

    this.dims.forEach(
      function (dim) {
        let mfn = function (v) {
          return v[dim];
        };
        let p = this.dpoints[0].map(mfn);
        result[dim] = utils.droots(p);
        if (this.order === 3) {
          p = this.dpoints[1].map(mfn);
          result[dim] = result[dim].concat(utils.droots(p));
        }
        result[dim] = result[dim].filter(function (t) {
          return t >= 0 && t <= 1;
        });
        roots = roots.concat(result[dim].sort(utils.numberSort));
      }.bind(this)
    );

    result.values = roots.sort(utils.numberSort).filter(function (v, idx) {
      return roots.indexOf(v) === idx;
    });

    return result;
  },

  /**
   * Sample n points evenly along the curve
   * @param {number} count - Number of points to sample (default: 10)
   * @returns {Array} Array of points
   */
  sample(count = 10) {
    if (count < 2) {
      throw new KirbError(
        "Sample count must be at least 2",
        ErrorCodes.INVALID_PARAMETER,
        { count }
      );
    }

    return Array.from({ length: count }, (_, i) => this.get(i / (count - 1)));
  },

  /**
   * Find the closest point on the curve to a given point
   * @param {Object} point - Target point
   * @returns {Object} Closest point info with t, distance, and point
   */
  closestPoint(point) {
    const projected = this.project(point);
    return {
      point: {
        x: projected.x,
        y: projected.y,
        ...(projected.z ? { z: projected.z } : {}),
      },
      t: projected.t,
      distance: projected.d,
    };
  },

  /**
   * Get comprehensive curve information
   * @returns {Object} Curve metadata
   */
  getInfo() {
    const typeMap = {
      1: "linear",
      2: "quadratic",
      3: "cubic",
    };

    return {
      order: this.order,
      type: typeMap[this.order] || `order-${this.order}`,
      is3D: !!this._3d,
      isLinear: !!this._linear,
      pointCount: this.points.length,
      length: this.length(),
      bbox: this.bbox(),
      extrema: this.extrema(),
    };
  },

  /**
   * Check if a point is on the curve
   * @param {Object} point - Point to check
   * @param {Object} options - Options
   * @param {number} options.tolerance - Tolerance (default: 1)
   * @returns {boolean} True if point is on curve
   */
  contains(point, options = {}) {
    const { tolerance = 1 } = options;
    const result = this.findParameter(point, { tolerance });
    return result !== null;
  },
};

export { lookupMethods };
