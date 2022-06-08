import React, { useState, useEffect } from "react";
import "./container.css";
import { NodeView } from "../components/Chart";
import data from "../components/Chart/NodeView/OLTSNVis.json";

const Index = () => {
  useEffect(() => {
    new NodeView("chart", {
      data,
    });
  }, []);

  return <div id="chart" className="container"></div>;
};

export default Index;
