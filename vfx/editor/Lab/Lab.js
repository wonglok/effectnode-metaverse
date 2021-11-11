import {
  makeShallowStore,
  ShallowStoreMethods,
} from "../../utils/make-shallow-store";

let getInternal = () => {
  let data = {
    currentTab: "tabCanvas",
    tabs: ["tabCanvas"],
    keyW: false,
    keyA: false,
    keyS: false,
    keyD: false,
    keyU: false,
    keyD: false,
    keyL: false,
    keyR: false,

    winPreview: true,
    winAsset: false,
  };

  /** @returns {data} */
  return data;
};

let TypeOfStore = {
  ...getInternal(),
  ...ShallowStoreMethods,
};

/** @returns {TypeOfStore} */
const makeStore = () => {
  return makeShallowStore(getInternal());
};

/** @type {TypeOfStore} */
const Lab = makeStore();

export { Lab };
