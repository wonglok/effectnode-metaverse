import Cors from "cors";

const admin = require("firebase-admin");

// Enter values for the following parameters below this code step,
// These get passed to the initializeApp method below.

// Before passing the privateKey to the initializeApp constructor,
// we have to replace newline characters with literal newlines

if (process.env.NODE_ENV === "development") {
  var serviceAccount = require("../../../../../../serviceprivatekey/3dworld.firebase.private.json");
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

// Initializing the cors middleware
const cors = Cors({
  preflightContinue: true,
  methods: ["GET", "HEAD", "OPTION"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  if (req.query && req.query !== null && req.query.cardID) {
    try {
      let cardID = req.query.cardID;
      if (!cardID) {
        res.status(404).json({
          cardID: false,
        });
        return;
      }

      let db = admin.database();
      let ref = db.ref(`card-activation-info`).child(cardID);
      let data = (await ref.get()).val();

      if (data === null) {
        let data = JSON.parse(req.body);

        ref.set({
          cardID: data.cardID,
          uid: data.uid,
          email: data.email || null,
          displayName: data.displayName || "User",
        });

        res.json({
          cardID: data.cardID,
          uid: data.uid,
          email: data.email || null,
          displayName: data.displayName || "User",
        });
      } else {
        let body = JSON.parse(req.body);
        if (data.cardID === body.cardID && data.uid === body.uid) {
          res.json({
            cardID: data.cardID,
            uid: data.uid,
            email: data.email || null,
            displayName: data.displayName || "User",
          });
        } else {
          res.status(403).json({
            err: "card already activated",
          });
          console.log("card already activated");
        }
      }
    } catch (e) {
      console.log("error during activation", e);
      res.status(506).json({
        cardID: req.query.cardID,
        valid: false,
      });
    }
  } else {
    res.status(506).json({
      err: "no card id found",
    });
  }
}

export default handler;
