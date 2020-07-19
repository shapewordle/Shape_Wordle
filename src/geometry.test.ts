import { Point, norm, cross, checkSegmentIntersect, isIntersected, isIntersectedPolygons } from "./geometry";
import { Quadruple } from "./spiral";

describe("geometry", () => {
  it("norm", () => {
    expect(norm([0, 1])).toBe(1);
    expect(norm([1, 0])).toBe(1);
    expect(norm([1, 1])).toBe(Math.sqrt(2));
  });

  it("cross", () => {
    const a: Point = [2, 3];
    const b: Point = [4, 5];
    const c: Point = [10, 2];
    expect(cross(a, a, c)).toBe(0);
    expect(cross(a, b, c)).toBe(-cross(b, a, c));
  });

  it("checkSegmentIntersect", () => {
    expect(checkSegmentIntersect([0, 1], [1, 0], [0, 0], [1, 1])).toBe(true);
    expect(checkSegmentIntersect([1, 1], [0, 1], [0, 0], [1, 0])).toBe(false);
  });

  it("isIntersected", () => {
    expect(
      isIntersected(
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
        ],
        [0.5, 0.5],
        [2, 2]
      )
    ).toBe(true);
  });

  it("isINtersectedPolygons", () => {
    function rect(x: number, y: number, width: number, height: number): Quadruple<Point> {
      return [
        [x, y],
        [x + width, y],
        [x, y + height],
        [x + width, y + height],
      ];
    }
    expect(isIntersectedPolygons(rect(0, 0, 2, 2), rect(1, 1, 2, 2))).toBe(true);
    expect(isIntersectedPolygons(rect(0, 0, 2, 2), rect(2, 2, 2, 2))).toBe(true);
    expect(isIntersectedPolygons(rect(0, 0, 2, 2), rect(2.001, 2.001, 2, 2))).toBe(false);
  });
});
