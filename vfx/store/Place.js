//
import {
  makeShallowStore,
  ShallowStoreMethods,
} from "../utils/make-shallow-store";

let StateObject = {
  loadingProgress: "0%",
};

let TypeObject = {
  ...ShallowStoreMethods,
  ...StateObject,
};

/** @type {TypeObject} */
export const Place = makeShallowStore(StateObject);
