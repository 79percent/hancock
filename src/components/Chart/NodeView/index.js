import { bind } from "size-sensor";
import icon_nor from './img/icon_nor.png'
import icon_warning from './img/icon_warning.png'
import node_nor from './img/node_nor.png'
import node_warning from './img/node_warning.png'
import header_end_nor from './img/header_end_nor.png'
import header_end_warning from './img/header_end_warning.png'
import { cloneDeep } from 'lodash'

function randomColor() {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255
  )},${Math.floor(Math.random() * 255)})`;
}

const img_icon_nor = new Image();
img_icon_nor.src = icon_nor;

const img_icon_warning = new Image();
img_icon_warning.src = icon_warning;

const img_node_nor = new Image();
img_node_nor.src = node_nor;

const img_node_warning = new Image();
img_node_warning.src = node_warning;

const img_header_end_nor = new Image();
img_header_end_nor.src = header_end_nor;

const img_header_end_warning = new Image();
img_header_end_warning.src = header_end_warning;

export default class DetailView {
  constructor(id, options = {}) {
    this.containerElement = document.getElementById(id);
    this.canvas = document.createElement("canvas");
    this.containerElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.options = options;
    this.scale = 2;
    this.node_scale = 1.4;
    this.isMove = false;
    this.mousePoint = {
      x: 0,
      y: 0,
    };
    this.diff = {
      x: 0,
      y: 0
    };
    this.lastDiff = {
      x: 0,
      y: 0,
    };
    this.positionArr = [];
    this.displayLabel = '';
    this.options.data = this.refactorData(this.options.data);
    this.initNode_W_H();
    this.init_W_H();
    bind(this.containerElement, this.handleResize);
    this.canvas.addEventListener("mousedown", this.handleMousedown);
    this.canvas.addEventListener("mousemove", this.handleMousemove);
    this.canvas.addEventListener("mouseup", this.handleMouseup);
    this.canvas.addEventListener("wheel", this.handleWheel);
    this.canvas.addEventListener("click", this.handleClick);
  }

  refactorData = (data) => {
    const copyData = cloneDeep(data);
    const { root } = data;
    const { layouts } = root;
    const { components, vis = {} } = layouts;
    const { nodes = [] } = vis;
    const nodesMap = {};
    let i = 0;
    let header = null, end = null;
    while (i < nodes.length) {
      const item = nodes[i];
      if (i === 0 || i === 1) {
        nodesMap[item.id] = { ...item };
        if (i === 0) {
          header = item;
        }
        if (i === 1) {
          end = item;
        }
        i++;
      } else {
        let top, bottom;
        if (nodes[i + 1].label.includes(header.label)) {
          top = nodes[i + 1];
          bottom = nodes[i + 2];
        } else {
          top = nodes[i + 2];
          bottom = nodes[i + 1];
        }
        nodesMap[item.id] = {
          ...item,
          top,
          bottom,
        };
        i += 3;
      }
    }
    const newComponents = [];
    components.forEach((item, index) => {
      if (index === 0 || index === 1) {
        newComponents.push({
          id: item.id,
          ...item.info
        })
      } else {
        const { vis = {} } = item;
        const { nodes = [] } = vis;
        const _item = nodes[0];
        newComponents.push({
          ..._item,
          top: nodesMap[_item.id].top,
          bottom: nodesMap[_item.id].bottom,
        })
      }
    })
    copyData.root.layouts.components = newComponents;
    return copyData;
  }

  getMousePoint = (cX, cY) => {
    const { left, top, width, height } = this.canvas.getBoundingClientRect();
    const x = cX - left < 0 ? 0 : cX - left;
    const y = cY - top < 0 ? 0 : cY - top;
    return {
      x,
      y,
    };
  };

  handleMousedown = (e) => {
    const { clientX, clientY } = e;
    const currentPoint = this.getMousePoint(clientX, clientY);
    this.mousePoint = { ...currentPoint };
    this.diff = {
      x: 0,
      y: 0,
    }
    this.isMove = true;
  }

  handleMousemove = (e) => {
    if (!this.isMove) return;
    const { clientX, clientY } = e;
    const currentPoint = this.getMousePoint(clientX, clientY);
    const currentDiffX = currentPoint.x - this.mousePoint.x;
    const currentDiffY = currentPoint.y - this.mousePoint.y;
    this.diff = {
      x: currentDiffX * this.scale,
      y: currentDiffY * this.scale
    }
    this.render();
  }

  handleMouseup = (e) => {
    this.isMove = false;
    const newDiffX = this.lastDiff.x + this.diff.x;
    const newDiffY = this.lastDiff.y + this.diff.y;
    this.lastDiff = {
      x: newDiffX,
      y: newDiffY
    }
    this.diff = {
      x: 0,
      y: 0,
    }
    this.render();
  }

  handleWheel = (e) => {
    this.wheeling = true;
    const { clientX, clientY, wheelDelta } = e;
    if (wheelDelta > 0) {
      this.node_scale += 0.1;
    } else {
      this.node_scale -= 0.1;
    }
    this.node_scale = this.node_scale < 0.5 ? 0.5 : this.node_scale;
    this.initNode_W_H();
    this.render();
    this.wheeling = false;
  }

  handleClick = (e) => {
    const { clientX, clientY } = e;
    const { x, y } = this.getMousePoint(clientX, clientY);
    const _x = x * this.scale;
    const _y = y * this.scale;
    const findItem = this.positionArr.find((item) => {
      const { x1, y1, x2, y2 } = item;
      return x1 < _x && _x < x2 && y1 < _y && _y < y2;
    })
    this.displayLabel = findItem ? findItem.info.label : '';
    this.render();
  }

  initNode_W_H = () => {
    // 头
    this.node_header_w = 120 * this.node_scale;
    this.node_header_h = 120 * this.node_scale;
    // item top 
    this.node_item_top_w = 100 * this.node_scale;
    this.node_item_top_h = 120 * this.node_scale;
    // item center 
    this.node_item_center_w = 100 * this.node_scale;
    this.node_item_center_h = 100 * this.node_scale;
    this.node_item_center_content_w = 48 * this.node_scale;
    this.node_item_center_content_h = 77 * this.node_scale;
    // item bottom 
    this.node_item_bottom_w = 100 * this.node_scale;
    this.node_item_bottom_h = 120 * this.node_scale;
    // item top bottom icon
    this.node_item_icon_w = 30 * this.node_scale;
    this.node_item_icon_h = 30 * this.node_scale;
    // item width
    this.node_item_w = this.node_item_top_w;
    this.node_item_h =
      this.node_item_top_h + this.node_item_center_h + this.node_item_bottom_h;
    // 结尾
    this.node_end_w = 120 * this.node_scale;
    this.node_end_h = 120 * this.node_scale;
    // 头 结尾 width height
    this.node_header_end_content_w = 84 * this.node_scale;
    this.node_header_end_content_h = 113 * this.node_scale;
  };

  init_W_H = () => {
    this.WIDTH = this.containerElement.clientWidth;
    this.HEIGHT = this.containerElement.clientHeight;
    this.canvasWIDTH = this.WIDTH * this.scale;
    this.canvasHEIGHT = this.HEIGHT * this.scale;
    this.canvas.width = this.canvasWIDTH;
    this.canvas.height = this.canvasHEIGHT;
    this.canvas.style.width = `${this.WIDTH}px`;
    this.canvas.style.height = `${this.HEIGHT}px`;
    this.canvasCenterPoint_x = this.canvasWIDTH / 2;
    this.canvasCenterPoint_y = this.canvasHEIGHT / 2;
  };

  handleResize = () => {
    this.init_W_H();
    this.render();
  };

  line = (x1, y1, x2, y2) => {
    this.ctx.strokeStyle = 'rgba(58, 120, 241, 0.21)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  render = () => {
    this.positionArr = [];
    this.ctx.clearRect(0, 0, this.canvasWIDTH, this.canvasHEIGHT);

    if (this.displayLabel) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = `${26}px sans-serif`;
      this.ctx.fillText(this.displayLabel, 20, 40);
    }

    const { data } = this.options;
    const { root } = data;
    const { layouts } = root;
    const { components } = layouts;
    this.node_w =
      this.node_header_w +
      (components.length - 2) * this.node_item_w +
      this.node_end_w;
    this.node_h = this.node_item_h;

    const diffX = this.lastDiff.x + this.diff.x;
    const diffY = this.lastDiff.y + this.diff.y;

    let start_x = this.canvasCenterPoint_x - this.node_w / 2 + diffX;
    let start_y = this.canvasCenterPoint_y - this.node_h / 2 + diffY;

    const start_center_x = start_x + this.node_header_w / 2;
    const start_center_y = start_y + this.node_header_h / 2;

    const end_x = start_x + this.node_header_w + (components.length - 2) * this.node_item_w;
    const end_y = start_y + this.node_item_top_h + this.node_item_center_h;
    const end_center_x = end_x + this.node_end_w / 2;
    const end_center_y = end_y + this.node_end_h / 2;

    let item_x = start_x + this.node_header_w;
    let item_y = start_y;

    components.forEach((item, index) => {
      if (index === 0) {
        const img_x = start_x + (this.node_header_w - this.node_header_end_content_w) / 2;
        const img_y = start_y + (this.node_header_h - this.node_header_end_content_h) / 2;
        this.ctx.drawImage(img_header_end_nor, img_x, img_y, this.node_header_end_content_w, this.node_header_end_content_h);
        this.positionArr.push({
          x1: img_x,
          y1: img_y,
          x2: img_x + this.node_header_end_content_w,
          y2: img_y + this.node_header_end_content_h,
          info: item
        })
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${26}px sans-serif`;
        this.ctx.fillText(item.label.split('-')[0], img_x, img_y + this.node_header_end_content_h + 36);
        return;
      }
      if (index === 1) {
        const img_x = end_x + (this.node_header_w - this.node_header_end_content_w) / 2;
        const img_y = end_y + (this.node_header_h - this.node_header_end_content_h) / 2;
        this.ctx.drawImage(img_header_end_warning, img_x, img_y, this.node_header_end_content_w, this.node_header_end_content_h);
        this.positionArr.push({
          x1: img_x,
          y1: img_y,
          x2: img_x + this.node_header_end_content_w,
          y2: img_y + this.node_header_end_content_h,
          info: item
        })
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${26}px sans-serif`;
        this.ctx.fillText(item.label.split('-')[0], img_x, img_y + this.node_header_end_content_h + 36);
        return;
      }

      // 头
      const item_top_x = item_x;
      const item_top_y = item_y;
      const item_top_center_x = item_top_x + this.node_item_top_w / 2;
      const item_top_center_y = item_top_y + this.node_item_top_h / 2;
      const item_top_img_x = item_top_x + (this.node_item_top_w - this.node_item_icon_w) / 2;
      const item_top_img_y = item_top_y + (this.node_item_top_h - this.node_item_icon_h) / 2;
      if (index === 2) {
        this.line(item_top_center_x, item_top_center_y, start_center_x, start_center_y)
      } else {
        this.line(item_top_center_x, item_top_center_y, item_top_center_x - this.node_item_w, start_center_y)
      }
      this.ctx.drawImage(img_icon_warning, item_top_img_x, item_top_img_y, this.node_item_icon_w, this.node_item_icon_h);
      this.positionArr.push({
        x1: item_top_img_x,
        y1: item_top_img_y,
        x2: item_top_img_x + this.node_item_icon_w,
        y2: item_top_img_y + this.node_item_icon_h,
        info: item.top
      })

      // 中
      const item_center_x = item_x;
      const item_center_y = item_top_y + this.node_item_top_h;
      const item_center_point_x = item_center_x + this.node_item_center_w / 2;
      const item_center_point_y = item_center_y + this.node_item_center_h / 2;
      const item_center_img_x = item_center_x + (this.node_item_center_w - this.node_item_center_content_w) / 2;
      const item_center_img_y = item_center_y + (this.node_item_center_h - this.node_item_center_content_h) / 2;
      this.line(item_center_point_x, item_center_point_y, item_center_point_x, item_center_point_y - (this.node_item_top_h + this.node_item_center_h) / 2)
      this.line(item_center_point_x, item_center_point_y, item_center_point_x, item_center_point_y + (this.node_item_top_h + this.node_item_center_h) / 2)
      this.ctx.drawImage(img_node_nor, item_center_img_x, item_center_img_y, this.node_item_center_content_w, this.node_item_center_content_h);
      this.positionArr.push({
        x1: item_center_img_x,
        y1: item_center_img_y,
        x2: item_center_img_x + this.node_item_center_content_w,
        y2: item_center_img_y + this.node_item_center_content_h,
        info: item
      })
      this.ctx.fillStyle = '#fff';
      this.ctx.font = `${26}px sans-serif`;
      this.ctx.fillText(item.label, item_center_img_x, item_center_img_y + this.node_item_center_content_h + 36);

      // 底
      const item_bottom_x = item_x;
      const item_bottom_y = item_center_y + this.node_item_center_h;
      const item_bottom_center_x = item_bottom_x + this.node_item_bottom_w / 2;
      const item_bottom_center_y = item_bottom_y + this.node_item_bottom_h / 2;
      const item_bottom_img_x = item_bottom_x + (this.node_item_bottom_w - this.node_item_icon_w) / 2;
      const item_bottom_img_y = item_bottom_y + (this.node_item_bottom_h - this.node_item_icon_h) / 2;
      if (index === components.length - 1) {
        this.line(item_bottom_center_x, item_bottom_center_y, end_center_x, end_center_y);
      } else {
        this.line(item_bottom_center_x, item_bottom_center_y, item_top_center_x + this.node_item_w, item_bottom_center_y);
      }
      this.ctx.drawImage(img_icon_nor, item_bottom_img_x, item_bottom_img_y, this.node_item_icon_w, this.node_item_icon_h);
      this.positionArr.push({
        x1: item_bottom_img_x,
        y1: item_bottom_img_y,
        x2: item_bottom_img_x + this.node_item_icon_w,
        y2: item_bottom_img_y + this.node_item_icon_h,
        info: item.bottom
      })

      item_x += this.node_item_w;
    });
  };
}
