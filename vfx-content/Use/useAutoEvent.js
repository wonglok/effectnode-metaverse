import { useEffect } from "react";

export const useAutoEvent = function (
  ev,
  fnc,
  settings = { passive: false },
  dom
) {
  useEffect(() => {
    dom = dom || window;
    dom.addEventListener(ev, fnc, settings);
    return () => {
      dom = dom || window;
      dom.removeEventListener(ev, fnc);
    };
  }, []);
};

export const applyAutoEvent = function (
  dom,
  ev,
  fnc,
  settings = { passive: false }
) {
  dom = dom || window;
  dom.addEventListener(ev, fnc, settings);
  return () => {
    dom = dom || window;
    dom.removeEventListener(ev, fnc);
  };
};
