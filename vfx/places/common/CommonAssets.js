export const CommonAssets = {
  swimming: {
    slug: "swimming",
    type: "fbx",
    rawurl: `/rpm/rpm-actions-locomotion/swim-forward.fbx`,
    cacheURL: false,
    preload: false,
  },

  floating: {
    slug: "floating",
    type: "fbx",
    rawurl: `/rpm/rpm-actions-locomotion/swim-float.fbx`,
    cacheURL: false,
    preload: false,
  },

  running: {
    slug: "running",
    type: "fbx",
    rawurl: `/rpm/rpm-actions-locomotion/running.fbx`,
    cacheURL: false,
    preload: true,
  },
  standing: {
    slug: "standing",
    type: "fbx",
    rawurl: `/rpm/rpm-actions-locomotion/standing.fbx`,
    cacheURL: false,
    preload: true,
  },

  //
  portalAlphaMap: {
    slug: "portalAlphaMap",
    type: "png",
    rawurl: `/texture/portalAlpahMap.png`,
    cacheURL: false,
    preload: true,
  },
};

export const processAQ = ({ AQ }) => {
  for (let kn in AQ) {
    let obj = AQ[kn];
    if (!obj.url) {
      Object.defineProperty(obj, "url", {
        get: () => {
          if (obj.cacheURL) {
            console.log("using blob url", obj.slug);
            return obj.cacheURL;
          }
          return obj.rawurl;
        },
        set: (v) => {
          obj.url = v;
        },
      });
    }
  }
};

processAQ({ AQ: CommonAssets });
