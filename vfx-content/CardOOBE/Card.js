import { Color } from "three";
import {
  makeShallowStore,
  ShallowStoreMethods,
} from "../../vfx-utils/make-shallow-store";

let StoreInner = {
  cardID: null,
  loading: null,
  cardValid: null,

  centerText: "",
  bottomText: "",

  fadingColor: new Color(`#fff`),
  sharpChangeColor: new Color(`#fff`),
};

let StoreTyping = {
  ...StoreInner,
  ...ShallowStoreMethods,
};
/** @type {StoreTyping} */
export let Card = makeShallowStore(StoreInner);
