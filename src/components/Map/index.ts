import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Shape,
  ExtrudeGeometry,
  CubicBezierCurve,
  ShapeGeometry,
  DirectionalLight,
  MeshPhongMaterial,
  AmbientLight,
  LineBasicMaterial,
  Vector2,
  Vector3,
  BufferGeometry,
  Line,
  Color,
  FontLoader,
  Font,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import hangzhou from "./hangzhou.json";

interface GridsItem {
  geometry: ExtrudeGeometry;
  material: MeshBasicMaterial;
  mesh: Mesh;
}

function randomColor() {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255
  )},${Math.floor(Math.random() * 255)})`;
}

export default class Map {
  public ele: HTMLElement;
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;
  public grids: Array<GridsItem>;
  public value: number;
  public light: DirectionalLight;
  // public light: AmbientLight;
  public centerX: number;
  public centerY: number;
  public scale: number;

  constructor(ele: HTMLElement) {
    this.ele = ele;
    const aspect = this.ele.clientWidth / this.ele.clientHeight;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(10, aspect, 1, 10000000);
    this.renderer = new WebGLRenderer({
      antialias: true, // 抗锯齿
      alpha: true,
    });
    this.light = new DirectionalLight(0xffffff, 1);
    // this.light = new AmbientLight(100);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.grids = [];
    this.value = -1;
    this.scale = 100;
    this.centerX = 0;
    this.centerY = 0;

    // 计算中心点
    let max_x = -1,
      max_y = -1,
      min_x = Infinity,
      min_y = Infinity;
    hangzhou.features.forEach((item) => {
      const { geometry } = item;
      const { coordinates } = geometry;
      coordinates[0][0].forEach((point) => {
        const [_x, _y] = point;
        if (_x > max_x) {
          max_x = _x;
        }
        if (_y > max_y) {
          max_y = _y;
        }
        if (_x < min_x) {
          min_x = _x;
        }
        if (_y < min_y) {
          min_y = _y;
        }
      });
    });
    this.centerX = ((max_x + min_x) / 2) * this.scale;
    this.centerY = ((max_y + min_y) / 2) * this.scale;

    this.renderer.setSize(this.ele.clientWidth, this.ele.clientHeight);
    this.ele.appendChild(this.renderer.domElement);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 0, 100);
    this.light.position.set(0, -80, 100);
    this.scene.add(this.light);

    this.createLine();
    this.createMap();
    // this.createShape();
    // this.createSq();

    // this.controls.enabled = false;

    this.render();
  }

  /** 绘制轴线 */
  public createLine = () => {
    const lineMaterial = new LineBasicMaterial({ color: "red" }); // y
    const lineMaterial2 = new LineBasicMaterial({ color: "blue" }); // x
    const lineMaterial3 = new LineBasicMaterial({ color: "yellow" }); // z

    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 10000, 0),
    ]);

    const line = new Line(geometry, lineMaterial);
    this.scene.add(line);

    const geometry2 = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(10000, 0, 0),
    ]);
    const line2 = new Line(geometry2, lineMaterial2);
    this.scene.add(line2);

    const geometry3 = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 10000),
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
  public createShape = (feature: any, color: string) => {
    const points = feature.geometry.coordinates[0][0];
    const shape = new Shape();
    let _x0: number, _y0: number;
    // 直接连线
    // points.forEach(([x, y]: any, index: number) => {
    //   const _x = x * this.scale - this.centerX;
    //   const _y = y * this.scale - this.centerY;
    //   if (index === 0) {
    //     _x0 = _x;
    //     _y0 = _y;
    //     shape.moveTo(_x, _y);
    //   } else {
    //     shape.lineTo(_x, _y);
    //   }
    //   if (index === points.length - 1) {
    //     shape.lineTo(_x0, _y0);
    //   }
    // });
    // 平滑处理
    const vector2Arr: Vector2[] = [];
    points.forEach(([x, y]: any, index: number) => {
      const _x = x * this.scale - this.centerX;
      const _y = y * this.scale - this.centerY;
      if (index === 0) {
        _x0 = _x;
        _y0 = _y;
        shape.moveTo(_x, _y);
        vector2Arr.push(new Vector2(_x, _y));
      } else {
        vector2Arr.push(new Vector2(_x, _y));
      }
      if (index === points.length - 1) {
        vector2Arr.push(new Vector2(_x0, _y0));
      }
    });
    shape.splineThru(vector2Arr);

    const extrudeSettings = {
      depth: 5,
      // depth: Math.round(Math.random() * 5 + 5),
      bevelSize: 0,
    };
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    const material = new MeshPhongMaterial({
      color,
      side: DoubleSide,
      // opacity: 0.7,
      // transparent: true,
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
  public createMap = () => {
    this.camera.lookAt(this.centerX, this.centerY, 0);
    // this.camera.position.set(0, -800, 800);
    this.camera.position.set(0, 0, 800);

    const loader = new FontLoader();
    loader.load("./undefined_Regular.json", (font) => {
      const { features } = hangzhou;
      features.forEach((item, index) => {
        let color = randomColor();
        this.createShape(item, color);
        const { name, center } = item.properties;
        const nameX = center[0] * this.scale - this.centerX;
        const nameY = center[1] * this.scale - this.centerY;
        this.createText(font, name, nameX, nameY);
      });
    });
  };

  /** 绘制文字 */
  public createText = (font: Font, name: string, x: number, y: number) => {
    const color = new Color("#fff");
    const matLite = new MeshBasicMaterial({
      color: color,
      // transparent: true,
      // opacity: 0.4,
      side: DoubleSide,
    });
    const shapes = font.generateShapes(name, 1.5);
    const geometry = new ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    let xMid = 0,
      yMid = 0;
    if (geometry && geometry.boundingBox) {
      xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      yMid = -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
    }
    geometry.translate(x + xMid, y + yMid, 0);
    const text = new Mesh(geometry, matLite);
    text.position.z = 11.05;
    this.scene.add(text);
  };

  /** 渲染 */
  public render = () => {
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render);
    this.controls?.update();
    // console.log(this.camera.position);
  };
}
