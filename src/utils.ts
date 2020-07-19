import _ from "lodash";

/**
 * 保留 n 位小数
 * @param value the value
 * @param n the number of digits
 */
export function round(value: number, n: number): number {
  const pow = Math.pow(10, n);
  return Math.round(value * pow) / pow;
}

export function makeRandomArray(length: number, remain: number): number[] {
  const base = _.times<number>(length - remain, _.identity);
  for (let i = length - remain; i < length; i++) {
    const index = Math.floor(Math.random() * base.length);
    base.splice(index, 0, i);
  }
  return base;
}
