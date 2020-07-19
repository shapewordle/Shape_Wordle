import preprocessImage from "./image-process";
import preprocessDistanceField from "./preprocess-distance-field";
import preprocessWords from "./preprocess-words";
import allocateWords from "./allocateWords";
import generateWordle from "./wordle";
import { drawKeywords, drawFillingWords } from "./fill";
import { Options, mergeDefaultOptions } from "./options";
import cv from "opencv4nodejs";
import { Word, Region } from "./spiral";
import { WordPosition } from "./render";

export type Token = { name: string; weight: number };

export default function shapeWordle(
  tokens: Token[],
  image: cv.Mat,
  partialOptions: Partial<Options>
): [WordPosition[], WordPosition[]] {
  // 计算时，会修改options中的数据，所以每次generate重新取一下option
  const options = mergeDefaultOptions(partialOptions);
  const { dist, contour, group, area } = preprocessImage(image, options);
  const regions = preprocessDistanceField(dist, contour, options);
  const [keywords, fillingWords] = preprocessWords(tokens, options);
  // TODO: remove type coercings here.
  allocateWords((keywords as unknown) as Word[], (regions as unknown) as Region[], area, options);
  generateWordle((keywords as unknown) as Word[], (regions as unknown) as Region[], group, options);
  // 获取单词位置
  const fillingWordsWithPos = drawFillingWords(keywords, fillingWords, group, options);
  const keywordsWithPos = drawKeywords(keywords, options);
  return [keywordsWithPos, fillingWordsWithPos];
}
