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
  LineBasicMaterial,
  Vector3,
  BufferGeometry,
  Line,
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
    this.camera = new PerspectiveCamera(10, aspect, 1, 10000000);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 0, 100);
    this.renderer = new WebGLRenderer({
      antialias: true, // 抗锯齿
      alpha: true,
    });
    this.renderer.setSize(this.ele.clientWidth, this.ele.clientHeight);
    this.ele.appendChild(this.renderer.domElement);
    this.light = new DirectionalLight(0xffffff, 1);
    // this.light = new AmbientLight(100);
    this.light.position.set(0, -80, 100);
    this.scene.add(this.light);
    this.grids = [];
    this.createLine();
    // this.createSq();
    this.createShape();
    this.value = -1;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enabled = false;

    // this.animate(false);

    this.render();
  }

  /** 绘制轴线 */
  public createLine = () => {
    const lineMaterial = new LineBasicMaterial({ color: "red" }); // y
    const lineMaterial2 = new LineBasicMaterial({ color: "blue" }); // x
    const lineMaterial3 = new LineBasicMaterial({ color: "yellow" }); // z

    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 100, 0),
    ]);

    const line = new Line(geometry, lineMaterial);
    this.scene.add(line);

    const geometry2 = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(100, 0, 0),
    ]);
    const line2 = new Line(geometry2, lineMaterial2);
    this.scene.add(line2);

    const geometry3 = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 100),
    ]);
    const line3 = new Line(geometry3, lineMaterial3);
    this.scene.add(line3);
  };

  /** 绘制正方形 */
  public createSq = () => {
    const center = [180, 180];
    const points = [
      [120, 120],
      [240, 120],
      [240, 240],
      [120, 240],
    ];
    this.camera.lookAt(center[0], center[1], 0);
    this.camera.position.set(center[0], center[1], 500);
    const shape = new Shape();
    let _x0: number, _y0: number;
    points.forEach(([x, y], index) => {
      const _x = x - center[0];
      const _y = y - center[0];
      if (index === 0) {
        _x0 = _x;
        _y0 = _y;
        shape.moveTo(_x, _y);
      } else {
        shape.lineTo(_x, _y);
      }
      if (index === points.length - 1) {
        shape.lineTo(_x0, _y0);
      }
    });
    const extrudeSettings = {
      depth: 10,
      bevelSize: 0,
    };
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    const material = new MeshBasicMaterial({
      color: "#549CB7",
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
    return {
      geometry,
      material,
      mesh,
    };
  };

  /** 绘制地图形状 */
  public createShape = () => {
    const p = 100;
    const points = hangzhou.features[0].geometry.coordinates[0][0];
    const center = hangzhou.features[0].properties.center.map(
      (item) => item * p
    );
    this.camera.lookAt(center[0], center[1], 0);
    this.camera.position.set(0, -120, 100);
    const shape = new Shape();
    let _x0: number, _y0: number;
    points.forEach(([x, y], index) => {
      const _x = x * p - center[0];
      const _y = y * p - center[1];
      if (index === 0) {
        _x0 = _x;
        _y0 = _y;
        shape.moveTo(_x, _y);
      } else {
        shape.lineTo(_x, _y);
      }
      if (index === points.length - 1) {
        shape.lineTo(_x0, _y0);
      }
    });
    const extrudeSettings = {
      depth: 1,
      bevelSize: 0,
    };
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    const material = new MeshPhongMaterial({
      color: "#549CB7",
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
    return {
      geometry,
      material,
      mesh,
    };
  };

  /** 绘制杭州市地图 */
  public createMap = () => {};

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
