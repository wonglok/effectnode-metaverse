import { CommonAssets, processAQ } from "../common/CommonAssets";

export const AQ = {
  floorMap: {
    slug: "floorMap",
    type: "glb",
    rawurl: "/map/orchid-sing/orchid-sing.glb",
    cacheURL: false,
    preload: false,
  },
  butterfly: {
    slug: "butterfly",
    type: "glb",
    rawurl: "/objects/butterfly/butterfly.glb",
    cacheURL: false,
    preload: false,
  },
  ...CommonAssets,
};

processAQ({ AQ });

export const Assets = Object.values(AQ);

//
