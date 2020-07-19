import { round, makeRandomArray } from "./utils";
import _ from "lodash";

describe("utils", () => {
  it("round", () => {
    expect(round(3.14159, 2)).toBe(_.round(3.14159, 2));
  });

  it("makeRandomArray", () => {
    const length = 10;
    const remain = 5;
    const xs = makeRandomArray(length, remain);
    expect(xs.length).toBe(length);
    expect(xs.every((x) => 0 <= x && x < length)).toBe(true);
    expect(xs.filter((x) => x < length - remain)).toMatchObject(_.times<number>(length - remain, _.identity));
  });
});
