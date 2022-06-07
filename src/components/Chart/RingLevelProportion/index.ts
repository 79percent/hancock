/**
 * 攻击等级比例环形图
 */
import React, { useEffect, useState, Component } from "react";
import "./styles.css";

interface Props {
  id: string;
  color: string;
  name: string;
  value: number;
  total: number;
}

class RingChart {
  private WIDTH: number;
  private HEIGHT: number;
  private R1: number;
  private R2: number;
  private canvasEle: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private reId: number | undefined;
  private currentValue: number | 0;
  private params: Props;

  constructor(params: Props) {
    const { id, color, name, value, total } = params;
    this.params = params;
    const containerEle: HTMLElement = document.querySelector(
      `#${id}`
    ) as HTMLElement;
    this.WIDTH = containerEle.clientWidth;
    this.HEIGHT = containerEle.clientHeight;
    this.R1 = this.WIDTH / 2;
    this.R2 = this.WIDTH / 2 - 10;
    this.canvasEle = document.createElement("canvas");
    this.canvasEle.width = this.WIDTH;
    this.canvasEle.height = this.HEIGHT;
    this.ctx = this.canvasEle.getContext("2d") as CanvasRenderingContext2D;
    this.reId = undefined;
    this.currentValue = 0;
    containerEle.appendChild(this.canvasEle);
  }

  /** 圆弧1 */
  private widthCricle1 = (color: string) => {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.arc(
      this.WIDTH / 2,
      this.HEIGHT / 2,
      (this.R1 + this.R2) / 2 + 3,
      0,
      Math.PI * 2,
      false
    );
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  };

  /** 圆弧2 */
  private widthCricle2 = (color: string) => {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.arc(
      this.WIDTH / 2,
      this.HEIGHT / 2,
      (this.R1 + this.R2) / 2 - 5,
      0,
      Math.PI * 2,
      false
    );
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  };

  /** 进度 */
  private drawRingByRate = (rate = 0, strokeColor = "#6cf", total = 100) => {
    let start = -Math.PI / 2,
      end = start + 2 * Math.PI * (rate / total);
    this.ctx.save();
    this.ctx.lineWidth = this.R1 - this.R2;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.beginPath();
    this.ctx.arc(
      this.WIDTH / 2,
      this.HEIGHT / 2,
      (this.R1 + this.R2) / 2 - 1,
      start,
      end
    );
    this.ctx.stroke();
    this.ctx.restore();
  };

  /** 文本 */
  private drawTextByRate = (rate = 0, fillColor = "#6cf", name = "") => {
    this.ctx.save();
    this.ctx.fillStyle = fillColor;
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(name, this.WIDTH / 2, this.HEIGHT / 2 - 10);
    this.ctx.fillText(
      Math.round(rate) + "次",
      this.WIDTH / 2,
      this.HEIGHT / 2 + 10
    );
    this.ctx.restore();
  };

  /** 动画 */
  private anime = () => {
    const { color, name, value, total } = this.params;
    if (this.currentValue >= value) {
      return;
    }
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    this.widthCricle1(color);
    this.widthCricle2(color);
    this.drawRingByRate(this.currentValue, color, total);
    this.drawTextByRate(this.currentValue, color, name);
    this.currentValue += value * 0.001;
    if (this.currentValue > value) {
      this.currentValue = value;
    }
    this.reId = window.requestAnimationFrame(this.anime);
  };

  /** 初始化 */
  public init = () => {
    const { color, name, value, total } = this.params;
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    this.widthCricle1(color);
    this.widthCricle2(color);
    this.drawRingByRate(value, color, total);
    this.drawTextByRate(value, color, name);
  };

  /** 更新 */
  public update = (params: Props) => {
    this.params = params;
    this.currentValue = 0;
    this.anime();
  };
}

export default RingChart;
