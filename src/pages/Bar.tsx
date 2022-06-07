import React, { useState, useEffect } from "react";
import "./container.css";
import { BarChart } from "../components/Chart";

const Index = () => {
  useEffect(() => {
    const data: { key: string; value: number }[] = [];
    for (let index = 0; index < 10; index++) {
      data.push({
        key: `${index}.${index}.${index}.${index}`,
        value: Math.round(Math.random() * 300),
      });
    }
    new BarChart("chart", {
      data,
      itemStyle: {
        padding: [6, 48, 20, 48],
        radius: [5, 5, 5, 5],
        height: 40,
      },
      thumbStyle: {
        radius: [8, 8, 8, 8],
        width: 24,
        height: 54,
      },
      fontSize: 48,
    });
  }, []);

  return (
    <div
      id="chart"
      className="container"
      style={{ backgroundColor: "#fff" }}
    ></div>
  );
};

export default Index;
