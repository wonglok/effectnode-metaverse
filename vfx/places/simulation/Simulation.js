import {
  useCubeTexture,
  useGLTF,
  OrbitControls as DOribt,
} from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import {
  CatmullRomCurve3,
  Object3D,
  Vector3,
  sRGBEncoding,
  Color,
  AnimationMixer,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { ColliderManager } from "../../classes/ColliderManager";
import { Now } from "../../store/Now";
import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";
import { useEnvLight } from "../../utils/use-env-light";
import { FunSim } from "./FunSim";
// import { PlayerCollider } from "../../canvas/PlayerCollider/PlayerCollider";
// import { SkyViewControls } from "../../canvas/Controls/SkyViewControls";
// import { PlayerDisplay } from "../../canvas/PlayerDisplay/PlayerDisplay";
// import { StarSky } from "../../canvas/StarSky/StarSky";
// import { useEnvLight } from "../../utils/use-env-light";
// import { FlyTeleport } from "../../game/Portals/FlyTeleport";
// import { WalkerFollowerControls } from "../../canvas/Controls/WalkerFollowerControls";

// import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";
import { useMiniEngine } from "../../utils/use-mini-engine";

export default function Simulation() {
  return (
    <div className="h-full w-full">
      <Starter reducedMaxDPI={3}>
        <Preload Assets={Assets}>
          <Suspense fallback={null}>
            <MapLoader></MapLoader>
            <BG></BG>
          </Suspense>
          <SimpleBloomer></SimpleBloomer>
          {/* <StarSky></StarSky> */}
        </Preload>
      </Starter>
    </div>
  );
}

function BG({ children }) {
  let { get } = useThree();

  const envMap = useCubeTexture(
    ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
    { path: "/cubemap/sky-grass/" }
  );

  useEffect(() => {
    let orig = get().scene.background;
    // envMap.encoding = sRGBEncoding;
    // get().scene.background = envMap;

    get().scene.background = new Color("#000000");

    return () => {
      get().scene.background = orig;
    };
  }, []);
  return <group>{children}</group>;
}

function MapLoader() {
  return (
    <group>
      <Suspense fallback={null}>
        <FlyTracker></FlyTracker>
        <DOribt></DOribt>
      </Suspense>
    </group>
  );
}

function FlyTracker() {
  //
  let gltf = useGLTF(`/particles/old/atv2.glb`);

  let actions = [];
  let mixer = new AnimationMixer(gltf.scene);
  gltf.animations.forEach((clip) => {
    let action = mixer.clipAction(clip);
    actions.push(action);
    action.play();
  });

  useFrame((st, dt) => {
    mixer.update(dt);
  });

  let trackers = [];
  let { mini } = useMiniEngine();

  gltf.scene.traverse((it) => {
    if (it.name.indexOf("particle") === 0) {
      trackers.push(it);
    }
  });

  let sim = useMemo(() => {
    return new FunSim({
      node: mini,
      tailLength: 64, // 512, 1024
      howManyTrackers: 2048,
    });
  }, [trackers, trackers.length]);

  useFrame(() => {
    sim.track();
  });
  //
  return (
    <group scale={1} position={[0, 0, 0]}>
      <primitive object={sim.o3d}></primitive>
    </group>
  );
}

//