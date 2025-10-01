// Constants
export * from "./utils/constants.js";

// Compute functions
export * from "./utils/compute.js";

// Geometry utilities
export * from "./utils/geometry.js";

// Roots and curvature
export * from "./utils/roots.js";

// Intersection and bbox
export * from "./utils/intersection.js";

// Shape utilities
export * from "./utils/shape.js";

// Error handling
export * from "./utils/errors.js";

// Create utils object for backward compatibility
import { Tvalues, Cvalues } from "./utils/constants.js";
import {
  arcfn,
  compute,
  computeWithRatios,
  derive,
  length,
} from "./utils/compute.js";
import {
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
} from "./utils/geometry.js";
import { roots, droots, curvature, inflections } from "./utils/roots.js";
import {
  bboxoverlap,
  expandbox,
  pairiteration,
  getccenter,
  findbbox,
  shapeintersections,
  getminmax,
} from "./utils/intersection.js";
import { makeline, makeshape } from "./utils/shape.js";

const utils = {
  Tvalues,
  Cvalues,
  arcfn,
  compute,
  computeWithRatios,
  derive,
  between,
  approximately,
  length,
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
  makeline,
  findbbox,
  shapeintersections,
  makeshape,
  getminmax,
  align,
  roots,
  droots,
  curvature,
  inflections,
  bboxoverlap,
  expandbox,
  pairiteration,
  getccenter,
  numberSort,
};

export { utils };
