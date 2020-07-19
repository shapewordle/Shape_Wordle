import { measureTextSize, measureTextHW } from "./text-measurement";
import { Point } from "./geometry";
import wordleAlgorithm, { Word, Region, LayoutResult, ExtremePoint } from "./spiral";
import { Options } from "./options";
import { makeRandomArray } from "./utils";

/**
 * Generate a wordle from scratch.
 * @param words the words
 * @param regions all regions
 * @param group a map from each pixel to its region ID
 * @param options the layout options
 */
export default function generateWordle(words: Word[], regions: Region[], group: number[][], options: Options): void {
  const { keywordsNum, isMaxMode } = options;
  const randomArray = makeRandomArray(words.length, Math.floor(0.25 * keywordsNum));
  let prePosition: Point[] | null = null;
  for (const word of words) {
    createBox(word, options);
    word.state = false;
  }
  const length = regions.length;
  for (let regionID = 0; regionID < length; regionID++) {
    // 每次排布一个region的单词
    const region = regions[regionID];
    if (isMaxMode) {
    } else {
      let success = true;
      for (let cont = 0; cont < 1; cont++) {
        let wordle: LayoutResult = { drawnWords: [], state: true };
        for (const i of randomArray) {
          const word = words[i];
          if (word.regionID === regionID) {
            word.width++;
            word.height++;
            word.gap++;
            placeWord(word, region.extremePoints[word.epID], regionID, group, options);
            wordle = wordleAlgorithm(wordle.drawnWords, word, regionID, regions, group, options);
            if (wordle.state === false) {
              // wordlepara.state 这个状态代表有没有单词在运行Wordle算法的时候旋转到了图形外面
              success = false;
              break;
            }
          }
        }
        if (success) {
          prePosition = words.map((word) => [...(word.position || [])]);
        } else {
          // 未分配成功则减小fontsize，重新分配
          if (cont === 0 && options.maxFontSize >= 10) {
            regionID = -1;
            options.maxFontSize--;
            words.forEach((word) => createBox(word, options));
          } else {
            if (prePosition !== null) {
              // 无法减小fontsize则使用上次成功的结果
              const length = words.length;
              for (let i = 0; i < length; i++) {
                words[i].position = prePosition[i];
              }
            }
            break;
          }
        }
      }
    }
  }
}

/**
 * 设置每个单词整体的box和每个字母的box
 * @param word the word
 * @param options layout options
 */
function createBox(word: Word, options: Options): void {
  const { eps, minFontSize, maxFontSize } = options;
  const fontSize = (maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize;
  const { width } = measureTextSize(word.name, fontSize, word.fontFamily);
  word.gap = 2;
  word.width = width / 2 + 2;
  // 量宽高
  const textSize = measureTextHW(0, 0, 150, 200, fontSize, word.fontFamily, word.name);
  word.descent = textSize.descent;
  word.height = textSize.height / 2 + 2;

  // 对于权重大于0.5的, 对每个字母建立box
  if (Math.abs(word.weight - 0.5) > eps) {
    word.box = [];
    const textSize = measureTextHW(0, 0, 200, 200, fontSize, word.fontFamily, "a");

    const aH = textSize.height / 2;
    const aD = textSize.descent;
    // [x, y, witdh, height]
    word.box.push([-word.width, word.height - word.descent + aD - 2 * (aH + word.gap), word.width, aH + word.gap]);

    const pureWidth = -(word.width - word.gap);
    let occupied = 0;
    for (let i = 0; i < word.name.length; i++) {
      const textSize = measureTextHW(0, 0, 150, 200, fontSize, word.fontFamily, word.name[i]);
      const ch = textSize.height / 2;
      const cw = textSize.width / 2;
      const cd = textSize.descent;
      if (ch !== aH) {
        word.box.push([
          occupied + pureWidth - word.gap,
          word.height - word.descent + cd - 2 * ch - 2 * word.gap,
          cw + word.gap,
          ch + word.gap,
        ]);
      }
      occupied += cw * 2;
    }
  }
}

/**
 * 在 regionID 的 center 附近随机放置单词
 * @param word the word
 * @param center the center of the region
 * @param regionID ID of the region
 * @param group map from pixels to group IDs
 * @param options the layout options
 */
function placeWord(word: Word, center: ExtremePoint, regionID: number, group: number[][], options: Options): void {
  const { isMaxMode, eps } = options;
  // 偏移中心的距离
  const distance = center.value / (Math.abs(word.weight - 0.8) > eps ? 5 : isMaxMode ? 2 : 3);
  const xmax = center.pos[0] + distance;
  const xmin = center.pos[0] - distance;
  const ymax = center.pos[1] + distance;
  const ymin = center.pos[1] - distance;
  // 在该region中，在tem的限制下，随机分配个位置
  let x, y;
  do {
    x = Math.round(Math.random() * (xmax - xmin + 1) + xmin);
    y = Math.round(Math.random() * (ymax - ymin + 1) + ymin);
  } while (group[y][x] - 2 !== regionID);
  word.position = [x, y];
}
