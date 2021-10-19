import { getDiscoveryData } from "../../vfx/places";
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD", "OPTIONS"],
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

  // Rest of the API logic
  let baseURL = process.env.VERCEL_URL;
  if (baseURL.indexOf("https://") !== 0) {
    baseURL = `https://${baseURL}`;
  }
  res.json(await getDiscoveryData({ origin: baseURL }));
}

export default handler;
