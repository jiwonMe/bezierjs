import { lli4 } from "./geometry.js";
import { findbbox, shapeintersections } from "./intersection.js";

// Bezier를 import하면 순환참조가 되므로, 이 함수는 실행 시점에 Bezier를 받습니다
let BezierClass = null;

export function setBezierClass(Bezier) {
  BezierClass = Bezier;
}

const makeline = function (p1, p2) {
  if (!BezierClass) {
    throw new Error("Bezier class not set. Call setBezierClass first.");
  }
  return new BezierClass(
    p1.x,
    p1.y,
    (p1.x + p2.x) / 2,
    (p1.y + p2.y) / 2,
    p2.x,
    p2.y
  );
};

const makeshape = function (forward, back, curveIntersectionThreshold) {
  const bpl = back.points.length;
  const fpl = forward.points.length;
  const start = makeline(back.points[bpl - 1], forward.points[0]);
  const end = makeline(forward.points[fpl - 1], back.points[0]);
  const shape = {
    startcap: start,
    forward: forward,
    back: back,
    endcap: end,
    bbox: findbbox([start, forward, back, end]),
  };
  shape.intersections = function (s2) {
    return shapeintersections(
      shape,
      shape.bbox,
      s2,
      s2.bbox,
      curveIntersectionThreshold
    );
  };
  return shape;
};

export { makeline, makeshape };
