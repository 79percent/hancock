import type { AreaInfo, ThisOptions } from "./types";

export const DefaultWidth = 200;
export const DefaultHeight = 200;
export const DefaultArea: AreaInfo = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

export const defaultOptions: ThisOptions = {
  xAxis: [],
  yAxis: ["未完成", "进行中", "已完成"],
  data: [
    [
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟1秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 0,
        progress: 10,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟22秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 1,
        progress: 20,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟44秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 0,
        progress: 30,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 1,
        progress: 40,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 0,
        progress: 50,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 1,
        progress: 60,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 1,
        progress: 70,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 1,
        progress: 80,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "unfinished",
        priority: 1,
        progress: 90,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
    ],
    [
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "running",
        priority: 1,
        progress: 60,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
    ],
    [
      {
        createTime: "2021/07/31",
        startTime: "2021/07/31",
        endTime: "2021/07/31",
        lastRunTime: "2021/07/31",
        runTime: "1小时24分钟16秒",
        name: "21210121-15:23:56",
        status: "completed",
        priority: 2,
        progress: 100,
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
    ],
  ],
  padding: [0, 80, 40, 80],
  itemStyle: {
    padding: [50, 40, 50, 40],
    radius: [20, 20, 20, 20],
    fontSize: 25,
    frontColor: (itemData) => {
      const { priority } = itemData;
      const colorMap = [
        "rgba(247, 181, 0, 1)",
        "rgba(247, 181, 0, 1)",
        "rgba(67, 143, 255, 1)",
        "rgba(255, 119, 119, 1)",
        "rgba(255, 119, 119, 1)",
      ];
      return colorMap[priority];
    },
    backgroundColor: (itemData) => {
      const { priority } = itemData;
      const colorMap = [
        "rgba(255, 235, 181, 1)",
        "rgba(255, 235, 181, 1)",
        "rgba(205, 225, 255, 1)",
        "rgba(255, 227, 227, 1)",
        "rgba(255, 227, 227, 1)",
      ];
      return colorMap[priority];
    },
  },
  fontSize: 28,
  backgroundColor: "#fff",
  legend: {
    value: ["低级/最低级", "中级", "最高级/高级"],
    color: [
      "rgba(255, 214, 100, 1)",
      "rgba(110, 167, 255, 1)",
      "rgba(255, 119, 119, 1)",
    ],
  },
  scrollBarStyle: {
    bar: {
      width: 800,
      height: 24,
      backgroundColor: "#F3F3F3",
    },
    thumb: {
      width: 400,
      height: 24,
      backgroundColor: "#DDDDDD",
    },
  },
};
