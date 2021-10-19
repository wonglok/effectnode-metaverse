import dynamic from "next/dynamic";
import md5 from "md5";

export let SiteBaseURL = "https://metaverse.effectnode.com";

export let getPages = () => {
  return [
    {
      placeID: `spaceship`,
      slug: `/place/spaceship`,
      title: "Spaceship",
      thumbnail: `${SiteBaseURL}/preview/spaceship-thumb.png`,
      compo: dynamic(() => import("./spaceship/SpaceStation"), {
        ssr: false,
      }),
    },
    {
      placeID: `church`,
      slug: `/place/church`,
      title: "Thank you Church",
      thumbnail: `${SiteBaseURL}/preview/church-thumb.png`,
      compo: dynamic(() => import("./church/SkyCityChurch"), {
        ssr: false,
      }),
    },
    {
      placeID: `sing`,
      slug: `/place/sing`,
      title: "Thank you Worship",
      thumbnail: `${SiteBaseURL}/preview/sing-thumb.png`,
      compo: dynamic(() => import("./sing/Sing"), {
        ssr: false,
      }),
    },
  ];
};

export let getMyFreinds = async () => {
  let list = [];

  list.push({
    id: md5(`https://loving.place/api/starlink`),
    type: "starlink",
    title: `Loving Place`,
    url: `https://loving.place/api/starlink`,
  });

  list.push({
    id: md5(`https://metaverse.thankyou.church/api/starlink`),
    type: "starlink",
    title: `Metaverse Church`,
    url: `https://metaverse.thankyou.church/api/starlink`,
  });

  return list;
};

export let getDiscoveryData = async ({ origin = SiteBaseURL }) => {
  if (!origin) {
    origin = SiteBaseURL;
  }
  let endpoint = `${origin}/api/starlink`;
  let yourselfID = md5(endpoint);

  let yourCore = {
    id: yourselfID,
    thumbnail: `${origin}/me.png`,
    endpoint,
    type: "core",
  };

  let friends = await getMyFreinds();

  const MyMaps = getPages().map((obj) => {
    let url = `${origin}${obj.slug}`;
    return {
      ...obj,
      site: origin,
      id: md5(url),
      url,
      type: "map",
    };
  });

  let data = {
    id: yourCore.id,
    meta: {
      schema: "metaverse-starlink",
      license: "MIT",
      version: "0.0.1",
    },
    myself: yourCore,
    nodes: [
      //
      yourCore,
      ...MyMaps,
    ],
    links: [],
    notes: [
      //
      "node id is made of md5(url)",
      "link id is made of md5(source id + target id)",
    ],
    friends,
  };

  data.links = MyMaps.map((obj) => {
    let source = yourCore.id;
    let target = obj.id;
    let id = md5(`${source}${target}`);
    return {
      id,
      source,
      target,
    };
  });

  //

  //
  return data;
};
