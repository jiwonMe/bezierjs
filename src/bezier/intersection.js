import { min, max } from "../utils/constants.js";
import { utils } from "../utils.js";

const intersectionMethods = {
  intersects(curve, curveIntersectionThreshold) {
    if (!curve) return this.selfintersects(curveIntersectionThreshold);
    if (curve.p1 && curve.p2) {
      return this.lineIntersects(curve);
    }
    if (
      curve.constructor.name === "Bezier" ||
      curve instanceof this.constructor
    ) {
      curve = curve.reduce();
    }
    return this.curveintersects(
      this.reduce(),
      curve,
      curveIntersectionThreshold
    );
  },

  lineIntersects(line) {
    const mx = min(line.p1.x, line.p2.x),
      my = min(line.p1.y, line.p2.y),
      MX = max(line.p1.x, line.p2.x),
      MY = max(line.p1.y, line.p2.y);
    return utils.roots(this.points, line).filter((t) => {
      var p = this.get(t);
      return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
    });
  },

  selfintersects(curveIntersectionThreshold) {
    // "simple" curves cannot intersect with their direct
    // neighbour, so for each segment X we check whether
    // it intersects [0:x-2][x+2:last].

    const reduced = this.reduce(),
      len = reduced.length - 2,
      results = [];

    for (let i = 0, result, left, right; i < len; i++) {
      left = reduced.slice(i, i + 1);
      right = reduced.slice(i + 2);
      result = this.curveintersects(left, right, curveIntersectionThreshold);
      results.push(...result);
    }
    return results;
  },

  curveintersects(c1, c2, curveIntersectionThreshold) {
    const pairs = [];
    // step 1: pair off any overlapping segments
    c1.forEach(function (l) {
      c2.forEach(function (r) {
        if (l.overlaps(r)) {
          pairs.push({ left: l, right: r });
        }
      });
    });
    // step 2: for each pairing, run through the convergence algorithm.
    let intersections = [];
    pairs.forEach(function (pair) {
      const result = utils.pairiteration(
        pair.left,
        pair.right,
        curveIntersectionThreshold
      );
      if (result.length > 0) {
        intersections = intersections.concat(result);
      }
    });
    return intersections;
  },
};

export { intersectionMethods };
