import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Map from "./pages/Map";
import Bar from "./pages/Bar";
import Ring from "./pages/Ring";

type RouterItem = {
  path: string;
  title: string;
  component?: JSX.Element;
};

const router: RouterItem[] = [
  {
    path: "/map",
    title: "map",
    component: <Map />,
  },
  {
    path: "/bar",
    title: "bar",
    component: <Bar />,
  },
  {
    path: "/ring",
    title: "ring",
    component: <Ring />,
  },
  {
    path: "/list",
    title: "list",
  },
  {
    path: "/energy",
    title: "energy",
  },
  {
    path: "/node",
    title: "node",
  },
];

const App: React.FC = (props) => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="App">
      <div className="menu">
        <h1>类型</h1>
        {router.map((item) => {
          const { path, title } = item;
          return (
            <Link
              key={path}
              to={path}
              style={{
                backgroundColor: pathname === path ? "#405093" : undefined,
              }}
            >
              {title}
            </Link>
          );
        })}
      </div>
      <div className="content">
        <Routes>
          {router.map((item) => {
            const { path, component } = item;
            return <Route key={path} path={path} element={component} />;
          })}
        </Routes>
      </div>
    </div>
  );
};

export default App;
