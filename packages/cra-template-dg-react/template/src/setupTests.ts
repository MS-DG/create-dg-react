// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

if (document) {
  document.createRange = () =>
    (({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: "BODY",
        ownerDocument: document,
      },
    } as any) as Range);
}

window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => new Promise<void>(resolve => resolve());
window.HTMLMediaElement.prototype.pause = () => new Promise<void>(resolve => resolve());
