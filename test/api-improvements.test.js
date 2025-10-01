import { Bezier, KirbError, ErrorCodes } from "../src/bezier.js";

describe("API Improvements - v1.1.0", () => {
  let curve;

  beforeEach(() => {
    curve = new Bezier(0, 0, 100, 25, 200, 75, 300, 100);
  });

  describe("offsetPoint", () => {
    test("returns clear result with metadata", () => {
      const result = curve.offsetPoint(0.5, 10);

      expect(result).toHaveProperty("point");
      expect(result).toHaveProperty("normal");
      expect(result).toHaveProperty("curve");
      expect(result).toHaveProperty("t", 0.5);
      expect(result).toHaveProperty("distance", 10);

      expect(result.point).toHaveProperty("x");
      expect(result.point).toHaveProperty("y");
    });

    test("throws error for t out of range", () => {
      expect(() => {
        curve.offsetPoint(2, 10);
      }).toThrow(KirbError);

      try {
        curve.offsetPoint(-1, 10);
      } catch (e) {
        expect(e.code).toBe(ErrorCodes.OUT_OF_RANGE);
        expect(e.details).toHaveProperty("t", -1);
        expect(e.details).toHaveProperty("validRange");
      }
    });
  });

  describe("offsetCurve", () => {
    test("returns array of curves", () => {
      const result = curve.offsetCurve(10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(Bezier);
    });
  });

  describe("findParameter", () => {
    test("returns null for not found", () => {
      const result = curve.findParameter({ x: 9999, y: 9999 });
      expect(result).toBeNull();
    });

    test("returns result object when found", () => {
      const point = curve.get(0.5);
      const result = curve.findParameter(point, { tolerance: 5 });

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("t");
      expect(result).toHaveProperty("hits");
      expect(result).toHaveProperty("tolerance", 5);
      expect(result.t).toBeGreaterThanOrEqual(0);
      expect(result.t).toBeLessThanOrEqual(1);
    });
  });

  describe("sample", () => {
    test("creates even distribution of points", () => {
      const points = curve.sample(11);

      expect(points).toHaveLength(11);
      expect(points[0].t).toBe(0);
      expect(points[10].t).toBe(1);
      expect(points[5].t).toBeCloseTo(0.5, 10);
    });

    test("throws error for count < 2", () => {
      expect(() => {
        curve.sample(1);
      }).toThrow(KirbError);

      try {
        curve.sample(0);
      } catch (e) {
        expect(e.code).toBe(ErrorCodes.INVALID_PARAMETER);
      }
    });
  });

  describe("closestPoint", () => {
    test("finds closest point on curve", () => {
      const target = { x: 150, y: 60 };
      const result = curve.closestPoint(target);

      expect(result).toHaveProperty("point");
      expect(result).toHaveProperty("t");
      expect(result).toHaveProperty("distance");
      expect(result.t).toBeGreaterThanOrEqual(0);
      expect(result.t).toBeLessThanOrEqual(1);
    });
  });

  describe("getInfo", () => {
    test("returns comprehensive metadata", () => {
      const info = curve.getInfo();

      expect(info).toHaveProperty("order", 3);
      expect(info).toHaveProperty("type", "cubic");
      expect(info).toHaveProperty("is3D", false);
      expect(info).toHaveProperty("isLinear");
      expect(info).toHaveProperty("pointCount", 4);
      expect(info).toHaveProperty("length");
      expect(info).toHaveProperty("bbox");
      expect(info).toHaveProperty("extrema");
    });

    test("returns correct type for quadratic", () => {
      const quad = new Bezier(0, 0, 50, 50, 100, 0);
      const info = quad.getInfo();

      expect(info.order).toBe(2);
      expect(info.type).toBe("quadratic");
      expect(info.pointCount).toBe(3);
    });
  });

  describe("contains", () => {
    test("returns true for point on curve", () => {
      const point = curve.get(0.5);
      const result = curve.contains(point, { tolerance: 1 });

      expect(result).toBe(true);
    });

    test("returns false for point not on curve", () => {
      const point = { x: 9999, y: 9999 };
      const result = curve.contains(point, { tolerance: 1 });

      expect(result).toBe(false);
    });
  });

  describe("Backward Compatibility", () => {
    test("old offset() still works", () => {
      const point = curve.offset(0.5, 10);
      const curves = curve.offset(10);

      expect(point).toHaveProperty("point");
      expect(Array.isArray(curves)).toBe(true);
    });

    test("old on() still works", () => {
      const point = curve.get(0.5);
      const t = curve.on(point, 5);

      expect(typeof t === "number" || t === false).toBe(true);
    });

    test("default parameters work", () => {
      const lut = curve.getLUT();
      expect(lut.length).toBe(101); // 100 steps + 1

      const arcs = curve.arcs();
      expect(Array.isArray(arcs)).toBe(true);
    });
  });
});
