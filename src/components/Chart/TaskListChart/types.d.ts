export interface ThisOptions {
  xAxis: Axis;
  yAxis: Axis;
  data: ItemDataType[][];
  padding: number[];
  itemStyle: ItemStyle;
  fontSize: number;
  backgroundColor: string;
  legend: Legend;
  scrollBarStyle: ScrollBarStyle;
  onScrollEnd?: () => void;
  [propName: string]: any;
}

export interface Options {
  xAxis?: Axis;
  yAxis?: Axis;
  data?: ItemDataType[][];
  padding?: number[];
  itemStyle?: ItemStyle;
  fontSize?: number;
  backgroundColor?: string;
  legend?: Legend;
  scrollBarStyle?: ScrollBarStyle;
  onScrollEnd?: () => void;
  [propName: string]: any;
}

export type ItemDataType = {
  createTime: string;
  startTime: string;
  endTime: string;
  lastRunTime: string;
  runTime: string;
  name: string;
  status: "unfinished" | "running" | "completed";
  priority: 0 | 1 | 2;
  progress: number;
  avatar: string;
  [propName: string]: any;
};

export type ItemStyle = {
  padding: number[];
  radius: number[];
  frontColor: string | ((itemData: any) => string);
  backgroundColor: string | ((itemData: any) => string);
  fontSize: number;
};

export type Legend = {
  value: string[];
  color: string[];
};

export type Axis = string[];

export type scrollStyle = {
  width: number;
  height: number;
  backgroundColor: string;
};

export type ScrollBarStyle = {
  bar: scrollStyle;
  thumb: scrollStyle;
};

export type Point = {
  x: number;
  y: number;
};

export type AreaInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};
