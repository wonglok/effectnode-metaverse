import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { NPCHelper } from "../../vfx-content/storymaker-page/NPCHelper";
import { useFrame } from "@react-three/fiber";

export function AvatarNPC({
  collider,
  envMap,
  map,
  NPC,
  setNPC = () => {},
  url = `https://d1a370nemizbjq.cloudfront.net/08cf5815-ab1d-4b6f-ab5e-5ec1858ec885.glb`,
}) {
  return (
    <Suspense fallback={null}>
      <AvatarInside
        collider={collider}
        envMap={envMap}
        map={map}
        NPC={NPC}
        url={url}
        setNPC={setNPC}
      ></AvatarInside>
    </Suspense>
  );
}

function AvatarInside({ url, collider, envMap, map, NPC }) {
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
            NPC={NPC}
          ></NPCHelper>
        </group>
      )}
    </group>
  );
}
