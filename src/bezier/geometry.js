import { abs, acos, sqrt, pi } from "../utils/constants.js";
import { utils } from "../utils.js";

const geometryMethods = {
  align() {
    let p = this.points;
    return new this.constructor(
      utils.align(p, { p1: p[0], p2: p[p.length - 1] })
    );
  },

  normal(t) {
    return this._3d ? this.__normal3(t) : this.__normal2(t);
  },

  __normal2(t) {
    const d = this.derivative(t);
    const q = sqrt(d.x * d.x + d.y * d.y);
    return { t, x: -d.y / q, y: d.x / q };
  },

  __normal3(t) {
    // see http://stackoverflow.com/questions/25453159
    const r1 = this.derivative(t),
      r2 = this.derivative(t + 0.01),
      q1 = sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z),
      q2 = sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
    r1.x /= q1;
    r1.y /= q1;
    r1.z /= q1;
    r2.x /= q2;
    r2.y /= q2;
    r2.z /= q2;
    // cross product
    const c = {
      x: r2.y * r1.z - r2.z * r1.y,
      y: r2.z * r1.x - r2.x * r1.z,
      z: r2.x * r1.y - r2.y * r1.x,
    };
    const m = sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
    c.x /= m;
    c.y /= m;
    c.z /= m;
    // rotation matrix
    const R = [
      c.x * c.x,
      c.x * c.y - c.z,
      c.x * c.z + c.y,
      c.x * c.y + c.z,
      c.y * c.y,
      c.y * c.z - c.x,
      c.x * c.z - c.y,
      c.y * c.z + c.x,
      c.z * c.z,
    ];
    // normal vector:
    const n = {
      t,
      x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
      y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
      z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z,
    };
    return n;
  },

  hull(t) {
    let p = this.points,
      _p = [],
      q = [],
      idx = 0;
    q[idx++] = p[0];
    q[idx++] = p[1];
    q[idx++] = p[2];
    if (this.order === 3) {
      q[idx++] = p[3];
    }
    // we lerp between all points at each iteration, until we have 1 point left.
    while (p.length > 1) {
      _p = [];
      for (let i = 0, pt, l = p.length - 1; i < l; i++) {
        pt = utils.lerp(t, p[i], p[i + 1]);
        q[idx++] = pt;
        _p.push(pt);
      }
      p = _p;
    }
    return q;
  },

  split(t1, t2) {
    // shortcuts
    if (t1 === 0 && !!t2) {
      return this.split(t2).left;
    }
    if (t2 === 1) {
      return this.split(t1).right;
    }

    // no shortcut: use "de Casteljau" iteration.
    const q = this.hull(t1);
    const result = {
      left:
        this.order === 2
          ? new this.constructor([q[0], q[3], q[5]])
          : new this.constructor([q[0], q[4], q[7], q[9]]),
      right:
        this.order === 2
          ? new this.constructor([q[5], q[4], q[2]])
          : new this.constructor([q[9], q[8], q[6], q[3]]),
      span: q,
    };

    // make sure we bind _t1/_t2 information!
    result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
    result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);

    // if we have no t2, we're done
    if (!t2) {
      return result;
    }

    // if we have a t2, split again:
    t2 = utils.map(t2, t1, 1, 0, 1);
    return result.right.split(t2).left;
  },

  simple() {
    if (this.order === 3) {
      const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
      const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
      if ((a1 > 0 && a2 < 0) || (a1 < 0 && a2 > 0)) return false;
    }
    const n1 = this.normal(0);
    const n2 = this.normal(1);
    let s = n1.x * n2.x + n1.y * n2.y;
    if (this._3d) {
      s += n1.z * n2.z;
    }
    return abs(acos(s)) < pi / 3;
  },

  reduce() {
    // TODO: examine these var types in more detail...
    let i,
      t1 = 0,
      t2 = 0,
      step = 0.01,
      segment,
      pass1 = [],
      pass2 = [];
    // first pass: split on extrema
    let extrema = this.extrema().values;
    if (extrema.indexOf(0) === -1) {
      extrema = [0].concat(extrema);
    }
    if (extrema.indexOf(1) === -1) {
      extrema.push(1);
    }

    for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
      t2 = extrema[i];
      segment = this.split(t1, t2);
      segment._t1 = t1;
      segment._t2 = t2;
      pass1.push(segment);
      t1 = t2;
    }

    // second pass: further reduce these segments to simple segments
    pass1.forEach(function (p1) {
      t1 = 0;
      t2 = 0;
      while (t2 <= 1) {
        for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
          segment = p1.split(t1, t2);
          if (!segment.simple()) {
            t2 -= step;
            if (abs(t1 - t2) < step) {
              // we can never form a reduction
              return [];
            }
            segment = p1.split(t1, t2);
            segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
            segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
            pass2.push(segment);
            t1 = t2;
            break;
          }
        }
      }
      if (t1 < 1) {
        segment = p1.split(t1, 1);
        segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
        segment._t2 = p1._t2;
        pass2.push(segment);
      }
    });
    return pass2;
  },
};

export { geometryMethods };
