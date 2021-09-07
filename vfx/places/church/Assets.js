export const AQ = {
  floorMap: {
    slug: "floorMap",
    type: "glb",
    rawurl: "/map/heavenly-platforms/heavenly-platforms.glb",
    cacheURL: false,
    preload: true,
  },
  swimming: {
    slug: "swimming",
    type: "fbx",
    rawurl: `/rpm/rpm-actions-locomotion/swim-forward.fbx`,
    cacheURL: false,
    preload: true,
  },

  floating: {
    slug: "floating",
    type: "fbx",
    rawurl: `/rpm/rpm-actions-locomotion/swim-float.fbx`,
    cacheURL: false,
    preload: true,
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
};

for (let kn in AQ) {
  let obj = AQ[kn];
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

export const Assets = Object.values(AQ);
