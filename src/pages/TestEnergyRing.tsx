import React, { useState, useEffect } from "react";
import { EnergyRing } from "../components/Chart";

const Index = () => {
  useEffect(() => {
    new EnergyRing(document.querySelector("#chart") as HTMLDivElement);
  }, []);

  return <div style={{ width: 500, height: 500 }} id="chart"></div>;
};

export default Index;
