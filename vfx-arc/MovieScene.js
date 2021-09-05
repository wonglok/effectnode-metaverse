//
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useThree } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { Suspense } from "react";
import { LoadingScreen } from "../vfx-content/welcome-page/LoadingScreen";
import { Preload, Stars, useFBX, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import {
  Map3D,
  SimpleBloomer,
  StarSky,
  TailCursor,
  TheHelper,
  UserContorls,
} from "../vfx-metaverse";
import { useShaderEnvLight } from "../vfx-content/welcome-page/useShaderEnvLight";
import { Now } from "../vfx-metaverse/lib/Now";
import { SceneDecorator } from "../vfx-metaverse/compos/SceneDecorator";
import { NPCHelper } from "../vfx-content/storymaker-page/NPCHelper";
import { AvatarSlots } from "../vfx-content/storymaker-page/AvatarSlots";
import { Color } from "three";
import { AvatarNPC } from "../vfx-content/AvatarNPC/AvatarNPC";

// import { WelcomeAvatar } from "../vfx-content/welcome-page/WelcomeAvatar";
// import { HoneyShip } from "../vfx-content/welcome-page/HoneyShip";
// import { LoginBall } from "../vfx-content/welcome-page/LoginBall";
// import { LoginGate } from "../vfx-cms/common/LoginGate";

//

export default function Page() {
  return (
    <group>
      <StarSky></StarSky>
      <Suspense fallback={<LoadingScreen></LoadingScreen>}>
        <Content3D></Content3D>
      </Suspense>
    </group>
  );
}

function UseBG() {
  let { scene } = useThree();
  useEffect(() => {
    let orig = scene.background;
    scene.background = new Color("#000");
    return () => {
      scene.background = orig;
    };
  });
  return null;
}

export function Content3D() {
  let { envMap } = useShaderEnvLight({});
  let [collider, setCollider] = useState(false);
  let mapGLTF = useGLTF(`/map/camset/cam-set.glb`);
  // let avaGLTF = useGLTF(
  //   `https://d1a370nemizbjq.cloudfront.net/18bc89a8-de85-4a28-b3aa-d1ce4096059f.glb`
  // );

  let last = useRef();
  let map = useMemo(() => {
    if (last.current) {
      last.current.visible = false;
      if (last.current?.parent) {
        last.current.parent.remove(last.current);
      }
    }
    let map = SkeletonUtils.clone(mapGLTF.scene);
    last.current = map;
    return map;
  }, [mapGLTF]);

  return (
    <group>
      {/* <SimpleBloomer></SimpleBloomer> */}
      <UseBG></UseBG>

      <Map3D
        onReadyCollider={({ collider }) => {
          setCollider(collider);
        }}
        object={map}
      ></Map3D>

      {map && (
        <group>
          <mesh
            onClick={() => {
              let router = require("next/router").default;
              router.push(`/place/spaceship`);
            }}
            position={[3, 2, 23]}
            userData={{
              onClick: () => {
                let router = require("next/router").default;
                router.push(`/place/spaceship`);
              },
              hint: "Let's Go Home",
            }}
          >
            <sphereBufferGeometry args={[0.3, 23, 23]}></sphereBufferGeometry>
            <meshStandardMaterial
              metalness={1}
              roughness={0}
              envMap={envMap}
              color="#44ffff"
            ></meshStandardMaterial>
          </mesh>

          <primitive object={map}></primitive>

          <SceneDecorator object={map}></SceneDecorator>

          <UserContorls
            higherCamera={-0.6}
            avatarSpeed={0.9}
            Now={Now}
          ></UserContorls>

          {/* {collider && (
            <NPCHelper
              avatarGLTF={avaGLTF}
              collider={collider}
              envMap={envMap}
              map={map}
            ></NPCHelper>
          )} */}

          {collider && (
            <AvatarNPC
              url={`https://d1a370nemizbjq.cloudfront.net/18bc89a8-de85-4a28-b3aa-d1ce4096059f.glb`}
              collider={collider}
              envMap={envMap}
              map={map}
            ></AvatarNPC>
          )}

          {map && <AvatarSlots envMap={envMap} map={map}></AvatarSlots>}

          {collider && (
            <group>
              <TailCursor Now={Now} color={"#ffffff"}></TailCursor>

              <TheHelper Now={Now}></TheHelper>
            </group>
          )}

          {/* <group
        position={[
          //
          map.getObjectByName("startLookAt").position.x,
          0,
          map.getObjectByName("startLookAt").position.z,
        ]}
      >

        <WelcomeAvatar envMap={envMap}></WelcomeAvatar>

      </group> */}

          {/* <LoginGate></LoginGate> */}
        </group>
      )}
    </group>
  );
}
