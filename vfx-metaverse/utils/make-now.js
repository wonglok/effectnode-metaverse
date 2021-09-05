import { Vector3 } from "three";
import { makeShallowStore } from "./make-shallow-store";

export const makeNow = () => {
  return makeShallowStore({
    //
    startLookAt: new Vector3(0, 1.5, 1),
    startAt: new Vector3(0, 1.5, 0),
    //
    moved: 0,
    goingTo: new Vector3(),
    camAt: new Vector3(),
    avatarAtDelta: new Vector3(),
    avatarAt: new Vector3(),
    avatarHead: new Vector3(),
    avatarRot: new Vector3(),
    avatarFaceLook: new Vector3(),
    followerPt: new Vector3(),
    avatarLoading: true,
    avatarMode: "standing",
    avatarSpeed: 1.0,

    //
    keyW: false,
    keyA: false,
    keyS: false,
    keyD: false,
    //
    cursorPos: new Vector3(),
    cursorNormal: new Vector3(),
    cursorType: "hide",

    //
    hint: "",
    hoverData: false,
    isDown: false,

    // avatarAtPhy: new Vector3(),

    camMode: "first",

    overlay: "",

    profile: false,
    user: false,

    reload: [],
    onlineUID: [],
  });
};
