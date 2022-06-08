import emptyImg from "./loophole_img_no_data.png";
import { bind } from "size-sensor";
import _ from "lodash";
import type {
  Options,
  Point,
  AreaInfo,
  ItemDataType,
  ThisOptions,
} from "./types";
import {
  DefaultWidth,
  DefaultHeight,
  DefaultArea,
  defaultOptions,
} from "./utils";
import { slowMotion } from "../../utils";

class BarChart {
  private container: HTMLElement;
  private WIDHT: number;
  private HEIGHT: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: ThisOptions;
  private scale: number;
  private progress: number;
  private selectIndex: number;
  private moveItemAreaIndex: number;
  private itemWidth: number;
  private maxItemsWidth: number;
  private div: HTMLDivElement;
  private Popover: HTMLDivElement;
  private Triangle: HTMLDivElement;
  private isMoveThumb: boolean;
  private contentArea: AreaInfo;
  private legendArea: AreaInfo;
  private yAxisArea: AreaInfo;
  private scrollBarArea: AreaInfo;
  private scrollThumbArea: AreaInfo;
  private geometryArea: AreaInfo;
  private geometryItemArea: AreaInfo[];
  private geometryItems: AreaInfo[][];
  private contentLabel1: string;
  private contentLabel2: string;
  private mousePoint: Point;
  private originPoint: Point;

  constructor(ele: HTMLElement | string, options: Options) {
    this.scale = 2;
    this.progress = 0;
    this.itemWidth = 0;
    this.maxItemsWidth = 0;
    this.selectIndex = -1;
    this.moveItemAreaIndex = -1;
    this.isMoveThumb = false;
    this.mousePoint = {
      x: 0,
      y: 0,
    };
    this.originPoint = {
      x: 0,
      y: 0,
    };
    this.contentArea = DefaultArea;
    this.legendArea = DefaultArea;
    this.yAxisArea = DefaultArea;
    this.scrollBarArea = DefaultArea;
    this.scrollThumbArea = DefaultArea;
    this.geometryArea = DefaultArea;
    this.geometryItemArea = [];
    this.geometryItems = [];
    this.container =
      typeof ele === "string"
        ? (document.getElementById(ele) as HTMLElement)
        : ele;
    this.WIDHT = DefaultWidth;
    this.HEIGHT = DefaultHeight;
    this.div = document.createElement("div");
    this.div.style.position = "relative";
    this.container.appendChild(this.div);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.options = Object.assign(defaultOptions, options || {});
    this.div.appendChild(this.canvas);
    this.Popover = this.initPopover();
    this.Triangle = this.initTriangle();
    this.contentLabel1 = "任务总耗时：";
    this.contentLabel2 = "当前进度：";
    this.initPopoverContent();
    this.div.appendChild(this.Popover);
    this.init();
    bind(this.container, this.handleResize);
    this.canvas.onmousemove = this.handleMousemove;
    this.canvas.onclick = this.handleClick;
    this.canvas.onmousedown = this.handleMousedown;
  }

  // 气泡框内容
  private initPopoverContent = (runTime = "", progress = 0) => {
    const contentHTML = `
      <div style="display: flex;flex: 1;flex-direction: row;justify-content: flex-start;align-items: center;font-size: 14px;color: #000;font-weight: 400;" >${this.contentLabel1}${runTime}</div>
      <div style="display: flex;flex: 1;flex-direction: row;justify-content: flex-start;align-items: center;font-size: 14px;color: #000;font-weight: 400;" >${this.contentLabel2}
        <div style="display: flex;flex: 1;height: 10px;background-color: #F3F3F3;
        border-radius: 5px;margin: 0 20px;" >
          <div style="width: ${progress}%;height: 10px;background-color: #438FFF;border-radius: 5px;" ></div>
        </div>
        <div>${progress}%</div>
      </div>
    `;
    this.Popover.innerHTML = contentHTML;
    this.Popover.appendChild(this.Triangle);
  };

  // 气泡框
  private initPopover = (): HTMLDivElement => {
    const Popover = document.createElement("div");
    Popover.style.padding = "10px 20px";
    Popover.style.position = "absolute";
    Popover.style.top = "0px";
    Popover.style.left = "0px";
    Popover.style.width = "0px";
    Popover.style.height = "0px";
    Popover.style.backgroundColor = "#fff";
    Popover.style.boxShadow = "0px 2px 10px 0px rgba(201, 200, 200, 0.5)";
    Popover.style.border = "1px solid #F3F3F3";
    Popover.style.borderTopLeftRadius = "10px";
    Popover.style.borderTopRightRadius = "10px";
    Popover.style.borderBottomLeftRadius = "10px";
    Popover.style.borderBottomRightRadius = "10px";
    Popover.style.display = "none";
    Popover.style.flexDirection = "column";
    Popover.style.userSelect = "none";
    return Popover;
  };

  // 更新气泡位置和内容
  private updatPopover = (moveItemAreaIndex: number, selectIndex: number) => {
    if (moveItemAreaIndex !== -1 && selectIndex !== -1) {
      const currentItem = this.geometryItems[moveItemAreaIndex][selectIndex];
      const PopoverW = this.itemWidth * 0.94;
      const PopoverH = currentItem.height * 0.75;
      const PopoverX = currentItem.x + (this.itemWidth / this.scale) * 0.06;
      const PopoverY =
        currentItem.y -
        currentItem.height +
        (currentItem.height / this.scale) * 0.25;
      let newLeft = PopoverX;
      const outLeft = this.geometryArea.x + this.geometryArea.width - PopoverW;
      if (newLeft < this.geometryArea.x) {
        newLeft = this.geometryArea.x;
        this.Triangle.style.left = "5%";
      } else if (newLeft > outLeft) {
        const diffLeft = newLeft - outLeft;
        const TriangleNewLeft = Math.floor(
          0 + (diffLeft / (PopoverW + 20)) * 100
        );
        this.Triangle.style.left = `${TriangleNewLeft}%`;
        newLeft = outLeft;
      } else {
        this.Triangle.style.left = "15%";
      }
      this.Popover.style.display = "flex";
      this.Popover.style.top = `${PopoverY / this.scale}px`;
      this.Popover.style.left = `${newLeft / this.scale}px`;
      this.Popover.style.width = `${PopoverW / this.scale}px`;
      this.Popover.style.height = `${PopoverH / this.scale}px`;
      const { data } = this.options;
      const { runTime, progress } = data[moveItemAreaIndex][selectIndex];
      this.initPopoverContent(runTime, progress);
    } else {
      this.Popover.style.display = "none";
    }
  };

  // 气泡框小三角箭头
  private initTriangle = (): HTMLDivElement => {
    const Triangle = document.createElement("div");
    Triangle.style.width = "0";
    Triangle.style.height = "0";
    Triangle.style.position = "absolute";
    Triangle.style.left = "15%";
    Triangle.style.bottom = "-10px";
    Triangle.style.borderLeft = "10px solid transparent";
    Triangle.style.borderRight = "10px solid transparent";
    Triangle.style.borderTop = "14px solid #fff";
    return Triangle;
  };

  // 鼠标在卡片上
  private handleMouseInItems = (currentPoint: { x: number; y: number }) => {
    let selectIndex = -1;
    const moveItemAreaIndex = this.geometryItemArea.findIndex((areaInfo) =>
      this.isInArea(currentPoint, areaInfo)
    );
    if (moveItemAreaIndex !== -1) {
      selectIndex = this.geometryItems[
        moveItemAreaIndex
      ].findIndex((areaInfo) => this.isInArea(currentPoint, areaInfo));
    }
    return {
      moveItemAreaIndex,
      selectIndex,
    };
  };

  // 鼠标移动
  private handleMousemove = (e: { clientX: any; clientY: any }) => {
    const { clientX, clientY } = e;
    const currentPoint = this.getMousePoint(clientX, clientY);
    if (this.isMoveThumb) {
      // 判断是否可移动滑块
      const diffX = currentPoint.x - this.mousePoint.x;
      this.originPoint.x += diffX;
      if (this.originPoint.x < 0) {
        this.originPoint.x = 0;
      }
      const max = this.scrollBarArea.width - this.scrollThumbArea.width;
      if (this.originPoint.x > max) {
        this.originPoint.x = max;
        const { onScrollEnd } = this.options;
        if (typeof onScrollEnd === "function") {
          onScrollEnd();
        }
      }
      this.mousePoint = currentPoint;
      this.render();
    } else if (this.isInArea(currentPoint, this.geometryArea)) {
      const { moveItemAreaIndex, selectIndex } = this.handleMouseInItems(
        currentPoint
      );
      this.updatPopover(moveItemAreaIndex, selectIndex);
    }
  };

  // 鼠标点击
  private handleClick = (e: { clientX: any; clientY: any }) => {
    const { clientX, clientY } = e;
    const currentPoint = this.getMousePoint(clientX, clientY);
    if (this.isMoveThumb) {
      this.isMoveThumb = false;
    } else if (this.isInArea(currentPoint, this.geometryArea)) {
      const { moveItemAreaIndex, selectIndex } = this.handleMouseInItems(
        currentPoint
      );
      this.moveItemAreaIndex = moveItemAreaIndex;
      this.selectIndex = selectIndex;
      this.updatPopover(this.moveItemAreaIndex, this.selectIndex);
      this.render();
    }
  };

  // 鼠标按下
  private handleMousedown = (e: { clientX: any; clientY: any }) => {
    const { clientX, clientY } = e;
    const currentPoint = this.getMousePoint(clientX, clientY);
    if (this.isInArea(currentPoint, this.scrollThumbArea)) {
      this.mousePoint = currentPoint;
      this.isMoveThumb = true;
    }
  };

  // 判断坐标是否在指定区域内
  private isInArea = (currentPoint: Point, areaInfo: AreaInfo): boolean => {
    return (
      currentPoint.x > areaInfo.x &&
      currentPoint.y > areaInfo.y &&
      currentPoint.x < areaInfo.x + areaInfo.width &&
      currentPoint.y < areaInfo.y + areaInfo.height
    );
  };

  // 获取鼠标坐标
  private getMousePoint = (cX: number, cY: number): Point => {
    const { left, top } = this.canvas.getBoundingClientRect();
    const x = cX - left < 0 ? 0 : cX - left;
    const y = cY - top < 0 ? 0 : cY - top;
    return {
      x: x * this.scale,
      y: y * this.scale,
    };
  };

  // 初始化大小
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
    this.init();
    this.render();
  }, 300);

  // 绘制圆角矩形路径
  private radiusRectPath = (
    x: number,
    y: number,
    w: number,
    h: number,
    R: number[],
    color: string | CanvasGradient | CanvasPattern
  ) => {
    try {
      const r = R.map((item) => {
        let temp = item;
        if (w < 2 * item) {
          temp = w / 2;
        }
        if (h < 2 * item) {
          temp = h / 2;
        }
        return temp < 0 ? 0 : temp;
      });
      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(x + r[0], y);
      this.ctx.arcTo(x + w, y, x + w, y + h, r[1]);
      this.ctx.arcTo(x + w, y + h, x, y + h, r[2]);
      this.ctx.arcTo(x, y + h, x, y, r[3]);
      this.ctx.arcTo(x, y, x + w, y, r[0]);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    } catch (error) {
      console.error(error);
    }
  };

  // 无数据时的图片
  private drawEmptyDataImg = (
    x = (this.WIDHT - this.WIDHT * (414 / 990)) / 2,
    y = (this.HEIGHT - (this.WIDHT * (414 / 990) * 220) / 414) / 2 -
      this.options.fontSize,
    w = this.WIDHT * (414 / 990),
    h = (this.WIDHT * (414 / 990) * 220) / 414
  ) => {
    const { fontSize } = this.options;
    const img = new Image();
    img.src = emptyImg;
    img.onload = () => {
      const imgWidth = w / 2;
      const imgHeight = h / 2;
      const imgStartX = x + (w - imgWidth) / 2;
      const imgStartY = y + (h - imgHeight) / 2;
      this.ctx.drawImage(img, imgStartX, imgStartY, imgWidth, imgHeight);
      this.ctx.fillStyle = "#000";
      this.ctx.font = `${fontSize}px sans-serif`;
      const text = "暂无数据";
      const measureText = this.ctx.measureText(text);
      const textWidth = measureText.width;
      const textStartX = x + (w - textWidth) / 2;
      const textStartY = y + h / 2 + imgHeight / 2 + fontSize * 2;
      this.ctx.fillText(text, textStartX, textStartY);
    };
  };

  // 画布背景颜色
  private drawBackgroundColor = (color: string) => {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.WIDHT, this.HEIGHT);
    this.ctx.restore();
  };

  // 绘制矩形区域
  private drawRectArea = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string = "transparent"
  ) => {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.restore();
  };

  // 渲染
  public render = () => {
    this.ctx.clearRect(0, 0, this.WIDHT, this.HEIGHT);
    this.progress += 0.015;
    if (this.progress > 1) {
      this.progress = 1;
    }
    const percent = slowMotion.easeOutCubic(this.progress);
    const {
      data,
      padding,
      backgroundColor,
      scrollBarStyle,
      legend,
      fontSize,
      yAxis,
      itemStyle,
    } = this.options;
    const { bar, thumb } = scrollBarStyle;
    // 绘制背景颜色
    this.drawBackgroundColor(backgroundColor);

    // 绘制内容区域
    const contentX = padding[3];
    const contentY = padding[0];
    const contentW = this.WIDHT - padding[1] - padding[3];
    const contentH = this.HEIGHT - padding[0] - padding[2] - bar.height;
    this.contentArea = {
      x: contentX,
      y: contentY,
      width: contentW,
      height: contentH,
    };
    this.drawRectArea(contentX, contentY, contentW, contentH);
    // 绘制图例Legend区域
    const legendX = contentX;
    const legendY = contentY;
    const legendW = contentW;
    const legendH = contentH * 0.1;
    this.legendArea = {
      x: legendX,
      y: legendY,
      width: legendW,
      height: legendH,
    };
    this.drawRectArea(legendX, legendY, legendW, legendH);
    // 绘制legend
    const legendRectW = 60;
    const legendRectH = 24;
    let legendItemW = 0;
    legend.value.forEach((item, index) => {
      this.ctx.save();
      const splitW = 20;
      this.ctx.fillStyle = "#000";
      this.ctx.font = `${fontSize}px sans-serif`;
      this.ctx.textAlign = "end";
      this.ctx.fillText(
        item,
        legendX + legendW - legendItemW - splitW,
        legendY + legendH / 2 + fontSize / 3,
        legendW
      );
      const textW = this.ctx.measureText(item).width;
      legendItemW += textW + legendRectW + splitW * 3;
      this.radiusRectPath(
        legendX + legendW - legendItemW + splitW,
        legendY + (legendH - legendRectH) / 2,
        legendRectW,
        legendRectH,
        new Array(4).fill(legendRectH / 2),
        legend?.color[index]
      );
      this.ctx.restore();
    });
    // 绘制yAxis区域
    const yAxisX = contentX;
    const yAxisY = contentY + legendH;
    const yAxisW = contentW * 0.1;
    const yAxisH = contentH - legendH;
    this.yAxisArea = {
      x: yAxisX,
      y: yAxisY,
      width: yAxisW,
      height: yAxisH,
    };
    this.drawRectArea(yAxisX, yAxisY, yAxisW, yAxisH);
    yAxis.forEach((item, index) => {
      this.ctx.save();
      const yAxisItemW = yAxisW;
      const yAxisItemH = yAxisH / yAxis.length;
      const yAxisItemX = yAxisX;
      const yAxisItemY = yAxisY + yAxisItemH * index;
      this.ctx.fillStyle = "#666666";
      this.ctx.font = `bold ${fontSize}px Arial,sans-serif`;
      this.ctx.textAlign = "start";
      this.ctx.fillText(
        item,
        yAxisItemX,
        yAxisItemY + yAxisItemH / 2 + fontSize / 2,
        yAxisItemW
      );
      this.ctx.restore();
    });
    // 绘制图形区域
    const geometryX = contentX + yAxisW;
    const geometryY = contentY + legendH;
    const geometryW = contentW - yAxisW;
    const geometryH = contentH - legendH;
    this.geometryArea = {
      x: geometryX,
      y: geometryY,
      width: geometryW,
      height: geometryH,
    };
    this.drawRectArea(geometryX, geometryY, geometryW, geometryH);
    this.ctx.beginPath();
    this.ctx.rect(geometryX, geometryY, geometryW, geometryH + bar.height);
    this.ctx.clip();
    this.geometryItemArea = [];
    this.geometryItems = [];
    const itemsWidth: number[] = [];
    // 计算maxWidth
    data.forEach((item, index) => {
      if (itemsWidth[index] === undefined) {
        itemsWidth[index] = 0;
      }
      const geometryItemAreaH = geometryH / data.length;
      const geometryItemH = geometryItemAreaH * 0.5;
      const geometryItemW = geometryItemH * 3.2;
      this.itemWidth = geometryItemW;
      this.geometryItems[index] = [];
      item.forEach((item2, index2) => {
        this.ctx.save();
        const singleSplitW = geometryItemW / 2.5;
        let w = index2 < item.length - 1 ? singleSplitW : geometryItemW;
        if (this.moveItemAreaIndex === index && this.selectIndex !== -1) {
          if (this.selectIndex === index2) {
            w = geometryItemW;
          }
        }
        itemsWidth[index] += w;
      });
    });
    this.maxItemsWidth = Math.max(...itemsWidth);
    if (this.maxItemsWidth <= geometryW) {
      this.originPoint.x = 0;
    }
    if (data.length === 0) {
      this.drawEmptyDataImg(geometryX, geometryY, geometryW, geometryH);
      return;
    }
    // 开始绘制卡片
    data.forEach((item, index) => {
      const diffX = (this.maxItemsWidth / bar.width) * this.originPoint.x;
      const geometryItemAreaW = geometryW;
      const geometryItemAreaH = geometryH / data.length;
      const geometryItemAreaX = geometryX;
      const geometryItemAreaY = geometryY + geometryItemAreaH * index;
      this.geometryItemArea.push({
        x: geometryItemAreaX,
        y: geometryItemAreaY,
        width: geometryItemAreaW,
        height: geometryItemAreaH,
      });
      const geometryItemH = geometryItemAreaH * 0.5;
      const geometryItemW = geometryItemH * 3.2;
      const geometryItemY =
        geometryItemAreaY + geometryItemAreaH / 2 - geometryItemH / 2;
      this.itemWidth = geometryItemW;
      this.geometryItems[index] = [];
      item.forEach((item2, index2) => {
        this.ctx.save();
        const singleSplitW = geometryItemW / 2.5;
        const splitW = singleSplitW * index2 * percent;
        let geometryItemX = geometryItemAreaX + splitW - diffX;
        let w = index2 < item.length - 1 ? singleSplitW : geometryItemW;
        if (this.moveItemAreaIndex === index && this.selectIndex !== -1) {
          if (this.selectIndex < index2) {
            geometryItemX += geometryItemW - singleSplitW;
          }
          if (this.selectIndex === index2) {
            w = geometryItemW;
          }
        }
        this.geometryItems[index].push({
          x: geometryItemX,
          y: geometryItemY,
          width: w,
          height: geometryItemH,
        });
        const geometryItemBgc =
          typeof itemStyle.backgroundColor === "string"
            ? itemStyle.backgroundColor
            : itemStyle.backgroundColor(item2);
        const geometryItemFrontBgc =
          typeof itemStyle.frontColor === "string"
            ? itemStyle.frontColor
            : itemStyle.frontColor(item2);
        this.radiusRectPath(
          geometryItemX,
          geometryItemY,
          geometryItemW,
          geometryItemH,
          itemStyle.radius,
          geometryItemFrontBgc
        );
        const geometryItemX2 = geometryItemX + itemStyle.radius[0];
        const geometryItemW2 = geometryItemW - itemStyle.radius[0];
        this.radiusRectPath(
          geometryItemX2,
          geometryItemY,
          geometryItemW2,
          geometryItemH,
          [0, itemStyle.radius[1], itemStyle.radius[2], 0],
          geometryItemBgc
        );
        const geometryItemContentW =
          geometryItemW2 - itemStyle.padding[1] - itemStyle.padding[3];
        const geometryItemContentH =
          geometryItemH - itemStyle.padding[0] - itemStyle.padding[2];
        const geometryItemContentX = geometryItemX2 + itemStyle.padding[3];
        const geometryItemContentY = geometryItemY + itemStyle.padding[0];
        this.ctx.fillStyle = geometryItemFrontBgc;
        this.ctx.font = `bold ${itemStyle.fontSize}px sans-serif`;
        this.ctx.textAlign = "start";
        this.ctx.fillText(
          item2.name,
          geometryItemContentX,
          geometryItemContentY + itemStyle.fontSize,
          geometryItemContentW
        );
        this.ctx.fillText(
          `${item2.startTime}-${item2.endTime}`,
          geometryItemContentX,
          geometryItemContentY + geometryItemContentH,
          geometryItemContentW
        );

        // 头像
        // const img = new Image();
        // img.src = item2.avatar;
        // img.style.borderRadius = '50%';
        // img.onload = () => {
        //   const imgWidth = geometryItemContentH;
        //   const imgHeight = imgWidth;
        //   const imgStartX = geometryItemContentX + geometryItemContentW - imgWidth;
        //   const imgStartY = geometryItemContentY + geometryItemContentH / 2 - imgHeight / 2;
        //   this.ctx.drawImage(img, imgStartX, imgStartY, imgWidth, imgHeight);
        // };
        this.ctx.restore();
      });
    });
    if (this.maxItemsWidth >= geometryW) {
      // 绘制滚动条bar区域
      const scrollBarX = contentX + contentW / 2 - bar.width / 2;
      const scrollBarY = contentY + legendH + yAxisH;
      const scrollBarW = bar.width;
      const scrollBarH = bar.height;
      this.scrollBarArea = {
        x: scrollBarX,
        y: scrollBarY,
        width: scrollBarW,
        height: scrollBarH,
      };
      this.radiusRectPath(
        scrollBarX,
        scrollBarY,
        scrollBarW,
        scrollBarH,
        new Array(4).fill(scrollBarH / 2),
        bar.backgroundColor
      );
      // 绘制滚动条thumb区域
      const scrollThumbX = scrollBarX + this.originPoint.x;
      const scrollThumbY = contentY + legendH + yAxisH;
      const scrollThumbW = (geometryW * scrollBarW) / this.maxItemsWidth;
      const scrollThumbH = thumb.height;
      this.scrollThumbArea = {
        x: scrollThumbX,
        y: scrollThumbY,
        width: scrollThumbW,
        height: scrollThumbH,
      };
      this.radiusRectPath(
        scrollThumbX,
        scrollThumbY,
        scrollThumbW,
        scrollThumbH,
        new Array(4).fill(scrollThumbH / 2),
        thumb.backgroundColor
      );
    }

    if (this.progress >= 1) {
      return;
    }
    window.requestAnimationFrame(this.render);
  };

  // 更新数据
  public updateData = (newData: ItemDataType[][]) => {
    this.options.data = newData;
    this.progress = 0;
    this.render();
    return this;
  };
}

export default BarChart;
