//
import { useMemo, useState } from "react";
import { createPortal } from "@react-three/fiber";
// import { getGPUTier } from "detect-gpu";
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
import { SceneDecorator } from "../vfx-metaverse/compos/SceneDecorator";
import { WelcomeAvatar } from "../vfx-content/welcome-page/WelcomeAvatar";
import { HoneyShip } from "../vfx-content/welcome-page/HoneyShip";
import { LoginBall } from "../vfx-content/welcome-page/LoginBall";
import { Object3D } from "three";

//
export default function SpaceStation() {
  // let [wait, setOK] = useState(true);

  return (
    <Suspense fallback={<LoadingScreen></LoadingScreen>}>
      {/* {wait && ( */}
      <group>
        <Content3D></Content3D>
        {/* <Preload all></Preload> */}
      </group>
      {/* )} */}
    </Suspense>
  );
}

function Content3D() {
  let { envMap } = useShaderEnvLight({});
  let [collider, setCollider] = useState(false);
  let mapGLTF = useGLTF(`/map/spaewalk/space-walk-v003.glb`);

  //
  // let avaGLTF = useGLTF(
  //   `https://d1a370nemizbjq.cloudfront.net/18bc89a8-de85-4a28-b3aa-d1ce4096059f.glb`
  // );
  //

  let map = useMemo(() => {
    let map = SkeletonUtils.clone(mapGLTF.scene);
    return map;
  }, [mapGLTF]);

  let o3d = new Object3D();

  return (
    <group>
      <group position={[0, 0, 200]}>
        <StarSky></StarSky>
      </group>

      {createPortal(<primitive object={map}></primitive>, o3d)}
      <primitive object={o3d}></primitive>
      <SceneDecorator object={map}></SceneDecorator>

      <Map3D
        onReadyCollider={({ collider }) => {
          setCollider(collider);
        }}
        object={map}
      ></Map3D>

      <HoneyShip></HoneyShip>
      <LoginBall envMap={envMap}></LoginBall>

      <mesh
        onClick={() => {
          let router = require("next/router").default;
          router.push(`/place/movie`);
        }}
        position={[3, 2, 23]}
        userData={{
          onClick: () => {
            let router = require("next/router").default;
            router.push(`/place/movie`);
          },
          hint: "Let's Make Action Movie",
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

      {map && (
        <group>
          <UserContorls
            higherCamera={-0.6}
            avatarSpeed={0.9}
            Now={Now}
          ></UserContorls>

          <group
            position={[
              //
              map.getObjectByName("welcomeAt").position.x,
              0,
              map.getObjectByName("welcomeAt").position.z,
            ]}
          >
            <WelcomeAvatar envMap={envMap}></WelcomeAvatar>
          </group>

          {collider && (
            <group>
              <TailCursor Now={Now} color={"#ffffff"}></TailCursor>
              <TheHelper Now={Now}></TheHelper>

              <SimpleBloomer></SimpleBloomer>
            </group>
          )}

          {/* <LoginGate></LoginGate> */}
        </group>
      )}
    </group>
  );
}
