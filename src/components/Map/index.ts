import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Shape,
  ExtrudeGeometry,
  ShapeGeometry,
  DirectionalLight,
  MeshPhongMaterial,
  AmbientLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import hangzhou from "./hangzhou.json";

interface GridsItem {
  geometry: ExtrudeGeometry;
  material: MeshBasicMaterial;
  mesh: Mesh;
}

export default class EnergyRing {
  public ele: HTMLElement;
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;
  public grids: Array<GridsItem>;
  public value: number;
  public light: DirectionalLight;
  // public light: AmbientLight;

  constructor(ele: HTMLElement) {
    this.ele = ele;
    const aspect = this.ele.clientWidth / this.ele.clientHeight;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(1, aspect, 0.1, 200);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0.5, -8, 5);
    this.renderer = new WebGLRenderer({
      antialias: true, // 抗锯齿
      alpha: true,
    });
    this.renderer.setSize(this.ele.clientWidth, this.ele.clientHeight);
    this.ele.appendChild(this.renderer.domElement);
    this.light = new DirectionalLight(0xffffff, 1);
    // this.light = new AmbientLight(100);
    this.light.position.set(-10, -10, -20);
    this.scene.add(this.light);
    this.grids = [];
    this.createShape();
    this.value = -1;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enabled = false;

    // this.animate(false);

    this.render();
  }

  /** 绘制自定义形状 */
  public createShape = () => {
    console.log(hangzhou);
    // const points = [
    //   [-2, -2],
    //   [-2, 2],
    //   [2, 2],
    //   [2, -2],
    // ];
    const points = hangzhou.features[0].geometry.coordinates[0][0];
    console.log(points);
    const [centerX, centerY] = hangzhou.features[0].properties.center;
    this.camera.lookAt(centerX, centerY, 0);
    this.camera.position.set(120.293461, 30.315084, 2);
    const shape = new Shape();
    points.forEach(([x, y], index) => {
      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });
    shape.lineTo(points[0][0], points[0][1]);
    const extrudeSettings = {
      depth: 0.1,
      // bevelEnabled: true,
      // bevelSegments: 2,
      // steps: 2,
      bevelSize: 0,
      // bevelThickness: 1,
    };
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    const material = new MeshBasicMaterial({
      color: "#549CB7",
      side: DoubleSide,
    });
    // const material = new MeshPhongMaterial({
    //   color: "#549CB7",
    //   side: DoubleSide,
    // });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
    return {
      geometry,
      material,
      mesh,
    };
  };

  /** 渲染 */
  public render = () => {
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render);
    this.controls?.update();
    // console.log(this.camera.position);
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
