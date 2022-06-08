import React, { useState, useEffect } from "react";
import "./container.css";
import { EnergyRing } from "../components/Chart";

const Index = () => {
  useEffect(() => {
    new EnergyRing("chart");
  }, []);

  return <div id="chart" className="container"></div>;
};

export default Index;
