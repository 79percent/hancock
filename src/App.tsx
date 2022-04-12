import React, { useEffect } from "react";
import "./App.css";
import EnergyRing from "./components/EnergyRing";

const App = () => {
  useEffect(() => {
    new EnergyRing(document.querySelector("#chart") as HTMLCanvasElement);
  }, []);

  return (
    <div className="App">
      <canvas
        id="chart"
        width="1000"
        height="1000"
        style={{ width: 500, height: 500 }}
      ></canvas>
    </div>
  );
};

export default App;
