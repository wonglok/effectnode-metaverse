//
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense } from "react";
import { LoadingScreen } from "../vfx-content/welcome-page/LoadingScreen";
import { useGLTF } from "@react-three/drei";
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
import { Color, Object3D, sRGBEncoding } from "three";
import { HoneyShip } from "../vfx-content/welcome-page/HoneyShip";
import { WelcomeAvatar } from "../vfx-content/welcome-page/WelcomeAvatar";
import { ToChurch } from "../vfx-content/Portals/ToChurch";

export default function Page({ placeID }) {
  return (
    <Canvas
      concurrent
      dpr={[1, 3]}
      onCreated={({ gl }) => {
        gl.outputEncoding = sRGBEncoding;
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <PageInside placeID={placeID}></PageInside>
    </Canvas>
  );
}

function PageInside({ placeID }) {
  let { scene } = useThree();

  useEffect(() => {
    return () => {
      scene.traverse((it) => {
        if (it?.userData?.bloomAPI) {
          it.userData.bloomAPI.shine();
        }
      });
    };
  }, [placeID]);

  return (
    <group>
      <StarSky></StarSky>
      <SimpleBloomer></SimpleBloomer>

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

  //
  return null;
}

export function Content3D() {
  // let { get } = useThree();
  let { envMap } = useShaderEnvLight({});
  let [collider, setCollider] = useState(false);
  let mapGLTF = useGLTF(`/map/spaewalk/space-walk-v003.glb`);

  let map = useMemo(() => {
    let map = SkeletonUtils.clone(mapGLTF.scene);
    return map;
  }, [mapGLTF]);

  let o3d = new Object3D();

  return (
    <group>
      {createPortal(<primitive object={map}></primitive>, o3d)}
      <primitive object={o3d}></primitive>

      <ambientLight intensity={0.1} />
      <directionalLight intensity={2} position={[0, 3, 3]}></directionalLight>
      <directionalLight intensity={0.1} position={[0, 1, 0]}></directionalLight>

      <UseBG></UseBG>

      {map && Now && (
        <group>
          <Map3D
            onReadyCollider={({ collider }) => {
              setCollider(collider);
            }}
            object={map}
          ></Map3D>
          <group
            position={[
              //
              map.getObjectByName("welcomeAt").position.x,
              0,
              map.getObjectByName("welcomeAt").position.z,
            ]}
          >
            <Suspense fallback={null}>
              <group position={[0, 0, -30]}>
                <HoneyShip></HoneyShip>
              </group>
            </Suspense>

            <Suspense fallback={null}>
              <WelcomeAvatar envMap={envMap}></WelcomeAvatar>
            </Suspense>

            <group position={[-1, 1, 0]}>
              <ToChurch />
            </group>
          </group>

          {collider && (
            <group>
              <UserContorls
                higherCamera={-0.7}
                avatarSpeed={1.2}
                Now={Now}
              ></UserContorls>
              <TailCursor Now={Now} color={"#ffffff"}></TailCursor>
              <TheHelper Now={Now}></TheHelper>
            </group>
          )}
        </group>
      )}
    </group>
  );
}
