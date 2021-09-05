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
  // TailCursor,
  // TheHelper,
  // UserContorls,
} from "../vfx-metaverse";
import { useShaderEnvLight } from "../vfx-content/welcome-page/useShaderEnvLight";
import { Now } from "../vfx-metaverse/lib/Now";
// import { SceneDecorator } from "../vfx-metaverse/compos/SceneDecorator";
import { Color, Object3D, sRGBEncoding } from "three";
// import { LoginGateR3F } from "../vfx-content/LoginGateR3F/LoginGateR3F";
// import { LoginBall } from "../vfx-content/welcome-page/LoginBall";
// import { StoryPortal } from "../vfx-content/StoryPortal/StoryPortal";
// import {
//   makePlayBack,
//   MySelf as StorySelf,
// } from "../vfx-content/TellStoryCanvas/MySelf";
import {
  // ApplyNowStateToNPCState,
  AvatarNPC,
} from "../vfx-content/AvatarNPC/AvatarNPC";
import { SkyViewControls } from "../vfx-content/SkyViewContorls/SkyViewControls";

// import { AvatarPortal } from "../vfx-content/AvatarPortal/AvatarPortal";
// import { MySelf } from "../vfx-content/MySelf/MySelf";

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

function Beacon({ NPC }) {
  let ref = useRef();

  useFrame(({ clock }) => {
    let t = clock.getElapsedTime();
    ref.current.position.set(
      //
      NPC.goingTo.x,
      NPC.goingTo.y,
      NPC.goingTo.z
    );
    ref.current.position.y += 1.5;
    ref.current.position.y += Math.sin(t * 3.0);

    if (NPC.isDown) {
      ref.current.visible = true;
    } else {
      if (NPC.avatarAt.distanceTo(NPC.goingTo) <= 4) {
        ref.current.visible = false;
      } else {
        ref.current.visible = true;
      }
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <meshStandardMaterial metalness={1} roughness={0} />
        <sphereBufferGeometry></sphereBufferGeometry>
      </mesh>
    </group>
  );
}

export function Content3D() {
  // let { get } = useThree();
  let { envMap } = useShaderEnvLight({});
  let [NPC, setNPC] = useState(false);
  let [collider, setCollider] = useState(false);
  let mapGLTF = useGLTF(`/map/heavenly-platforms/heavenly-platforms.glb`);
  mapGLTF.scene.rotation.y = Math.PI * 0.5;

  let map = useMemo(() => {
    // let map = mapGLTF.scene;
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

      {/* <group rotation={[0, 0, 0]} position={[-6.7, 1, 2 + 9.3]}>
        <LoginBall></LoginBall>
      </group> */}

      {/* <LoginGateR3F> */}
      {/* <group position={[-6.7, 1, 9.3]}>
          <AvatarPortal></AvatarPortal>
        </group> */}

      {/* <group rotation={[0, 0, 0]} position={[-6.7, 1, 1 + 9.3]}>
          <StoryPortal></StoryPortal>
        </group> */}

      {/* {collider && <primitive object={collider}></primitive>} */}
      {/* {collider && (
          <MySelf
            isSwim={true}
            enableLight={true}
            collider={collider}
            envMap={envMap}
            map={map}
            distance={6.5}
          ></MySelf>
        )} */}
      {/* </LoginGateR3F> */}

      {/* {
        <group rotation={[0, 0, 0]} position={[2.1, 0, 6]}>
          <FaceCam>
            <StorySelf
              envMap={envMap}
              holder={"genesis-story-teller-1"}
              PlaybackState={PlaybackState}
            ></StorySelf>
          </FaceCam>
        </group>
      } */}

      {map && Now && (
        <group>
          <Map3D
            onReadyCollider={({ collider }) => {
              setCollider(collider);
            }}
            object={map}
          ></Map3D>

          {collider && (
            <group>
              {/* <UserContorls
                higherCamera={-0.7}
                avatarSpeed={0.9}
                Now={Now}
              ></UserContorls> */}

              {NPC && (
                <SkyViewControls
                  collider={collider}
                  NPC={NPC}
                  Now={Now}
                ></SkyViewControls>
              )}

              <AvatarNPC
                collider={collider}
                envMap={envMap}
                map={map}
                Now={Now}
                setNPC={setNPC}
                url={`https://d1a370nemizbjq.cloudfront.net/08cf5815-ab1d-4b6f-ab5e-5ec1858ec885.glb`}
              ></AvatarNPC>

              {/* <LoginGateR3F></LoginGateR3F> */}

              {NPC && <Beacon NPC={NPC} />}

              {/* <SceneDecorator object={map}></SceneDecorator> */}
              {/* <TailCursor Now={Now} color={"#ffffff"}></TailCursor> */}
              {/* <TheHelper Now={Now}></TheHelper> */}
            </group>
          )}
        </group>
      )}
    </group>
  );
}

function FaceCam({ children }) {
  let ref = useRef();

  //
  useFrame(({ camera }) => {
    if (ref.current) {
      //
      ref.current.lookAt(
        camera.position.x,
        ref.current.position.y,
        camera.position.z
      );
    }
    //
  });

  return <group ref={ref}>{children}</group>;
}
