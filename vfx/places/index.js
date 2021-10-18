import dynamic from "next/dynamic";

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
  return {
    id: `${baseURL}/${kn}?index=${encodeURIComponent(i)}`,
    placeID: kn,
    url: `${baseURL}/place/${kn}`,
    baseurl: `/place/${kn}`,
  };
});

export let Discovery = {
  baseURL,
  nodes: [
    ...Maps,
    //
    //
    //
  ],

  links: [
    {
      id: "starlink0001",
      type: "same-site", // same-map, same-site, external-site
      from: {
        title: "Church",
        url: `${baseURL}/place/${"church"}`,
        map: "church",
        coord: { x: 0, y: 0, z: 0 },
      },
      to: {
        title: "Spaceship",
        url: `${baseURL}/place/${"spaceship"}`,
        map: "spaceship",
        coord: { x: 0, y: 0, z: 0 },
      },
    },
    {
      id: "starlink0002",
      type: "same-site", // same-map, same-site, external-site
      from: {
        title: "Church East End",
        url: `${baseURL}/place/${"church"}`,
        map: "church",
        coord: { x: -1, y: 0, z: 0 },
      },
      to: {
        title: "Church West End",
        url: `${baseURL}/place/${"church"}`,
        map: "church",
        coord: { x: 1, y: 0, z: 0 },
      },
    },
    {
      id: "starlink0003",
      type: "external-site", // same-map, same-site, external-site
      from: {
        title: "Spaceship",
        url: `${baseURL}/place/${"spaceship"}`,
        map: "spaceship",
        coord: { x: 0, y: 0, z: 0 },
      },
      to: {
        title: "Thank you Church",
        url: `${`https://metaverse.thanyou.church`}/place/${"church"}`,
        map: "church",
        coord: { x: 0, y: 0, z: 0 },
      },
    },
  ],
};
