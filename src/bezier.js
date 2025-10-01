/**
  A javascript Bezier curve library by Pomax.

  Based on http://pomax.github.io/bezierinfo

  This code is MIT licensed.
**/

import { BezierCore } from "./bezier/core.js";
import { lookupMethods } from "./bezier/lookup.js";
import { geometryMethods } from "./bezier/geometry.js";
import { offsetMethods } from "./bezier/offset.js";
import { intersectionMethods } from "./bezier/intersection.js";
import { arcsMethods } from "./bezier/arcs.js";
import { setBezierClass } from "./utils/shape.js";

/**
 * Bezier curve class - combines all functionality
 */
class Bezier extends BezierCore {
  constructor(...args) {
    super(...args);
  }
}

// Add all method groups to the Bezier prototype
Object.assign(Bezier.prototype, lookupMethods);
Object.assign(Bezier.prototype, geometryMethods);
Object.assign(Bezier.prototype, offsetMethods);
Object.assign(Bezier.prototype, intersectionMethods);
Object.assign(Bezier.prototype, arcsMethods);

// Set the Bezier class for utils that need it
setBezierClass(Bezier);

export { Bezier };

