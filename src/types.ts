/**
 * Core type definitions for Kirb
 */

// Point types
export interface Point2D {
  x: number;
  y: number;
  t?: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export type Point = Point2D | Point3D;

// Bounding box
export interface BoundingBox1D {
  min: number;
  mid: number;
  max: number;
  size: number;
}

export interface BoundingBox2D {
  x: BoundingBox1D;
  y: BoundingBox1D;
}

export interface BoundingBox3D extends BoundingBox2D {
  z: BoundingBox1D;
}

export type BoundingBox = BoundingBox2D | BoundingBox3D;

// Extrema
export interface Extrema {
  x?: number[];
  y?: number[];
  z?: number[];
  values: number[];
}

// Split result
export interface SplitResult<T = any> {
  left: T;
  right: T;
  span: Point[];
}

// ABC result
export interface ABCResult {
  A: Point;
  B: Point;
  C: Point;
  S: Point;
  E: Point;
}

// Offset point result
export interface OffsetPointResult {
  point: Point;
  normal: Point;
  curve: Point;
  t: number;
  distance: number;
}

// Find parameter result
export interface FindParameterResult {
  t: number;
  hits: Point[];
  tolerance: number;
}

// Closest point result
export interface ClosestPointResult {
  point: Point;
  t: number;
  distance: number;
}

// Curve info
export type CurveType = "linear" | "quadratic" | "cubic" | string;

export interface CurveInfo {
  order: number;
  type: CurveType;
  is3D: boolean;
  isLinear: boolean;
  pointCount: number;
  length: number;
  bbox: BoundingBox;
  extrema: Extrema;
}

// Arc result
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

// Line
export interface Line {
  p1: Point;
  p2: Point;
}

// Shape
export interface Shape {
  startcap: any;
  forward: any;
  back: any;
  endcap: any;
  bbox: BoundingBox;
  intersections: (s2: Shape) => any[];
}

// Options
export interface FindParameterOptions {
  tolerance?: number;
}

export interface ContainsOptions {
  tolerance?: number;
}

export interface OutlineOptions {
  inner?: number;
  outer?: number;
  start?: { inner: number; outer: number };
  end?: { inner: number; outer: number };
}

// Error codes
export enum ErrorCode {
  INVALID_CURVE = "INVALID_CURVE",
  INVALID_PARAMETER = "INVALID_PARAMETER",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  COMPUTATION_FAILED = "COMPUTATION_FAILED",
  INVALID_INPUT = "INVALID_INPUT",
}

// Curvature result
export interface CurvatureResult {
  k: number;
  r: number;
  dk?: number;
  adk?: number;
}

// Projection result
export interface ProjectionResult {
  x: number;
  y: number;
  z?: number;
  t: number;
  d: number;
}
