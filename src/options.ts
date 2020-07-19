/**
 * 角度模式
 */
export enum Orientation {
  /**
   * 0-全横
   */
  Horizontal = 0,
  /**
   * 1-横竖
   */
  HorizontalAndVertical = 1,
  /**
   * 2-random
   */
  Random = 2,
  /**
   * 3-45度向上\\
   */
  Pitch = 3,
  /**
   * 4-45度向下//
   */
  Tilt = 4,
  /**
   * 5-45度向上以及向下/\\/
   */
  PitchAndTilt = 5,
}

export type DiscourseLanguage = "cn" | "en";

export interface Options {
  readonly width: number;
  readonly height: number;
  /**
   * 是否绘制结果, true 绘制结果返回图片, false 返回单词坐标及相关信息
   */
  readonly draw: boolean;
  /**
   * 背景是否透明
   */
  readonly backgroundTransparent: boolean;
  /**
   * 是否进行词性还原
   */
  readonly lemmatization: boolean;
  /**
   * 是否启用停用词过滤
   * TODO: rename this to `enableStopWords`.
   */
  readonly stopwords: boolean;
  /**
   * 是否过滤数字
   */
  readonly filterNumber: boolean;
  /**
   * keyword 数量
   */
  readonly keywordsNum: number;
  readonly angleMode: Orientation;
  /**
   * 仅支持中英，在 textProcess 会自动修改
   */
  language: DiscourseLanguage;
  /**
   * 分配单词到region时根据面积还是根据distance valu
   */
  readonly baseOnAreaOrDisValue: boolean;
  /**
   * true 之后，会不考虑数据的真实度，尽可能放大单词以填充区域
   */
  readonly isMaxMode: boolean;
  /**
   * 在算法中会动态修改
   */
  maxFontSize: number;
  readonly minFontSize: number;
  readonly keywordColor: string;
  readonly fillingWordColor: string;
  readonly fillingFontSize: number;
  readonly cnFontFamily: string;
  readonly enFontFamily: string;
  readonly fontWeight: string;
  readonly resizeFactor: number;
  /**
   * 各region单词的颜色
   */
  readonly colors: string[];
  readonly eps: number;
  /**
   * 调试参数
   */
  readonly debug: boolean;
}

export const defaultOptions: Options = {
  width: 900,
  height: 600,
  draw: true,
  backgroundTransparent: true,
  lemmatization: true,
  stopwords: true,
  filterNumber: true,
  keywordsNum: 60,
  angleMode: Orientation.Horizontal,
  language: "cn",
  baseOnAreaOrDisValue: true,
  isMaxMode: false,
  maxFontSize: 100,
  minFontSize: 2,
  keywordColor: "#000000",
  fillingWordColor: "#000000",
  fillingFontSize: 10,
  cnFontFamily: "siyuan",
  enFontFamily: "Arial",
  fontWeight: "normal",
  resizeFactor: 4,
  colors: [
    "#000000",
    "#e5352b",
    "#e990ab",
    "#ffd616",
    "#96cbb3",
    "#91be3e",
    "#39a6dd",
    "#eb0973",
    "#dde2e0",
    "#949483",
    "#f47b7b",
    "#9f1f5c",
    "#ef9020",
    "#00af3e",
    "#85b7e2",
    "#29245c",
    "#00af3e",
  ],
  eps: 0.0000001,
  debug: true,
};

export function mergeDefaultOptions(options: Partial<Options>): Options {
  return Object.assign({}, defaultOptions, options);
}
