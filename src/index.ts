import { preProcessImg } from "../nodejs_version/lib/imageProcess";
import { preprocessDistanceField } from "../nodejs_version/lib/preprocessDistanceField";
import { preprocessWords } from "../nodejs_version/lib/preprocessWords";
import { allocateWords } from "../nodejs_version/lib/allocateWords";
import generateWordle from "./wordle";
import {
  draw,
  drawKeywords,
  drawFillingWords,
} from "../nodejs_version/lib/draw";
// TODO：此处有一个bug，当‘import { splitText } from './textProcess.js';’放在文件首时
// 会导致preProcessImg中计算group的部分出现问题
import { splitText } from "../nodejs_version/lib/textProcess.js";
import { Options, mergeDefaultOptions } from "./options";
import { Image } from "canvas";

export default function shapeWordle(
  text: string,
  image: Image,
  partialOptions: Partial<Options>
): Image {
  // 计算时，会修改options中的数据，所以每次generate重新取一下option
  const options = mergeDefaultOptions(partialOptions);
  const { dist, contour, group, area } = preProcessImg(image, options);
  const regions = preprocessDistanceField(dist, contour, options);
  const { keywords, fillingWords } = preprocessWords(splitText(text, options), options);
  allocateWords(keywords, regions, area, options);
  generateWordle(keywords, regions, group, options);
  // 获取单词位置
  const fillingWordsWithPos = drawFillingWords(
    keywords,
    fillingWords,
    group,
    options
  );
  const keywordsWithPos = drawKeywords(keywords, options);
  return draw(keywordsWithPos, fillingWordsWithPos, options);
}
