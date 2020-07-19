import LRU from "lru-cache";
import { createCanvas } from "canvas";

export type TextHeightWidth = {
  height: number;
  width: number;
  descent: number;
};

const canvas = createCanvas(500, 400);

const canvasCtx = canvas.getContext("2d");

const measureTextSizeCache = new LRU<string, TextMetrics>({
  max: 2000,
  maxAge: 1000 * 60 * 30,
});

const measureTextHWCache = new LRU<string, TextHeightWidth>({
  max: 2000,
  maxAge: 1000 * 60 * 30,
});

export function measureTextSize(text: string, fontSize: number, fontName: string): TextMetrics {
  const cacheKey = `${text}_${fontSize}_${fontName}`;
  const cachedValue = measureTextSizeCache.get(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }
  canvasCtx.font = `${fontSize}px ${fontName}`;
  const size = canvasCtx.measureText(text);
  measureTextSizeCache.set(cacheKey, size);
  return size;
}

/**
 *  确定屏幕最小的fontsize
 * 该方法用于测定浏览器能显示的最小字体大小
 * 记录前一size中W与m的宽度，与下一size中宽度进行比较
 * 如果相同，则返回size+1（即Browser能显示的字体的最小值）
 */
export function calcScreenMinFontSize(): number {
  const fullWidthCapitalLetterW = "\uFF37";
  const halfWidthSmallLetterM = "m";
  const ctx = createCanvas(200, 200).getContext("2d");
  let size = 20;
  let hanWidth: number | null = null;
  let mWidth: number | null = null;
  while (size > 0) {
    ctx.font = `${size}px sans-serif`;
    if (
      ctx.measureText(fullWidthCapitalLetterW).width === hanWidth &&
      ctx.measureText(halfWidthSmallLetterM).width === mWidth
    ) {
      return size + 1;
    }
    hanWidth = ctx.measureText(fullWidthCapitalLetterW).width;
    mWidth = ctx.measureText(halfWidthSmallLetterM).width;
    size--;
  }
  return size;
}

export function measureTextHW(
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize: number,
  fontName: string,
  text: string
): TextHeightWidth {
  const cacheKey = `${left}-${top}-${width}-${height}-${fontSize}-${fontName}-${text}`;
  const cachedValue = measureTextHWCache.get(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }
  // 绘制文本到指定区域
  canvasCtx.clearRect(0, 0, 500, 400);
  canvasCtx.save();
  canvasCtx.translate(left, fontSize + 10);
  canvasCtx.font = `${fontSize}px ${fontName}`;
  canvasCtx.fillStyle = "#000000";
  canvasCtx.fillText(text, 0, 0);
  const wordWidth = canvasCtx.measureText(text).width;
  canvasCtx.restore();

  const data = canvasCtx.getImageData(left, top, width, height).data;
  let first = 0,
    last = 0,
    descent = 0;
  let y = height;
  // 扫描线算法

  // 找到最后一非空白行
  while (!last && y) {
    y--;
    for (let x = 0; x < width; x++) {
      if (data[y * width * 4 + x * 4 + 3]) {
        last = y;
        break;
      }
    }
  }
  // 找到第一行非空白行
  while (y) {
    // console.log(y)
    y--;
    for (let x = 0; x < width; x++) {
      if (data[y * width * 4 + x * 4 + 3]) {
        // 用descent表示单词绘制时，y轴上离绘制点的gap
        if (y > fontSize + 10) descent++;
        first = y;
        break;
      }
    }
  }

  const value = {
    height: last - first,
    width: wordWidth,
    descent: descent,
  };
  measureTextHWCache.set(cacheKey, value);
  return value;
}
