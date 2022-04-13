import { bind } from "size-sensor";
import { debounce } from "lodash";

abstract class BasicChart {
  public container: HTMLElement; // 外层用户定义容器
  public divContainer: HTMLDivElement; // 图表内部div容器
  public canvas: HTMLCanvasElement; // canvas标签
  public ctx: CanvasRenderingContext2D; // canvas ctx 绘制对象
  public scale: number; // 缩放系数，解决高分辨率像素模糊
  public ClientWidth: number; // 容器宽度
  public ClientHeight: number; // 容器高度
  public WIDHT: number; // canvas宽度
  public HEIGHT: number; // canvas高度
  public progress: number; // 动画进度
  public abstract options: any; // 图标参数
  public abstract render: () => void; // 渲染方法

  constructor(container: HTMLElement | string) {
    this.container =
      typeof container === "string"
        ? (document.getElementById(`${container}`) as HTMLElement)
        : container;
    this.divContainer = document.createElement("div");
    this.divContainer.style.position = "relative";
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.scale = 2;
    this.ClientWidth = this.container.clientWidth;
    this.ClientHeight = this.container.clientHeight;
    this.WIDHT = this.container.clientWidth * this.scale;
    this.HEIGHT = this.container.clientHeight * this.scale;
    this.canvas.width = this.WIDHT;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.width = `${this.WIDHT / this.scale}px`;
    this.canvas.style.height = `${this.HEIGHT / this.scale}px`;
    this.divContainer.appendChild(this.canvas);
    this.container.appendChild(this.divContainer);
    this.progress = 0;
    bind(this.container, this.handleResize);
  }

  // 大小改变
  public handleResize = debounce(() => {
    this.WIDHT = this.container.clientWidth * this.scale;
    this.HEIGHT = this.container.clientHeight * this.scale;
    this.canvas.width = this.WIDHT;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.width = `${this.WIDHT / this.scale}px`;
    this.canvas.style.height = `${this.HEIGHT / this.scale}px`;
    this.render();
  }, 300);

  // 绘制矩形
  public drawRect = (x: number, y: number, w: number, h: number) => {
    this.ctx.fillRect(x, y, w, h);
    return this;
  };

  // 绘制圆角矩形路径
  public drawRadiusRectPath = (
    x: number,
    y: number,
    w: number,
    h: number,
    R: number[]
  ) => {
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
    return this;
  };

  // 动画渲染
  public anime = () => {
    this.progress += 0.1;
    if (this.progress > 1) {
      this.progress = 1;
    }
    if (this.progress < 1) {
      this.render();
      window.requestAnimationFrame(this.render);
    }
  };

  // 更新数据
  public updateData = (data: any) => {
    this.options.data = data;
    this.progress = 0;
    this.render();
    return this;
  };
}

export default BasicChart;
