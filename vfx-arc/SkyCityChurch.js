//
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense } from "react";
import { LoadingScreen } from "../vfx-content/welcome-page/LoadingScreen";
import { Plane, useFBO, useGLTF } from "@react-three/drei";
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
import { Color, Object3D, Scene, sRGBEncoding, PerspectiveCamera } from "three";
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
import { MapPortal } from "../vfx-content/Portals/MapPortal";
import { FlyTeleport } from "../vfx-content/Portals/FlyTeleport";
import { MiniMap } from "../vfx-content/MiniMap/MiniMap";

//
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

let t = 0;
function Beacon({ NPC }) {
  let ref = useRef();

  useFrame((st, dt) => {
    t += dt;
    ref.current.position.set(
      //
      NPC.goingTo.x,
      NPC.goingTo.y,
      NPC.goingTo.z
    );
    ref.current.rotation.y = t * 3.0;

    if (NPC.isDown) {
      ref.current.visible = true;
    } else {
      if (NPC.avatarAt.distanceTo(NPC.goingTo) <= 3.5) {
        ref.current.visible = false;
      } else {
        ref.current.visible = true;
      }
    }
  });

  return (
    <group position={[0, 1, 0]} scale={[1, 1, 1]}>
      <group ref={ref}>
        <mesh
          position={[0, 0.5, 0]}
          rotation={[Math.PI * 0.25, 0, Math.PI * 0.25]}
          scale={[1, 1, 1]}
          userData={{
            enableBloom: true,
          }}
        >
          {/*  */}
          <meshStandardMaterial
            flatShading={true}
            color="#bababa"
            metalness={1}
            roughness={0}
          />
          <icosahedronBufferGeometry args={[1, 0]}></icosahedronBufferGeometry>
        </mesh>
      </group>
    </group>
  );
}

export function Content3D() {
  let { get } = useThree();
  let { envMap } = useShaderEnvLight({});
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

      {/* {map && <MiniMap map={map}></MiniMap>} */}

      <ambientLight intensity={0.1} />
      <directionalLight intensity={2} position={[0, 3, 3]}></directionalLight>
      <directionalLight intensity={0.1} position={[0, 1, 0]}></directionalLight>

      <UseBG></UseBG>

      {map && Now && (
        <group>
          <Map3D
            simulate={false}
            onReadyCollider={({ collider }) => {
              setCollider(collider);
            }}
            object={map}
          ></Map3D>

          {collider && (
            <group>
              {/*  */}
              {/*  */}

              <FlyTeleport
                start={"zone_a1"}
                dest={"zone_b2"}
                map={map}
                envMap={envMap}
                title="To North End"
              />

              <FlyTeleport
                start={"zone_a2"}
                dest={"zone_e1"}
                map={map}
                envMap={envMap}
                title="The West End"
              />

              <FlyTeleport
                start={"zone_e2"}
                dest={"zone_a0"}
                envMap={envMap}
                map={map}
                title="The East End"
              />

              <FlyTeleport
                start={"zone_a4"}
                dest={"zone_f1"}
                envMap={envMap}
                map={map}
                title="The South End"
              />

              <FlyTeleport
                start={"zone_f2"}
                dest={"zone_a0"}
                envMap={envMap}
                map={map}
                title="The Brith Place"
              />

              <FlyTeleport
                start={"zone_b1"}
                dest={"zone_a0"}
                map={map}
                envMap={envMap}
                title="The Birth Place"
              />

              {Now && (
                <SkyViewControls
                  collider={collider}
                  Now={Now}
                ></SkyViewControls>
              )}

              <AvatarNPC
                collider={collider}
                envMap={envMap}
                map={map}
                NPC={Now}
                url={`https://d1a370nemizbjq.cloudfront.net/08cf5815-ab1d-4b6f-ab5e-5ec1858ec885.glb`}
              ></AvatarNPC>

              {Now && <Beacon NPC={Now} />}
            </group>
          )}
        </group>
      )}
    </group>
  );
}
