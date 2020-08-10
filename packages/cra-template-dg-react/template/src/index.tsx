import React from "react";
import { render } from "react-dom";
import App from "./App";

import "./index.scss";

const rootElement = document.getElementById("root")!;
// TODO:
// using hydrate for prerender
// current has bugs when using hydrate API
// it attached the elements not remove the sipnner
// if (rootElement.hasChildNodes()) {
//   hydrate(<App />, rootElement);
// } else {
//   render(<App />, rootElement);
// }
render(<App />, rootElement, () => {
  // remove prerender style
  document.head.querySelectorAll("style[data-prerender]").forEach(s => s.remove());
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
