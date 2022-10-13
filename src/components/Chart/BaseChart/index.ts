import type { Container, BaseOptions, BaseChartInstance } from "./types";

class BaseChart implements BaseChartInstance {
  container: HTMLElement;

  constructor(ele: Container, options: BaseOptions) {
    if (typeof ele === "string") {
      const element = document.getElementById(ele);
      if (element) {
        this.container = element;
      } else {
        throw new Error("获取不到容器");
      }
    } else {
      this.container = ele;
    }
  }

  init = () => {};

  render = () => {};

  update = () => {};

  handleResize = () => {};

  drawEmptyDataImg = () => {};
}

export default BaseChart;
