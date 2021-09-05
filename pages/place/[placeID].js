//
import { Canvas, useThree } from "@react-three/fiber";
import { SimpleBloomer } from "../../vfx-metaverse";
import { sRGBEncoding } from "three";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// import { NPCHelper } from "../../vfx-content/storymaker-page/NPCHelper";
// import { AvatarSlots } from "../../vfx-content/storymaker-page/AvatarSlots";
// import { LoginGate } from "../../vfx-cms/common/LoginGate";

export async function getServerSideProps(context) {
  let placeID = context?.query?.placeID || null;

  if (!placeID) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      placeID,
    },
  };
}

export default function StoryPage({ placeID }) {
  return (
    <div className="full">
      <PageRouter placeID={placeID}></PageRouter>
    </div>
  );
}

let Pages = {
  //
  church: dynamic(() => import("../../vfx-arc/SkyCityChurch")),
  // spaceship: dynamic(() => import("../../vfx-arc/SpaceStation")),
  // movie: dynamic(() => import("../../vfx-arc/MovieScene")),
};

function PageRouter({ placeID }) {
  let MyPage = <div></div>;

  if (Pages[placeID]) {
    MyPage = Pages[placeID];
  }

  return <MyPage placeID={placeID}></MyPage>;
}
