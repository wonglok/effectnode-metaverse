import { useEffect, useState } from "react";
import { getID } from "./get-id";

export const ShallowStoreMethods = {
  onEvent: () => {},
  makeKeyReactive: () => {},
  reloadKey: () => {},
};

/**
 * @returns {ShallowStoreMethods}
 */
export const makeShallowStore = (myObject = {}) => {
  let ___NameSpaceID = getID();
  let Utils = {
    exportJSON: () => {
      return JSON.parse(JSON.stringify(myObject));
    },

    /*  */
    getNameSpcaeID: () => {
      return ___NameSpaceID;
    },

    /* */
    onEvent: (key, func) => {
      let evName = `${___NameSpaceID}`;
      let hh = () => {
        func(myObject[key]);
      };

      window.addEventListener(`${evName}-${key}`, hh);
      return () => {
        window.removeEventListener(`${evName}-${key}`, hh);
      };
    },

    makeKeyReactive: (key) => {
      let [vv, setSt] = useState(0);
      useEffect(() => {
        let evName = `${___NameSpaceID}`;

        let hh = () => {
          setSt((s) => {
            return s + 1;
          });
        };

        window.addEventListener(`${evName}-${key}`, hh);
        return () => {
          window.removeEventListener(`${evName}-${key}`, hh);
        };
      }, [vv]);
    },

    reloadKey: (key) => {
      window.dispatchEvent(
        new CustomEvent(`${___NameSpaceID}-${key}`, { detail: {} })
      );
    },
  };

  let proxy = new Proxy(myObject, {
    get: (o, k) => {
      //
      if (Utils[k]) {
        return Utils[k];
      }

      return o[k];
    },
    set: (o, key, val) => {
      let currentVal = o[key];

      if (currentVal !== val) {
        o[key] = val;

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(`${___NameSpaceID}-${key}`, { detail: {} })
          );
        }
      }

      return true;
    },
  });

  let Type = {
    ...myObject,
    ...ShallowStoreMethods,
  };
  /** @type {Type} */
  return proxy;
};
