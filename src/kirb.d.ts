// Type definitions for kirb
// Project: https://github.com/jiwonMe/kirb
// Definitions by: jiwonMe

/**
 * Point in 2D space
 */
export interface Point2D {
  x: number;
  y: number;
  t?: number;
}

/**
 * Point in 3D space
 */
export interface Point3D extends Point2D {
  z: number;
}

export type Point = Point2D | Point3D;

/**
 * 1D bounding box
 */
export interface BoundingBox1D {
  min: number;
  mid: number;
  max: number;
  size: number;
}

/**
 * 2D bounding box
 */
export interface BoundingBox2D {
  x: BoundingBox1D;
  y: BoundingBox1D;
}

/**
 * 3D bounding box
 */
export interface BoundingBox3D extends BoundingBox2D {
  z: BoundingBox1D;
}

export type BoundingBox = BoundingBox2D | BoundingBox3D;

/**
 * Extrema result
 */
export interface Extrema {
  x?: number[];
  y?: number[];
  z?: number[];
  values: number[];
}

/**
 * Split result
 */
export interface SplitResult {
  left: Bezier;
  right: Bezier;
  span: Point[];
}

/**
 * ABC calculation result
 */
export interface ABCResult {
  A: Point;
  B: Point;
  C: Point;
  S: Point;
  E: Point;
}

/**
 * Offset point result
 */
export interface OffsetPointResult {
  point: Point;
  normal: Point;
  curve: Point;
  t: number;
  distance: number;
}

/**
 * Find parameter result
 */
export interface FindParameterResult {
  t: number;
  hits: Point[];
  tolerance: number;
}

/**
 * Closest point result
 */
export interface ClosestPointResult {
  point: Point;
  t: number;
  distance: number;
}

/**
 * Curve information
 */
export interface CurveInfo {
  order: number;
  type: "linear" | "quadratic" | "cubic" | string;
  is3D: boolean;
  isLinear: boolean;
  pointCount: number;
  length: number;
  bbox: BoundingBox;
  extrema: Extrema;
}

/**
 * Arc approximation result
 */
export interface Arc {
  x: number;
  y: number;
  r: number;
  s: number;
  e: number;
  interval: {
    start: number;
    end: number;
  };
}

/**
 * Line segment
 */
export interface Line {
  p1: Point;
  p2: Point;
}

/**
 * Curvature result
 */
export interface CurvatureResult {
  k: number;
  r: number;
  dk?: number;
  adk?: number;
}

/**
 * Options for findParameter method
 */
export interface FindParameterOptions {
  tolerance?: number;
}

/**
 * Options for contains method
 */
export interface ContainsOptions {
  tolerance?: number;
}

/**
 * Main Bezier curve class
 */
export class Bezier {
  // Properties
  points: Point[];
  order: number;
  dims: string[];
  dimlen: number;
  dpoints: Point[][];
  ratios?: number[];
  clockwise: boolean;

  readonly _3d: boolean;
  readonly _linear: boolean;
  readonly _t1: number;
  readonly _t2: number;

  // Constructor
  constructor(...coords: number[]);
  constructor(points: Point[]);

  // Static methods
  static quadraticFromPoints(
    p1: Point,
    p2: Point,
    p3: Point,
    t?: number
  ): Bezier;
  static cubicFromPoints(
    S: Point,
    B: Point,
    E: Point,
    t?: number,
    d1?: number
  ): Bezier;
  static getABC(
    order: number,
    S: Point,
    B: Point,
    E: Point,
    t?: number
  ): ABCResult;
  static getUtils(): any;
  static readonly PolyBezier: typeof PolyBezier;

  // Core methods
  get(t: number): Point;
  point(idx: number): Point;
  compute(t: number): Point;
  derivative(t: number): Point;
  dderivative(t: number): Point;
  length(): number;

  // LUT and lookup
  getLUT(steps?: number): Point[];
  project(point: Point): Point & { t: number; d: number };

  // New methods
  findParameter(
    point: Point,
    options?: FindParameterOptions
  ): FindParameterResult | null;
  closestPoint(point: Point): ClosestPointResult;
  sample(count?: number): Point[];
  getInfo(): CurveInfo;
  contains(point: Point, options?: ContainsOptions): boolean;

  // Legacy methods
  on(point: Point, error?: number): number | false;

  // Geometric operations
  bbox(): BoundingBox;
  extrema(): Extrema;
  hull(t: number): Point[];
  normal(t: number): Point;
  inflections(): number[];
  curvature(t: number): CurvatureResult;

  // Transformations
  align(): Bezier;
  raise(): Bezier;
  split(t1: number, t2?: number): SplitResult;
  reduce(): Bezier[];

  // Offset and scaling
  offsetPoint(t: number, distance: number): OffsetPointResult;
  offsetCurve(distance: number): Bezier[];
  offset(t: number, d?: number): OffsetPointResult | Bezier[];
  translate(v: Point, d1: number, d2?: number): Bezier;
  scale(d: number | ((t: number) => number)): Bezier;
  outline(d1: number, d2?: number, d3?: number, d4?: number): PolyBezier;
  outlineshapes(
    d1: number,
    d2?: number,
    curveIntersectionThreshold?: number
  ): any[];

  // Intersections
  intersects(
    curve?: Bezier | Line,
    curveIntersectionThreshold?: number
  ): string[] | number[];
  lineIntersects(line: Line): number[];
  selfintersects(curveIntersectionThreshold?: number): string[];
  overlaps(curve: Bezier): boolean;

  // Analysis
  simple(): boolean;
  arcs(errorThreshold?: number): Arc[];

  // Utilities
  getUtils(): any;
  getABC(t: number, B?: Point): ABCResult;
  setRatios(ratios: number[]): void;

  // Serialization
  valueOf(): string;
  toString(): string;
  toSVG(): string | false;

  // Internal
  verify(): void;
  update(): void;
}

/**
 * PolyBezier - Multiple connected Bezier curves
 */
export class PolyBezier {
  curves: Bezier[];
  readonly _3d: boolean;

  constructor(curves?: Bezier[]);

  valueOf(): string;
  toString(): string;
  addCurve(curve: Bezier): void;
  length(): number;
  curve(idx: number): Bezier;
  bbox(): BoundingBox;
  offset(d: number): PolyBezier;
}

/**
 * Custom error class
 */
export class KirbError extends Error {
  readonly code: string;
  readonly details: Record<string, any>;

  constructor(message: string, code: string, details?: Record<string, any>);
}

/**
 * Error codes
 */
export const ErrorCodes: {
  readonly INVALID_CURVE: "INVALID_CURVE";
  readonly INVALID_PARAMETER: "INVALID_PARAMETER";
  readonly OUT_OF_RANGE: "OUT_OF_RANGE";
  readonly COMPUTATION_FAILED: "COMPUTATION_FAILED";
  readonly INVALID_INPUT: "INVALID_INPUT";
};

export type ErrorCodeType = (typeof ErrorCodes)[keyof typeof ErrorCodes];
