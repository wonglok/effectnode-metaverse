import { getDiscoveryData } from "../../vfx/places";
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  origin: (origin, callback) => {
    callback(null, [origin]);
  },
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

  res.json(await getDiscoveryData({ origin: req.query.domain }));
}

export default handler;
