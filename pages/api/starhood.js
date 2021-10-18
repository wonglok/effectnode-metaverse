import md5 from "md5";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  // Open Chrome DevTools to step through the debugger!
  // debugger;
  res.status(200).json({
    hood: [
      // demo
      {
        id: md5(`https://metaverse.thankyou.church/api/starlink`),
        starlink: `https://metaverse.thankyou.church/api/starlink`,
      },
      {
        id: md5(`https://www.loving.place/api/starlink`),
        starlink: `https://www.loving.place/api/starlink`,
      },
      {
        id: md5(`https://metaverse.effectnode.com/api/starlink`),
        starlink: `https://metaverse.effectnode.com/api/starlink`,
      },
    ],
    human: ` id is derived from md5(starlink) `,
  });
};
