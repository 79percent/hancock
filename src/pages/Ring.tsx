import React, { useState, useEffect } from "react";
import "./container.css";
import { RingLevelProportion } from "../components/Chart";

const Index = () => {
  useEffect(() => {
    const chart = new RingLevelProportion({
      id: "chart",
      color: "blue",
      name: "测试测试",
      value: 50,
      total: 100,
    });
    chart.init();
  }, []);

  return (
    <div
      id="chart"
      className="container"
      style={{ backgroundColor: "#fff", width: 400, height: 400 }}
    ></div>
  );
};

export default Index;
