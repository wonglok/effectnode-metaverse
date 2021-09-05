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
          valid: false,
        });
        return;
      }

      console.log(cardID);

      let db = admin.database();
      let snap = db.ref(`card-private-info`).child(cardID).get();
      let val = (await snap).val();

      console.log(val);
      res.json({
        cardID: cardID,
        type: val.type,
        valid: val?.cardID === cardID,
      });
    } catch (e) {
      console.log("error", e);
      res.status(404).json({
        cardID: req.query.cardID,
        valid: false,
      });
    }
  } else {
    res.status(404).json({
      cardID: null,
      valid: false,
    });
  }
}

export default handler;
