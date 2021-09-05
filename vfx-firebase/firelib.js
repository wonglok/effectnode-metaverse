import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig";
let initMap = new Map();

export function getFirebase() {
  if (!initMap.has("app") && firebase.apps.length === 0) {
    initMap.set("app", true);
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
  }

  if (!initMap.has("setup-listen-login")) {
    initMap.set("setup-listen-login", true);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        initMap.set("user", user);
        // ...
      } else {
        // User is signed out
        // ...
        initMap.delete("user");
      }
    });
  }
  return firebase;
}

/**
 *
 * @returns @type firebaseui.auth.AuthUI
 */
export function getUI() {
  let firebase = getFirebase();
  if (!initMap.has("ui")) {
    let firebaseui = require("firebaseui");
    var fireUI = new firebaseui.auth.AuthUI(firebase.auth());
    initMap.set("ui", fireUI);
  }

  /** @type firebaseui.auth.AuthUI */
  return initMap.get("ui");
}

export function testAdminRights() {
  return getFirebase().database().ref(`/test-admin`).set(Math.random());
}

export function testUserRights() {
  return getFirebase().database().ref(`/test-user`).set(Math.random());
}

export function getMe() {
  getFirebase();
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // var uid = user.uid;
        resolve(user);
        // ...
      } else {
        // User is signed out
        // ...
      }
    });
  });
}

export function logout() {
  getFirebase();
  return firebase.auth().signOut();
}

// export function loginRedirectGoogle() {
//   setup();
//   var provider = new firebase.auth.GoogleAuthProvider();

//   firebase.auth().signInWithRedirect(provider);
// }

export function loginRedirectGoogle() {
  getFirebase();
  var provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithRedirect(provider);
}

export function loginGoogle() {
  getFirebase();
  var provider = new firebase.auth.GoogleAuthProvider();
  return new Promise((resolve, reject) => {
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // firebase.auth().signInWithRedirect(provider);
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;

        // ...
        resolve({ user });
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...

        console.log(error);
        reject(error);

        // firebase.auth().signInWithRedirect(provider)
      });
  });
}

export const onReady = () => {
  getFirebase();
  return new Promise((resolve) => {
    let tt = setInterval(() => {
      if (initMap.has("user")) {
        clearInterval(tt);
        resolve({
          firebase,
          user: initMap.get("user"),
          fire: firebase,
          db: firebase.database(),
          logout: () => {
            return firebase.auth().signOut();
          },
        });
      }
    });
  });
};

export const PreviewGameCards = {
  WongTaiSin: "_szjcl6vco_jdplughmk_wx8y8wqzf",
};

export function onTapCard({ cardID, isActivated }) {
  if (process.env.NODE_ENV === "production") {
    if (cardID === PreviewGameCards.WongTaiSin) {
      getFirebase().analytics().logEvent("card_open_store", {
        name: "Wong Tai Sin Box Store",
        isActivated,
        cardID: cardID,
      });
    }

    getFirebase().analytics().logEvent("card_open_general", {
      name: "Activating General",
      isActivated,
      cardID: cardID,
    });
  }
}
