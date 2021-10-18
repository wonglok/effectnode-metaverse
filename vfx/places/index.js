import dynamic from "next/dynamic";
import md5 from "md5";
import pkg from "../../package.json";

let BASEURL = "https://metaverse.effectnode.com";

if (process.env.NODE_ENV === "development") {
  BASEURL = "http://localhost:3000";
}

export let baseURL = BASEURL;

export let Pages = [
  {
    placeID: "spaceship",
    thumbnail: `${baseURL}/preview/spaceship-thumb.png`,
    compo: dynamic(() => import("./spaceship/SpaceStation"), {
      ssr: false,
    }),
  },
  {
    placeID: "church",
    thumbnail: `${baseURL}/preview/church-thumb.png`,
    compo: dynamic(() => import("./church/SkyCityChurch"), {
      ssr: false,
    }),
  },
  {
    placeID: "sing",
    thumbnail: `${baseURL}/preview/sing-thumb.png`,
    compo: dynamic(() => import("./sing/Sing"), {
      ssr: false,
    }),
  },
];

const Maps = Pages.map((obj) => {
  let kn = obj.placeID;
  let url = `${baseURL}/place/${kn}`;
  return {
    id: url,
    plageKey: "place",
    placeID: kn,
    title: kn,
    baseURL,
    url,
    thumbnail: obj.thumbnail,
    page: `/place/${kn}`,
  };
});

let getDiscoveryData = () => {
  let data = {
    meta: {
      schema: "metaverse-starlink",
      license: pkg.license,
      version: pkg.version,
    },
    nodes: [
      //
      //
      //
      ...Maps,
    ],
    links: [
      {
        id: "",
        source: Maps[0].id,
        target: Maps[1].id,
      },
      {
        id: "",
        source: Maps[1].id,
        target: Maps[0].id,
      },
      {
        id: "",
        source: Maps[1].id,
        target: Maps[2].id,
      },
    ],
    human: "link id is made of md5(source + target)",
  };

  data.links = data.links.map((link) => {
    return {
      ...link,
      id: md5(`${link.source}${link.target}`),
    };
  });

  //
  return data;
};
export let Discovery = getDiscoveryData();
