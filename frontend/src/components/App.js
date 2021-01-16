import React from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";

const App = _props => <div className="center"><HomePage /></div>

const appDiv = document.getElementById("app");
render(<App />, appDiv);