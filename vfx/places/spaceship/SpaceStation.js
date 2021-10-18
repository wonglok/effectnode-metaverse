import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import { Object3D } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { ColliderManager } from "../../classes/ColliderManager";
import { PlayerCollider } from "../../canvas/PlayerCollider/PlayerCollider";
import { Now } from "../../store/Now";
import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";
import { StarSky } from "../../canvas/StarSky/StarSky";
import { useEnvLight } from "../../utils/use-env-light";
import { WalkerFollowerControls } from "../../canvas/Controls/WalkerFollowerControls";
import { PlayerDisplay } from "../../canvas/PlayerDisplay/PlayerDisplay";
import { ForceGraphR3F } from "../../explore/ForceGraphR3F";
import { useAutoEvent } from "../../utils/use-auto-event";
import { baseURL } from "..";
import router from "next/router";

export default function SpaceStation() {
  return (
    <div className="h-full w-full">
      <Starter>
        <Preload Assets={Assets}>
          <MapLoader></MapLoader>
          <SimpleBloomer></SimpleBloomer>
          <StarSky></StarSky>
        </Preload>
      </Starter>
    </div>
  );
}

function MapLoader() {
  return (
    <group>
      <Suspense fallback={null}>
        <MapContent></MapContent>
      </Suspense>
    </group>
  );
}

function MapContent() {
  let { get } = useThree();
  let gltf = useGLTF(AQ.floorMap.url);
  let { envMap } = useEnvLight();

  let floor = useMemo(() => {
    let floor = SkeletonUtils.clone(gltf.scene);
    // floor.rotation.y = Math.PI * 0.5;

    let startAt = floor.getObjectByName("startAt");
    if (startAt) {
      startAt.getWorldPosition(Now.startAt);
      startAt.getWorldPosition(Now.avatarAt);
      startAt.getWorldPosition(Now.goingTo);
      Now.goingTo.y += 1.3;
    }
    return floor;
  }, [gltf]);

  let colliderManager = useMemo(() => {
    return new ColliderManager({ floor, scene: get().scene });
  }, [floor]);

  let o3d = new Object3D();

  let metagraph = useRef();

  useEffect(() => {
    //
    //
    if (metagraph.current) {
      floor
        .getObjectByName("startAt")
        .getWorldPosition(metagraph.current.position);
      metagraph.current.position.x += -1;
      metagraph.current.position.y += 1.3;
      metagraph.current.position.z += -5;
      metagraph.current.scale.setScalar(0.03);
    }
    //
    //
  }, []);

  return (
    <group>
      <directionalLight intensity={3} position={[3, 3, 3]} />
      <primitive object={o3d}></primitive>
      {createPortal(<primitive object={floor}></primitive>, o3d)}

      {createPortal(
        <group visible={false}>
          <primitive object={colliderManager.preview}></primitive>
        </group>,
        o3d
      )}

      <PlayerCollider
        Now={Now}
        colliderMesh={colliderManager.collider}
      ></PlayerCollider>

      <PlayerDisplay
        lookBack={true}
        envMap={envMap}
        Now={Now}
        floor={floor}
        isSwim={false}
      ></PlayerDisplay>

      <group ref={metagraph}>
        <ForceGraphR3F></ForceGraphR3F>
      </group>

      {/*
      <FirstCamControls
        Now={Now}
        colliderMesh={colliderManager.collider}
      ></FirstCamControls> */}

      <WalkerFollowerControls floor={floor}></WalkerFollowerControls>
    </group>
  );
}

//

//

//
