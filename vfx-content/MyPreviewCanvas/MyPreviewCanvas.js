//
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { Suspense } from "react";
import { LoadingScreen } from "../../vfx-content/welcome-page/LoadingScreen";
import { Preload, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import {
  Map3D,
  SimpleBloomer,
  StarSky,
  TailCursor,
  TheHelper,
  UserContorls,
} from "../../vfx-metaverse";
import { useShaderEnvLight } from "../../vfx-content/welcome-page/useShaderEnvLight";
import { Now } from "../../vfx-metaverse/lib/Now";
import { SceneDecorator } from "../../vfx-metaverse/compos/SceneDecorator";
import { NPCHelper } from "../../vfx-content/storymaker-page/NPCHelper";
// import { AvatarSlots } from "../../vfx-content/storymaker-page/AvatarSlots";
import { WelcomeAvatar } from "../../vfx-content/welcome-page/WelcomeAvatar";
import { Color, Object3D, TextureFilter } from "three";
import { AvatarNPC } from "../../vfx-content/AvatarNPC/AvatarNPC";
import {
  makePlayBack,
  MySelf,
} from "../../vfx-content/TellStoryCanvas/MySelf.js";
// import { HoneyShip } from "../../vfx-content/welcome-page/HoneyShip";
// import { LoginBall } from "../../vfx-content/welcome-page/LoginBall";
// import { LoginGate } from "../../vfx-cms/common/LoginGate";

export function MyPreviewCanvas() {
  return (
    <div className="w-full h-full">
      <Canvas
        className=" "
        concurrent
        onCreated={(st) => {
          st.gl.physicallyCorrectLights = true;
        }}
        dpr={[1, 3]}
      >
        <StarSky></StarSky>
        <SimpleBloomer></SimpleBloomer>

        <Suspense fallback={<LoadingScreen></LoadingScreen>}>
          <Content3D></Content3D>
        </Suspense>
      </Canvas>
    </div>
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

  //
  return null;
}

export function Content3D() {
  let { envMap } = useShaderEnvLight({});
  let [collider, setCollider] = useState(false);
  let mapGLTF = useGLTF(`/map/spaewalk/space-walk-v003.glb`);
  // let avaGLTF1 = useGLTF(
  //   `https://d1a370nemizbjq.cloudfront.net/18bc89a8-de85-4a28-b3aa-d1ce4096059f.glb`
  // );

  let map = useMemo(() => {
    let map = mapGLTF.scene;
    // let map = SkeletonUtils.clone(mapGLTF.scene);
    return map;
  }, [mapGLTF]);

  let PlaybackState = useMemo(() => {
    return makePlayBack();
  }, []);

  let o3d = new Object3D();
  return (
    <group>
      <UseBG></UseBG>

      {/*  */}
      <Map3D
        onReadyCollider={({ collider }) => {
          setCollider(collider);
        }}
        object={map}
      ></Map3D>

      {createPortal(<primitive object={map}></primitive>, o3d)}
      <primitive object={o3d}></primitive>

      {map && (
        <group>
          <SceneDecorator object={map}></SceneDecorator>

          {/* <UserContorls
            higherCamera={-0.6}
            avatarSpeed={0.9}
            Now={Now}
          ></UserContorls> */}

          {/*
          {collider && (
            <group position={[-1, 0, 0]}>
              <NPCHelper
                isSwim={false}
                avatarGLTF={avaGLTF1}
                collider={collider}
                envMap={envMap}
                map={map}
              ></NPCHelper>
            </group>
          )} */}
          {/* {map && <AvatarSlots envMap={envMap} map={map}></AvatarSlots>} */}

          {/* <AvatarNPC collider={collider} envMap={envMap} map={map}></AvatarNPC> */}

          <group
            position={[
              //
              map.getObjectByName("welcomeAt").position.x,
              0,
              map.getObjectByName("welcomeAt").position.z,
            ]}
          >
            <directionalLight
              intensity={2}
              position={[3, 3, 3]}
            ></directionalLight>

            {/* <WelcomeAvatar envMap={envMap}></WelcomeAvatar> */}
          </group>

          {collider && (
            <group>
              {/* <TailCursor Now={Now} color={"#ffffff"}></TailCursor>
              <TheHelper Now={Now}></TheHelper> */}
            </group>
          )}
        </group>
      )}

      <group
        position={[
          //
          map.getObjectByName("welcomeAt").position.x,
          0,
          map.getObjectByName("welcomeAt").position.z,
        ]}
      >
        <MySelf
          envMap={envMap}
          holder={"genesis-story-teller-1"}
          PlaybackState={PlaybackState}
        ></MySelf>
      </group>

      <CamRig></CamRig>
    </group>
  );
}

function CamRig() {
  useFrame(({ camera }) => {
    camera.position.y = 1.5;
    camera.position.z = 27.5;
    camera.position.x = 0;
    camera.rotation.x = -0.05 * 0.5 * Math.PI;
  });

  return null;
}

// function Avatar({ collider, envMap, map }) {
//   return (
//     <Suspense fallback={null}>
//       <AvatarInside
//         collider={collider}
//         envMap={envMap}
//         map={map}
//       ></AvatarInside>
//     </Suspense>
//   );
// }

// function AvatarInside({ collider, envMap, map }) {
//   let avaGLTF2 = useGLTF(
//     `https://d1a370nemizbjq.cloudfront.net/08cf5815-ab1d-4b6f-ab5e-5ec1858ec885.glb`
//   );

//   return (
//     <group>
//       {collider && (
//         <group position={[0, 0, 0]}>
//           <NPCHelper
//             isSwim={true}
//             avatarGLTF={avaGLTF2}
//             collider={collider}
//             envMap={envMap}
//             map={map}
//             distance={6}
//           ></NPCHelper>
//         </group>
//       )}
//     </group>
//   );
// }
