import { round, random } from "lodash";
import { Token } from ".";
import { Options, Orientation } from "./options";

export type FillingWord = {
  name: string;
  weight: number;
  color: string;
};

export interface Keyword extends FillingWord {
  angle: number;
  fontFamily: string;
}

export default function preprocessWords(words: Token[], options: Options): [Keyword[], FillingWord[]] {
  const { keywordsNum, keywordColor, fillingWordColor, language, cnFontFamily, enFontFamily } = options;
  const fontFamily = language === "cn" ? cnFontFamily : enFontFamily;
  if (words.length < keywordsNum) {
    throw new Error(`At least ${keywordsNum} words is required. We got ${words.length} words instead.`);
  }
  const keywords = words.slice(0, keywordsNum).map((token) => {
    const weight = token.weight < 0.02 ? 0.02 : round(token.weight, 3);
    return {
      name: token.name.trim(),
      weight,
      color: keywordColor,
      fontFamily,
      angle: calcAngle(weight, options.angleMode),
    };
  });
  const start = words.length >= 160 ? keywordsNum : 0;
  const end = Math.min(words.length, start + 200);
  const fillingWords: FillingWord[] = words
    .slice(start, end)
    .map(({ name }) => ({ name: name.trim(), weight: 0.05, color: fillingWordColor || "#000000" }));
  while (fillingWords.length < 200) {
    fillingWords.push({ ...fillingWords[random(0, fillingWords.length)] });
  }
  return [keywords, fillingWords];
}

function calcAngle(weight: number, angleMode: number): number {
  const max = Math.PI / 2;
  const min = -Math.PI / 2;
  switch (angleMode) {
    case Orientation.Horizontal:
      return 0;
    case Orientation.HorizontalAndVertical:
      return weight > 0.5 && Math.random() < 0.4 ? 0 : Math.random() > 0.5 ? max : min;
    case Orientation.Random:
      // Question: why did the author use `+ 1`?
      // return Math.random() * (max - min + 1) + min;
      return random(min, max);
    case Orientation.Pitch:
      return Math.PI / 4;
    case Orientation.Tilt:
      return -Math.PI / 4;
    case Orientation.PitchAndTilt:
      return Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4;
    default:
      return 0;
  }
}
