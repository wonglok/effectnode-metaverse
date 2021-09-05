// useMemo,
import { useEffect, useState } from "react";
// import { createPortal, useThree } from "@react-three/fiber";
import { Suspense } from "react";
// import { LoadingScreen } from "../vfx-content/welcome-page/LoadingScreen";
import { useGLTF } from "@react-three/drei";
// import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
// import {
//   Map3D,
//   StarSky,
//   TailCursor,
//   TheHelper,
//   UserContorls,
// } from "../vfx-metaverse";
// import { useShaderEnvLight } from "../vfx-content/welcome-page/useShaderEnvLight";
// import { Now } from "../vfx-metaverse/lib/Now";
// import { SceneDecorator } from "../vfx-metaverse/compos/SceneDecorator";
import { NPCHelper } from "../../vfx-content/storymaker-page/NPCHelper";
// import { Color, Object3D } from "three";
import { getFirebase } from "../../vfx-firebase/firelib";
// import { AvatarPortal } from "../vfx-content/AvatarPortal/AvatarPortal";
// import { LoginGateR3F } from "../vfx-content/LoginGateR3F/LoginGateR3F";
// import { LoginBall } from "../vfx-content/welcome-page/LoginBall";

import router from "next/router";

export function MySelf({
  distance,
  envMap,
  map,
  collider,
  isSwim = true,
  enableLight = true,
}) {
  let [url, setURL] = useState(false);

  useEffect(() => {
    return getFirebase()
      .auth()
      .onAuthStateChanged(async (user) => {
        if (user && user.uid) {
          let snap = await getFirebase()
            .database()
            .ref(`/card-avatar-info/${router.query.cardID}`)
            .get();
          let val = snap.val();

          if (val && val.avatarURL) {
            setURL(val.avatarURL);
          } else {
          }
        }
      });
  }, []);

  return (
    <group>
      {url && (
        <Suspense fallback={null}>
          <MyNPC
            url={url}
            distance={distance}
            enableLight={enableLight}
            isSwim={isSwim}
            collider={collider}
            envMap={envMap}
            map={map}
          ></MyNPC>
        </Suspense>
      )}
    </group>
  );
}

function MyNPC({ url, distance, enableLight, isSwim, envMap, map, collider }) {
  let avaGLTF = useGLTF(url);

  return (
    <group>
      {collider && (
        <NPCHelper
          distance={distance}
          enableLight={enableLight}
          isSwim={isSwim}
          avatarGLTF={avaGLTF}
          collider={collider}
          envMap={envMap}
          map={map}
          lighting={false}
        ></NPCHelper>
      )}
    </group>
  );
}
