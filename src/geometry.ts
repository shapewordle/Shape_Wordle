export type Point = [number, number];

/**
 * Get the length of a 2D vector.
 * @param v the vector
 */
export function norm(v: Point): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

/**
 * Compute (a - c) × (b - c)
 * @param a the target of the left hand side vector
 * @param b the target of the right hand side vector
 * @param c the source of two vectors
 */
export function cross(a: Point, b: Point, c: Point): number {
  return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
}

export function distance(u: Point, v: Point): number {
  return Math.sqrt((u[0] - v[0]) * (u[0] - v[0]) + (u[1] - v[1]) * (u[1] - v[1]));
}

export function checkSegmentIntersect(aa: Point, bb: Point, cc: Point, dd: Point): boolean {
  return !(
    Math.max(aa[0], bb[0]) < Math.min(cc[0], dd[0]) ||
    Math.max(aa[1], bb[1]) < Math.min(cc[1], dd[1]) ||
    Math.max(cc[0], dd[0]) < Math.min(aa[0], bb[0]) ||
    Math.max(cc[1], dd[1]) < Math.min(aa[1], bb[1]) ||
    cross(cc, bb, aa) * cross(bb, dd, aa) < 0 ||
    cross(aa, dd, cc) * cross(dd, bb, cc) < 0
  );
}

export function isIntersected(contour: Point[], p1: Point, p2: Point): boolean {
  //检测线段是否和边界相交
  //检测两个线段是否相交的方法
  // ok means early break
  for (let i = 0; i < contour.length - 1; i++) {
    if (checkSegmentIntersect(p1, p2, contour[i], contour[i + 1])) {
      return true;
    }
  }
  return checkSegmentIntersect(p1, p2, contour[contour.length - 1], contour[0]);
}

export function isIntersectedPolygons(a: Point[], b: Point[]): boolean {
  const polygons = [a, b];
  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    for (let j = 0; j < polygons.length; j++) {
      const p1 = polygon[j];
      const p2 = polygon[(j + 1) % polygon.length];
      const normal = { x: p2[1] - p1[1], y: p1[0] - p2[0] };

      const projectedA = a.map((p) => normal.x * p[0] + normal.y * p[1]);
      const minA = Math.min(...projectedA);
      const maxA = Math.max(...projectedA);

      const projectedB = b.map((p) => normal.x * p[0] + normal.y * p[1]);
      const minB = Math.min(...projectedB);
      const maxB = Math.max(...projectedB);

      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }
  return true;
}
