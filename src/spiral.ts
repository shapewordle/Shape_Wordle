import { Options } from "./options";

const eps = 0.0000001;

export type Word = {
  name: string;
  weight: number;
  /**
   * The position of the word.
   */
  position: Point;
  angle: number;
  /**
   * The width of the word, in pixels.
   */
  width: number;
  /**
   * The height of the word, in pixels.
   */
  height: number;
  epID: number;
  state: boolean;
  /**
   * TODO: is this the bounding box?
   */
  box?: Quadruple<number>[];
  descent: number;
  fontFamily: string;
  gap: number;
  regionID: number;
};

export type Point = [number, number];

export type ExtremePoint = {
  value: number;
  pos: Point;
  epWeight: number;
  ratio: number;
  epNumber: number;
};

export type Quadruple<T> = [T, T, T, T];

export type Box = Quadruple<number>;

export type Region = {
  contour: Point[];
  extremePoints: ExtremePoint[];
  dist: number[][];
  area: number;
  value: number;
  wordsNum: number;
  wordsWeight: number;
};

export type Hessian = {
  xx: number;
  xy: number;
  yy: number;
};

export type LayoutResult = {
  /**
   * All words in the result.
   */
  drawnWords: Word[];
  /**
   * If `true`, the algorithm converged before reaching the iteration limit.
   */
  state: boolean;
};

function quadrupleMap<S, T>(xs: Quadruple<S>, f: (x: S) => T): Quadruple<T> {
  return [f(xs[0]), f(xs[1]), f(xs[2]), f(xs[3])];
}

function norm(vec: [number, number]): number {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
}

function cross(a: Point, b: Point, c: Point): number {
  return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
}

function isIntersectedPolygons(a: Point[], b: Point[]): boolean {
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

const ITERATION_LIMIT = 12000;

/**
 * Compute the ShapeWordle layout.
 * @param drawnWords all words to be drawn
 * @param word TODO: explain this
 * @param regionID TODO: explain this
 * @param regions TODO: explain this
 * @param group TODO: explain this
 * @param options the width and the height of the canvas
 */
export default function layout(
  drawnWords: Word[],
  word: Word,
  regionID: number,
  regions: Region[],
  group: number[][],
  options: Options
): LayoutResult {
  // 确定word的位置
  // drawnWords存放已经确定位置的单词
  const { width: canvasWidth, height: canvasHeight } = options;
  const { extremePoints, dist } = regions[regionID];
  let lastCollidedItem: Word | null = null;
  for (let n = 0; n < ITERATION_LIMIT; n++) {
    const startPoint = extremePoints[word.epID].pos;
    // CONFUSING: Why repeat for 5 times?
    for (let i = 0; i < 5; i++) {
      const newPosition = iterate(dist, startPoint, word.position, canvasWidth, canvasHeight);
      if (newPosition) {
        word.position = [...newPosition];
      } else {
        break;
      }
    }
    if (lastCollidedItem !== null && isOverlap(lastCollidedItem, word)) {
      continue;
    }
    if (!isInShapeWord(word, options, group, regionID, regions)) {
      continue;
    }
    lastCollidedItem = drawnWords.find((w) => isOverlap(w, word)) ?? null;
    if (lastCollidedItem === null) {
      drawnWords.push(word);
      word.state = true;
      return { drawnWords, state: true };
    }
  }
  return { drawnWords, state: false };
}

/**
 * 对字母进行像素级的overlap碰撞检测
 * @param word the word
 */
function getWordPoint(word: Word): Quadruple<Point>[] {
  const ps: Quadruple<Point>[] = [];
  const { position: pos, angle } = word;
  const ratio = 1;

  if (Math.abs(word.weight - 0.5) > eps && word.box) {
    word.box.forEach((box) => {
      const wwidth = box[2] * 2;
      const wheight = box[3] * 2;
      const posr: Point = [box[0] + word.position[0], box[1] + word.position[1]];
      ps.push([
        [posr[0], posr[1]],
        [posr[0] + wwidth, posr[1]],
        [posr[0] + wwidth, posr[1] + wheight],
        [posr[0], posr[1] + wheight],
      ]);
    });
  } else {
    ps.push([
      [pos[0] - word.width * ratio, pos[1] - word.height * ratio], // left top
      [pos[0] + word.width * ratio, pos[1] - word.height * ratio], // right top
      [pos[0] + word.width * ratio, pos[1] + word.height * ratio], // right bottom
      [pos[0] - word.width * ratio, pos[1] + word.height * ratio], // let bottom
    ]);
  }

  return angle === 0
    ? ps
    : ps.map((q) =>
        quadrupleMap(
          q,
          (p): Point => [
            (p[0] - pos[0]) * Math.cos(angle) - (p[1] - pos[1]) * Math.sin(angle) + pos[0],
            (p[0] - pos[0]) * Math.sin(angle) + (p[1] - pos[1]) * Math.cos(angle) + pos[1],
          ]
        )
      );
}

function isOverlap(word1: Word, word2: Word): boolean {
  const p1 = getWordPoint(word1);
  const p2 = getWordPoint(word2);
  for (const a of p1) {
    for (const b of p2) {
      if (isIntersectedPolygons(a, b)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 获得四个角的坐标
 * @param param0 the word
 * @param ratio TODO: explain this
 */
function getCornerPoints({ position: [x, y], angle, width, height }: Word, ratio: number): Quadruple<Point> {
  const p: Quadruple<Point> = [
    [x - width * ratio, y - height * ratio], // left top
    [x + width * ratio, y - height * ratio], // right top
    [x + width * ratio, y + height * ratio], // right bottom
    [x - width * ratio, y + height * ratio], // left bottom
  ];
  return angle === 0
    ? p
    : quadrupleMap(
        p,
        (p): Point => [
          (p[0] - x) * Math.cos(angle) - (p[1] - y) * Math.sin(angle) + x,
          (p[0] - x) * Math.sin(angle) + (p[1] - y) * Math.cos(angle) + y,
        ]
      );
}

function checkSegmentIntersect(aa: Point, bb: Point, cc: Point, dd: Point): boolean {
  return !(
    Math.max(aa[0], bb[0]) < Math.min(cc[0], dd[0]) ||
    Math.max(aa[1], bb[1]) < Math.min(cc[1], dd[1]) ||
    Math.max(cc[0], dd[0]) < Math.min(aa[0], bb[0]) ||
    Math.max(cc[1], dd[1]) < Math.min(aa[1], bb[1]) ||
    cross(cc, bb, aa) * cross(bb, dd, aa) < 0 ||
    cross(aa, dd, cc) * cross(dd, bb, cc) < 0
  );
}

function isIntersected(contour: Point[], p1: Point, p2: Point): boolean {
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

/**
 * 判断点是否在 shape 内，且是否在对应的 region 内
 * @param point the point
 * @param width the width
 * @param height the height
 * @param group the group
 * @param regionID the region ID
 */
function isInShapePoint(point: Point, width: number, height: number, group: number[][], regionID: number): boolean {
  const x = Math.floor(point[0]);
  const y = Math.floor(point[1]);
  return 0 <= x && x < width && 0 <= y && y < height && group[y][x] - 2 === regionID;
}

/**
 * 判断是否在 shape wordle 内
 * @param word the word
 * @param param1 the width and the height
 * @param group the group
 * @param regionID the region ID
 * @param regions all regions
 */
function isInShapeWord(
  word: Word,
  { width, height }: Options,
  group: number[][],
  regionID: number,
  regions: { contour: Point[] }[]
): boolean {
  const ratio = Math.abs(0.7 - word.weight) > eps ? 0.9 : 1.0;
  const p = getCornerPoints(word, ratio);
  return (
    isInShapePoint(p[0], width, height, group, regionID) &&
    isInShapePoint(p[1], width, height, group, regionID) &&
    isInShapePoint(p[2], width, height, group, regionID) &&
    isInShapePoint(p[3], width, height, group, regionID) &&
    !regions.some(
      ({ contour }) =>
        isIntersected(contour, p[0], p[1]) ||
        isIntersected(contour, p[1], p[2]) ||
        isIntersected(contour, p[2], p[3]) ||
        isIntersected(contour, p[3], p[0])
    )
  );
}

/**
 * 根据螺旋线迭代取得一个位置
 * @param dist the distance field
 * @param startPoint the start point
 * @param pos the position
 * @param width the width
 * @param height the height
 */
function iterate(dist: number[][], startPoint: Point, pos: Point, width: number, height: number): Point | false {
  const point = { x: pos[0], y: pos[1] };
  // 法线方向
  const normal = computeSDF(dist, point.x, point.y);
  normal[0] = -normal[0];
  normal[1] = -normal[1];
  const norLen = norm(normal);
  // 切线
  const tangent = [-normal[1], normal[0]];
  const N = 10; // tangent speed = 2 * pi * R / N, where R = radius of curvature
  const maxTS = 1.2; // max tangent speed
  const m = 0.8; // normal speed = m * dtheta
  // 黑塞矩阵是为了计算距离场中某点的曲率
  const hessian = computeHessian(dist, point.x, point.y);
  const prepoint: Point = [point.x - startPoint[0], point.y - startPoint[1]];
  const p = [tangent[0] * hessian.xx + tangent[1] * hessian.xy, tangent[0] * hessian.xy + tangent[1] * hessian.yy];
  let tem = tangent[0] * p[0] + tangent[1] * p[1];
  const curvature = Math.max(tem / (norLen * norLen * norLen), 0.001);
  const radius = Math.abs(1 / curvature);
  tem = (2 * Math.PI * radius) / N;
  let dr: Point = [(tangent[0] * tem) / norLen, (tangent[1] * tem) / norLen];
  const normDR = norm(dr);
  if (normDR > maxTS) {
    dr = [(maxTS / normDR) * dr[0], (maxTS / normDR) * dr[1]];
  }
  if (norm(dr) < 1) {
    dr = [(tangent[0] * 2) / norLen, (tangent[1] * 2) / norLen];
  }
  point.x += dr[0];
  point.y += dr[1];
  const p2: Point = [point.x - startPoint[0], point.y - startPoint[1]];
  let dtheta = Math.acos((prepoint[0] * p2[0] + prepoint[1] * p2[1]) / norm(prepoint) / norm(p2));
  if (prepoint[0] * p2[1] - prepoint[1] * p2[0] < 0) {
    //判断是正转反转
    dtheta = -dtheta;
  }
  point.x += (Math.abs(m * dtheta) * normal[0]) / norLen;
  point.y += (Math.abs(m * dtheta) * normal[1]) / norLen;

  // 检测是否出界
  if (
    point.x &&
    point.y &&
    (dist[Math.floor(point.x)][Math.floor(point.y)] <= 0 ||
      point.x > width - 2 ||
      point.x < 2 ||
      point.y > height - 2 ||
      point.y < 2)
  ) {
    return false;
  } else {
    return [point.x, point.y];
  }
}

/**
 * 计算 signed distance field 相关信息，得到当前点的梯度信息，作为 SDF 力的方向
 * @param data the data
 * @param px the x
 * @param py the y
 */
function computeSDF(data: number[][], px: number, py: number): Point {
  const wordPosition = { x: Math.floor(px), y: Math.floor(py) };
  const kernelSize = 3;
  const offset = Math.floor(kernelSize / 2);
  const localGrad: Point = [0, 0];
  const gradX = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ];
  const gradY = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ];
  for (let i = 0; i < kernelSize; i++) {
    for (let j = 0; j < kernelSize; j++) {
      const offsetX = i - offset,
        offsetY = j - offset;
      const local = -data[wordPosition.x + offsetX][wordPosition.y + offsetY];
      localGrad[0] += local * gradX[i][j];
      localGrad[1] += local * gradY[i][j];
    }
  }
  return localGrad;
}

/**
 * 求 Hessian 矩阵，常用于描述函数局部的曲率
 * @param data the data
 * @param px the x
 * @param py the y
 */
function computeHessian(data: number[][], px: number, py: number): Hessian {
  const wordPosition = { x: Math.floor(px), y: Math.floor(py) };
  const kernelSize = 3;
  const offset = Math.floor(kernelSize / 2);
  const gradX = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ];
  const gradY = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ];
  const localHessian = { xx: 0, xy: 0, yy: 0 };
  for (let i = 0; i < kernelSize; i++) {
    for (let j = 0; j < kernelSize; j++) {
      const offsetX = i - offset,
        offsetY = j - offset;
      const localGrad = computeSDF(data, wordPosition.x + offsetX, wordPosition.y + offsetY);
      localHessian.xx += localGrad[0] * gradX[i][j];
      localHessian.xy += localGrad[0] * gradY[i][j];
      localHessian.yy += localGrad[1] * gradY[i][j];
    }
  }
  return localHessian;
}
