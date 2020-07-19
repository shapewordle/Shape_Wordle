import { createCanvas } from "canvas";
import { Options } from "./options";

export type WordPosition = {
  color: string;
  fontSize: number;
  transX: number;
  transY: number;
  rotate: number;
  name: string;
  fillX: number;
  fillY: number;
};

export default function render(keywords: WordPosition[], fillingWords: WordPosition[], options: Options): Buffer {
  // console.log(keywords.map(word => word.fontSize))
  const fontFamily = options.language === "cn" ? options.cnFontFamily : options.enFontFamily;
  const { width, height, fontWeight, resizeFactor } = options;
  const canvas = createCanvas(width * resizeFactor, height * resizeFactor);
  const ctx = canvas.getContext("2d");
  for (const { color, fontSize, transX, transY, rotate, name, fillX, fillY } of keywords) {
    ctx.save();
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.translate(transX * resizeFactor, transY * resizeFactor);
    ctx.rotate(rotate);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(name, fillX * resizeFactor, fillY * resizeFactor);
    ctx.restore();
  }
  for (const { color, fontSize, transX, transY, rotate, name, fillX, fillY } of fillingWords) {
    ctx.save();
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.translate(transX * resizeFactor, transY * resizeFactor);
    ctx.rotate(rotate);
    ctx.textAlign = "start";
    ctx.textBaseline = "middle";
    ctx.fillText(name, fillX * resizeFactor, fillY * resizeFactor);
    ctx.restore();
  }
  return canvas.toBuffer();
}
