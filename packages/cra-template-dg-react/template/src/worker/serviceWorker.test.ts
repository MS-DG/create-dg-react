import * as serviceWorker from "./serviceWorker";
it("register service worker", () => {
  serviceWorker.register();
});

it("unregister service worker", () => {
  serviceWorker.unregister();
});
