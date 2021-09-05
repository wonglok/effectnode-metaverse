//
import { useMemo, useRef, useState } from "react";
import { Canvas, createPortal } from "@react-three/fiber";
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
import { AvatarSlots } from "../../vfx-content/storymaker-page/AvatarSlots";
// import { LoginGate } from "../../vfx-cms/common/LoginGate";
export default function StoryPage() {
  //

  let [wait, setOK] = useState(false);
  return (
    <div className="full">
      <Canvas
        concurrent
        dpr={[1, 3]}
        onCreated={({ gl }) => {
          getGPUTier({ glContext: gl.getContext() }).then((v) => {
            let setDPR = ([a, b]) => {
              let base = window.devicePixelRatio || 1;
              if (b >= base) {
                b = base;
              }

              gl.setPixelRatio(b);

              setOK(true);
            };

            if (v.gpu === "apple a9x gpu") {
              setDPR([1, 1]);
              return;
            } else if (v.fps <= 30) {
              setDPR([1, 1]);
            } else if (v.tier >= 3) {
              setDPR([1, 3]);
            } else if (v.tier >= 2) {
              setDPR([1, 2]);
            } else if (v.tier >= 1) {
              setDPR([1, 1]);
            } else if (v.tier < 1) {
              setDPR([1, 1]);
            }
          });
        }}
        //
        //
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={<LoadingScreen></LoadingScreen>}>
          {wait && (
            <group>
              <Content3D></Content3D>
              <Preload all></Preload>
            </group>
          )}
        </Suspense>
        <StarSky></StarSky>
      </Canvas>
    </div>
  );
}

//

function Content3D() {
  let { envMap } = useShaderEnvLight({});
  let [collider, setCollider] = useState(false);
  let mapGLTF = useGLTF(`/map/camset/cam-set.glb`);
  let avaGLTF = useGLTF(
    `https://d1a370nemizbjq.cloudfront.net/18bc89a8-de85-4a28-b3aa-d1ce4096059f.glb`
  );

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
      <Map3D
        onReadyCollider={({ collider }) => {
          setCollider(collider);
        }}
        object={map}
      ></Map3D>

      {map && (
        <group>
          <primitive object={map}></primitive>

          <SceneDecorator object={map}></SceneDecorator>

          <UserContorls
            higherCamera={-0.6}
            avatarSpeed={0.9}
            Now={Now}
          ></UserContorls>

          {collider && (
            <NPCHelper
              avatarGLTF={avaGLTF}
              collider={collider}
              envMap={envMap}
              map={map}
            ></NPCHelper>
          )}
          {map && <AvatarSlots envMap={envMap} map={map}></AvatarSlots>}

          {collider && (
            <group>
              <TailCursor Now={Now} color={"#ffffff"}></TailCursor>

              <TheHelper Now={Now}></TheHelper>

              <SimpleBloomer></SimpleBloomer>
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
