import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { NPCHelper } from "../../vfx-content/storymaker-page/NPCHelper";
import { useFrame } from "@react-three/fiber";

export function AvatarNPC({
  collider,
  envMap,
  map,
  Now,
  setNPC = () => {},
  url = `https://d1a370nemizbjq.cloudfront.net/08cf5815-ab1d-4b6f-ab5e-5ec1858ec885.glb`,
}) {
  return (
    <Suspense fallback={null}>
      <AvatarInside
        collider={collider}
        envMap={envMap}
        map={map}
        Now={Now}
        url={url}
        setNPC={setNPC}
      ></AvatarInside>
    </Suspense>
  );
}

function AvatarInside({ url, collider, envMap, map, setNPC = () => null }) {
  let avaGLTF2 = useGLTF(url);

  return (
    <group>
      {collider && (
        <group position={[0, 0, 0]}>
          <NPCHelper
            isSwim={false}
            avatarGLTF={avaGLTF2}
            collider={collider}
            envMap={envMap}
            map={map}
            distance={6}
            setNPC={setNPC}
          ></NPCHelper>
        </group>
      )}
    </group>
  );
}
