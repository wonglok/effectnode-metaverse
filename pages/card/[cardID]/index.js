import { useEffect } from "react";
import router from "next/router";
import { onTapCard } from "../../../vfx-firebase/firelib";

export async function getServerSideProps(context) {
  let cardID = context?.query?.cardID || null;

  if (!cardID) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const admin = require("firebase-admin");

  // Enter values for the following parameters below this code step,
  // These get passed to the initializeApp method below.
  // Before passing the privateKey to the initializeApp constructor,
  // we have to replace newline characters with literal newlines

  if (process.env.NODE_ENV === "development") {
    var serviceAccount = require("../../../../serviceprivatekey/my3dworld-club-firebase-adminsdk-ra466-da8918ed40.json");
    // See https://firebase.google.com/docs/reference/admin/node/admin.credential.html#cert
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
          "https://my3dworld-club-default-rtdb.asia-southeast1.firebasedatabase.app",
      });
    }
  } else {
    var serviceAccount = JSON.parse(
      process.env.MY_3D_WORLD_FIREBASE_PRIVATE.trim()
    );
    // See https://firebase.google.com/docs/reference/admin/node/admin.credential.html#cert
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
          "https://my3dworld-club-default-rtdb.asia-southeast1.firebasedatabase.app",
      });
    }
  }

  let db = admin.database();

  let activationRef = db.ref(`card-activation-info`).child(cardID);

  let data = (await activationRef.get()).val();

  if (data) {
    return {
      props: {
        isActivated: true,
        cardID,
      },

      // redirect: {
      //   destination: "/card/" + data.cardID + "/room",
      //   permanent: false,
      // },
    };
  }

  return {
    props: {
      isActivated: false,

      cardID,
    },
  };
}

//
//
//

export default function CARDID({ cardID, isActivated }) {
  //
  useEffect(() => {
    onTapCard({ cardID, isActivated });
    if (isActivated) {
      router.push(`/card/${cardID}/room`);
    } else {
      router.push(`/card/${cardID}/verification`);
    }
  }, []);

  return <div className="bg-blue-900"></div>;
}
