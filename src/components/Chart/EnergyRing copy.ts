import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Shape,
  ExtrudeGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface GridsItem {
  geometry: ExtrudeGeometry;
  material: MeshBasicMaterial;
  mesh: Mesh;
}

export default class EnergyRing {
  private parentEle: HTMLCanvasElement;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private grids: Array<GridsItem>;
  private value: number;

  constructor(ele: HTMLCanvasElement) {
    this.parentEle = ele;
    const W = this.parentEle?.clientWidth;
    const H = this.parentEle?.clientHeight;
    const aspect = W && H ? W / H : 1;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(70, aspect, 0.1, 1000);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, -41, 35);
    this.renderer = new WebGLRenderer({
      canvas: ele,
      antialias: true, // 抗锯齿
      alpha: true,
    });
    this.grids = [];
    for (let index = 10; index <= 22; index++) {
      const startAngle = (index / 22) * (Math.PI * 2);
      const endAngle = ((index + 1) / 22) * (Math.PI * 2);
      const grid = this.createGeometry({
        startAngle,
        endAngle,
      });
      this.grids.push(grid);
    }
    this.value = -1;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enabled = false;

    // this.animate();

    this.render();
  }

  /** 创建格子 */
  private createGeometry = ({
    originX = 0,
    originY = 0,
    startAngle = (0 / 22) * (Math.PI * 2),
    endAngle = (1 / 22) * (Math.PI * 2),
    innerR = 26,
    outerR = 29.5,
    borderRadius = 2,
    split = 22,
  } = {}) => {
    const intervalR = outerR - innerR;
    const angle = endAngle - startAngle; // 角度
    const centerAngle = startAngle + angle / 2; // 起始和结束中间的角度
    const circumference = 2 * Math.PI * outerR; // 周长
    const arcLen = circumference * ((angle / Math.PI) * 2); // 弧长
    const splitPercent = split / arcLen;
    const splitePercentAngle = splitPercent * angle;
    startAngle = startAngle + splitePercentAngle / 2;
    endAngle = endAngle - splitePercentAngle / 2;

    const sinStart = Math.sin(startAngle);
    const cosStart = Math.cos(startAngle);
    const sinEnd = Math.sin(endAngle);
    const cosEnd = Math.cos(endAngle);
    const sinCenter = Math.sin(centerAngle);
    const cosCenter = Math.cos(centerAngle);

    const shape = new Shape();

    {
      const x = innerR * cosStart + originX;
      const y = innerR * sinStart + originY;
      shape.moveTo(x, y);
    }
    {
      const x = innerR * cosEnd + originX;
      const y = innerR * sinEnd + originY;
      const cpX = innerR * cosCenter + originX;
      const cpY = innerR * sinCenter + originY;
      shape.quadraticCurveTo(cpX, cpY, x, y);
    }
    {
      const x = outerR * cosEnd + originX;
      const y = outerR * sinEnd + originY;
      shape.lineTo(x, y);
    }
    {
      const x = outerR * cosStart + originX;
      const y = outerR * sinStart + originY;
      const cpX = outerR * cosCenter + originX;
      const cpY = outerR * sinCenter + originY;
      shape.quadraticCurveTo(cpX, cpY, x, y);
    }
    {
      const x = innerR * cosStart + originX;
      const y = innerR * sinStart + originY;
      shape.lineTo(x, y);
    }

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1,
    };
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    const material = new MeshBasicMaterial({
      color: "#1B3655",
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 3, 18);
    this.scene.add(mesh);
    return {
      geometry,
      material,
      mesh,
    };
  };

  /** 渲染 */
  private render = () => {
    window.requestAnimationFrame(this.render);
    this.controls?.update();
    // console.log(this.camera.position);
    this.renderer.render(this.scene, this.camera);
  };

  /** 能量条动画 */
  public animate = (loop: boolean = false) => {
    if (!loop && this.value > this.grids.length * 0.65) {
      return;
    }
    this.value++;
    for (let index = 0; index < this.grids.length; index++) {
      const { geometry, material, mesh } = this.grids[index];
      if (index < this.value) {
        material.color.set("#549CB7");
      } else {
        material.color.set("#1B3655");
      }
    }
    if (loop && this.value > this.grids.length) {
      this.value = -1;
    }
    setTimeout(() => {
      window.requestAnimationFrame(() => this.animate(loop));
    }, 100);
  };
}
