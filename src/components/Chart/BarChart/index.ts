import emptyImg from "./loophole_img_no_data.png";
import { bind } from "size-sensor";
import _ from "lodash";
import { slowMotion } from "../../utils";

const DefaultWidth = 200;
const DefaultHeight = 200;

interface Options {
  data: DataType[];
  padding?: number[];
  itemStyle?: ItemStyle;
  thumbStyle?: ThumbStyle;
  row?: number;
  column?: number;
  fontSize?: number;
  color?: Color;
  valuePositon?: "top" | "right";
  [propName: string]: any;
}

interface ThisOptions {
  data: DataType[];
  padding: number[];
  itemStyle: ItemStyle;
  thumbStyle: ThumbStyle;
  row: number;
  column: number;
  fontSize: number;
  color: Color;
  valuePositon: "top" | "right";
  [propName: string]: any;
}

type Color = {
  key: string;
  value: string;
};

type DataType = {
  key: string;
  value: number;
};

type ItemStyle = {
  padding: number[];
  radius: number[];
  height: number;
};

type ThumbStyle = {
  radius: number[];
  width: number;
  height: number;
};

const defaultOptions: ThisOptions = {
  data: [],
  valuePositon: "top",
  color: {
    key: "#000",
    value: "#000",
  },
  padding: [40, 20, 20, 20],
  itemStyle: {
    padding: [6, 48, 20, 48],
    radius: [5, 5, 5, 5],
    height: 20,
  },
  thumbStyle: {
    radius: [4, 4, 4, 4],
    width: 12,
    height: 32,
  },
  row: 5,
  column: 2,
  fontSize: 28,
};

class BarChart {
  private container: HTMLElement;
  private WIDHT: number;
  private HEIGHT: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: ThisOptions;
  private scale: number;
  private progress: number;
  private percent: number;
  private div: HTMLDivElement;

  constructor(ele: string, options: Options) {
    this.scale = 2;
    this.progress = 0;
    this.percent = 0;
    this.container = document.getElementById(ele) as HTMLElement;
    this.WIDHT = DefaultWidth;
    this.HEIGHT = DefaultHeight;
    this.div = document.createElement("div");
    this.div.style.position = "relative";
    this.container.appendChild(this.div);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.options = Object.assign(defaultOptions, options || {});
    this.div.appendChild(this.canvas);
    this.init();
    bind(this.container, this.handleResize);
  }

  private init = () => {
    this.WIDHT = this.container.clientWidth * this.scale;
    this.HEIGHT = this.container.clientHeight * this.scale;
    this.canvas.width = this.WIDHT;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.width = `${this.WIDHT / this.scale}px`;
    this.canvas.style.height = `${this.HEIGHT / this.scale}px`;
  };

  // 缩放时更新画布大小，并重新渲染
  private handleResize = _.debounce(() => {
    this.WIDHT = this.container.clientWidth * this.scale;
    this.HEIGHT = this.container.clientHeight * this.scale;
    this.canvas.width = this.WIDHT;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.width = `${this.WIDHT / this.scale}px`;
    this.canvas.style.height = `${this.HEIGHT / this.scale}px`;
    this.render();
  }, 300);

  // 绘制矩形
  private rect = (x: number, y: number, w: number, h: number) => {
    this.ctx.fillRect(x, y, w, h);
  };

  // 绘制圆角矩形路径
  private radiusRectPath = (
    x: number,
    y: number,
    w: number,
    h: number,
    R: number[]
  ) => {
    try {
      const r = R?.map((item) => {
        let temp = item;
        if (w < 2 * item) {
          temp = w / 2;
        }
        if (h < 2 * item) {
          temp = h / 2;
        }
        return temp < 0 ? 0 : temp;
      });
      if (r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r[0], y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r[1]);
        this.ctx.arcTo(x + w, y + h, x, y + h, r[2]);
        this.ctx.arcTo(x, y + h, x, y, r[3]);
        this.ctx.arcTo(x, y, x + w, y, r[0]);
        this.ctx.closePath();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 无数据时
  private drawEmptyDataImg = () => {
    const { fontSize } = this.options;
    const img = new Image();
    img.src = emptyImg;
    img.onload = () => {
      const imgWidth = this.WIDHT * (414 / 990);
      const imgHeight = (imgWidth * 220) / 414;
      const imgStartX = (this.WIDHT - imgWidth) / 2;
      const imgStartY = (this.HEIGHT - imgHeight) / 2 - fontSize;
      this.ctx.drawImage(img, imgStartX, imgStartY, imgWidth, imgHeight);

      this.ctx.fillStyle = "#000";
      this.ctx.font = `${fontSize}px sans-serif`;
      const text = "暂无数据";
      const measureText = this.ctx.measureText(text);
      const textWidth = measureText.width;
      const textStartX = (this.WIDHT - textWidth) / 2;
      const textStartY = (this.HEIGHT + imgHeight) / 2 + fontSize;
      this.ctx.fillText(text, textStartX, textStartY);
    };
  };

  // 渲染条形图
  public render = () => {
    this.ctx.clearRect(0, 0, this.WIDHT, this.HEIGHT);
    // this.ctx.fillStyle = 'pink';
    // this.ctx.fillRect(0, 0, this.WIDHT, this.HEIGHT);
    const {
      row,
      column,
      data,
      itemStyle,
      padding,
      fontSize,
      thumbStyle,
      color,
      valuePositon,
    } = this.options;
    const { padding: itemPadding, radius: barRadius, height } = itemStyle;
    const { radius: thumbRadius, width: thumbWidth, height: thumbHeight } =
      thumbStyle || {};
    const { key: keyColor, value: valueColor } = color;
    if (data.length === 0) {
      this.drawEmptyDataImg();
      return;
    }
    let inlineValueWidth = 0;
    if (valuePositon === "top") {
      inlineValueWidth = 0;
    } else if (valuePositon === "right") {
      inlineValueWidth = 100;
    }
    this.progress += 0.02;
    if (this.progress > 1) {
      this.progress = 1;
    }
    this.percent = slowMotion.easeOutCubic(this.progress);
    const barRectRadius = [
      barRadius[0],
      thumbStyle === null ? barRadius[1] : 0,
      thumbStyle === null ? barRadius[2] : 0,
      barRadius[3],
    ];
    // 每个item宽高
    const itemWidth = (this.WIDHT - padding[1] - padding[3]) / column;
    const itemHeight = (this.HEIGHT - padding[0] - padding[2]) / row;
    const itemContentWidth = itemWidth - itemPadding[1] - itemPadding[3];
    const itemContentHeight = itemHeight - itemPadding[0] - itemPadding[2];
    // 条形宽高
    const barWidth = itemContentWidth - inlineValueWidth;
    const barHeight = height;
    // 最大值
    const max =
      data.reduce((acc, cur) => {
        if (cur.value > acc) {
          return cur.value;
        }
        return acc;
      }, 0) * 1;
    for (let i = 0; i < row; i += 1) {
      for (let j = 0; j < column; j += 1) {
        const index = j * row + i;
        if (!data[index]) {
          break;
        }
        const { key, value } = data[index];
        const percent = value / max;
        const itemStartX = itemWidth * j + padding[3];
        const itemStartY = itemHeight * i + padding[0];
        const startX = itemStartX + itemPadding[3];
        const startY = itemStartY + itemPadding[0];
        const barStartX = startX;
        const barStartY = startY + itemContentHeight / 2 - barHeight / 2;
        const barWidthPercent = percent * barWidth * this.percent;
        const thumbStartX =
          barStartX + (barWidth - thumbWidth) * percent * this.percent;
        const thumbStartY = startY + itemContentHeight / 2 - thumbHeight / 2;
        this.ctx.save();
        // 绘制每个item背景色和内容背景色
        // this.ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
        //   Math.random() * 255,
        // )},${Math.floor(Math.random() * 255)})`;
        // this.ctx.fillRect(itemStartX, itemStartY, itemWidth, itemHeight);

        // this.ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
        //   Math.random() * 255,
        // )},${Math.floor(Math.random() * 255)})`;
        // this.ctx.fillRect(startX, startY, itemContentWidth, itemContentHeight);
        // 绘制文字
        this.ctx.fillStyle = keyColor;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textAlign = "start";
        this.ctx.fillText(
          key,
          startX,
          startY + fontSize,
          itemContentWidth - 50
        );
        if (valuePositon === "top") {
          this.ctx.fillStyle = valueColor;
          this.ctx.textAlign = "end";
          this.ctx.fillText(
            String(value),
            startX + itemContentWidth,
            startY + fontSize
          );
        } else if (valuePositon === "right") {
          this.ctx.fillStyle = valueColor;
          this.ctx.textAlign = "end";
          this.ctx.fillText(
            String(value),
            startX + itemContentWidth,
            barStartY + (fontSize * 2) / 3,
            inlineValueWidth
          );
        }
        // 绘制底色条形
        this.ctx.fillStyle = "#F7F7FA";
        this.radiusRectPath(
          barStartX,
          barStartY,
          barWidth,
          barHeight,
          barRadius
        );
        this.ctx.fill();
        // 绘制渐变条形
        const gradient = this.ctx.createLinearGradient(
          startX,
          0,
          startX + itemContentWidth * percent,
          0
        );
        gradient.addColorStop(0, "#98D5FF");
        gradient.addColorStop(1, "#3F94FA");
        this.ctx.fillStyle = gradient;
        this.radiusRectPath(
          barStartX,
          barStartY,
          barWidthPercent,
          barHeight,
          barRectRadius
        );
        this.ctx.fill();
        // 绘制滑块
        if (thumbStyle !== null) {
          this.ctx.fillStyle = "#438FFF";
          this.radiusRectPath(
            thumbStartX,
            thumbStartY,
            thumbWidth,
            thumbHeight,
            thumbRadius
          );
          this.ctx.fill();
        }
        this.ctx.restore();
      }
    }
    if (this.progress >= 1) {
      return;
    }
    window.requestAnimationFrame(this.render);
  };

  // 更新数据
  public updateData = (newData: DataType[]) => {
    this.options.data = newData;
    this.progress = 0;
    this.render();
    return this;
  };
}

export default BarChart;
