import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import { Object3D } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { ColliderManager } from "../../classes/ColliderManager";
import { PlayerCollider } from "../../canvas/PlayerCollider/PlayerCollider";
import { Now } from "../../store/Now";
import { SkyViewControls } from "../../canvas/Controls/SkyViewControls";
import { PlayerDisplay } from "../../canvas/PlayerDisplay/PlayerDisplay";
import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";
import { StarSky } from "../../canvas/StarSky/StarSky";
import { useEnvLight } from "../../utils/use-env-light";
import { FlyTeleport } from "../../game/Portals/FlyTeleport";

export default function SkyCityChurch() {
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
    floor.rotation.y = Math.PI * 0.5;

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

      <PlayerDisplay Now={Now} floor={floor}>
        <PlayerCollider
          Now={Now}
          colliderMesh={colliderManager.collider}
        ></PlayerCollider>
      </PlayerDisplay>

      <SkyViewControls
        colliderMesh={colliderManager.collider}
        Now={Now}
      ></SkyViewControls>
      <Portals envMap={envMap} floor={floor}></Portals>
    </group>
  );
}

function Portals({ floor, envMap }) {
  return (
    <group>
      <FlyTeleport
        start={"zone_a1"}
        dest={"zone_b2"}
        floor={floor}
        envMap={envMap}
        title="To North End"
      />

      <FlyTeleport
        start={"zone_a2"}
        dest={"zone_e1"}
        floor={floor}
        envMap={envMap}
        title="The West End"
      />

      <FlyTeleport
        start={"zone_e2"}
        dest={"zone_a0"}
        envMap={envMap}
        floor={floor}
        title="The East End"
      />

      <FlyTeleport
        start={"zone_a4"}
        dest={"zone_f1"}
        envMap={envMap}
        floor={floor}
        title="The South End"
      />

      <FlyTeleport
        start={"zone_f2"}
        dest={"zone_a0"}
        envMap={envMap}
        floor={floor}
        title="The Brith Place"
      />

      <FlyTeleport
        start={"zone_b1"}
        dest={"zone_a0"}
        floor={floor}
        envMap={envMap}
        title="The Birth Place"
      />
    </group>
  );
}
