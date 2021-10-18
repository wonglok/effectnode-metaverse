import dynamic from "next/dynamic";
import { getID } from "../utils/get-id";
import md5 from "md5";
import pkg from "../../package.json";
export const baseURL = "https://metaverse.effectnode.com";

export let Pages = {
  spaceship: dynamic(() => import("./spaceship/SpaceStation"), {
    ssr: false,
  }),
  // sing: dynamic(() => import("./sing/Sing"), { ssr: false }),
  church: dynamic(() => import("./church/SkyCityChurch"), {
    ssr: false,
  }),
};

const Maps = Object.keys(Pages).map((kn, i) => {
  let url = `${baseURL}/place/${kn}`;
  return {
    id: url,
    plageKey: "place",
    placeID: kn,
    title: kn,
    baseURL,
    url,
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
      ...Maps,
      //
      //
      //
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
