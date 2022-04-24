import React, { useState, useEffect } from "react";
import "./container.css";
import Map from "../components/Map";

const Index = () => {
  useEffect(() => {
    new Map(document.querySelector("#map") as HTMLElement);
  }, []);

  return <div id="map" className="container"></div>;
};

export default Index;
