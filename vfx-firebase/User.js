import { makeShallowStore } from "../vfx-metaverse/utils/make-shallow-store";

export const User = makeShallowStore({
  status: "loggedOut", // loggedIn / loading / loggedOut
  userID: false,
  displayName: "",
  photoURL: ``,
});
