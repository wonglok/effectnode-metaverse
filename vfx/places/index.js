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

export let getDiscoveryData = () => {
  const MyMaps = getPages().map((obj) => {
    let url = `${SiteBaseURL}${obj.slug}`;
    return {
      ...obj,
      site: SiteBaseURL,
      id: md5(url),
      url,
    };
  });

  let data = {
    meta: {
      schema: "metaverse-starlink",
      license: "MIT",
      version: "0.0.1",
    },
    nodes: [
      //
      ...MyMaps,
    ],
    links: [
      {
        id: "",
        source: MyMaps[0].id,
        target: MyMaps[1].id,
      },
      {
        id: "",
        source: MyMaps[0].id,
        target: MyMaps[2].id,
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
