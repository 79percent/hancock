import React, { useEffect, useState } from "react";
import "./App.css";
import TestEnergyRing from "./pages/TestEnergyRing";

const App = () => {
  return (
    <div className="App">
      <div className="menu"></div>
      <div className="content">
        <TestEnergyRing />
      </div>
    </div>
  );
};

export default App;
