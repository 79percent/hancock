import React, { useState, useEffect } from "react";
import "./container.css";
import { TaskListChart } from "../components/Chart";

const Index = () => {
  useEffect(() => {
    new TaskListChart("chart", {});
  }, []);

  return <div id="chart" className="container"></div>;
};

export default Index;
