import { useCubeTexture, useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import { CatmullRomCurve3, Object3D, Vector3, sRGBEncoding } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { ColliderManager } from "../../classes/ColliderManager";
import { Now } from "../../store/Now";
import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";
import { PathWay } from "../../canvas/MapAddons/PathWay";
import { SongFlyControls } from "../../canvas/Controls/SongFlyControls";
import { Butterflyer } from "./Butterflyer.js";
import { useEnvLight } from "../../utils/use-env-light";

// import { PlayerCollider } from "../../canvas/PlayerCollider/PlayerCollider";
// import { SkyViewControls } from "../../canvas/Controls/SkyViewControls";
// import { PlayerDisplay } from "../../canvas/PlayerDisplay/PlayerDisplay";
// import { StarSky } from "../../canvas/StarSky/StarSky";
// import { useEnvLight } from "../../utils/use-env-light";
// import { FlyTeleport } from "../../game/Portals/FlyTeleport";
// import { WalkerFollowerControls } from "../../canvas/Controls/WalkerFollowerControls";

// import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";

export default function Sing() {
  return (
    <div className="h-full w-full">
      <Starter reducedMaxDPI={1.5}>
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
    envMap.encoding = sRGBEncoding;
    get().scene.background = envMap;

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

  // console.log();

  let roll = useMemo(() => {
    let nameList = [];
    floor.traverse((it) => {
      if (it.name.indexOf("walk") === 0) {
        nameList.push(it.name);
      }
    });

    let pts = nameList.map((e) => {
      let obj = floor.getObjectByName(e) || new Object3D();
      return obj.position;
    });

    if (pts.length === 0) {
      return false;
    }
    return new CatmullRomCurve3(pts, true, "catmullrom", 0.8);
  }, [floor]);

  let f0Action = useMemo(() => {
    let arr = [];

    if (roll) {
      let pts = roll.getPoints(500);

      pts.forEach((e) => {
        let normal = new Vector3(
          Math.random(),
          Math.random(),
          Math.random()
          //
        ).multiplyScalar((Math.random() * 2.0 - 1.0) * 10.0);

        e.add(normal);

        let o3d = new Object3D();
        o3d.position.copy(e);
        o3d.position.y -= 10;
        arr.push(o3d);
      });
    }

    return arr;
  }, [roll]);

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

      {/* <PlayerDisplay Now={Now} floor={floor}>
        <PlayerCollider
          Now={Now}
          colliderMesh={colliderManager.collider}
        ></PlayerCollider>
      </PlayerDisplay>

      <SkyViewControls
        colliderMesh={colliderManager.collider}
        Now={Now}
      ></SkyViewControls> */}

      {/* <Portals envMap={envMap} floor={floor}></Portals> */}

      <SongFlyControls
        overallSpeed={0.1}
        loop={true}
        floor={floor}
      ></SongFlyControls>

      <group position={[0, 1, 0]}>
        <PathWay loop={true} floor={floor}></PathWay>
      </group>

      {f0Action.map((e, i) => {
        let to = f0Action[i].clone();
        to.rotation.x = Math.random() * 2.0 - 1.0;
        to.rotation.y = Math.random() * 0.3;
        to.rotation.z = Math.random() * 2.0 - 1.0;

        to.position.x += to.rotation.x * 100;
        to.position.y += to.rotation.y * 100;
        to.position.z += to.rotation.z * 100;
        return (
          <group
            key={"____" + e.uuid}
            // rotation={floor.getObjectByName(e).rotation.toArray()}
            // position={floor.getObjectByName(e).position.toArray()}
          >
            <Butterflyer
              from={f0Action[i]}
              to={to}
              speed={Math.random()}
            ></Butterflyer>
          </group>
        );
      })}

      {/*  */}
    </group>
  );
}

// function Portals({ floor, envMap }) {
//   return (
//     <group>
//       <FlyTeleport
//         start={"zone_a1"}
//         dest={"zone_b2"}
//         floor={floor}
//         envMap={envMap}
//         title="To North End"
//       />

//       <FlyTeleport
//         start={"zone_a2"}
//         dest={"zone_e1"}
//         floor={floor}
//         envMap={envMap}
//         title="The West End"
//       />

//       <FlyTeleport
//         start={"zone_e2"}
//         dest={"zone_a0"}
//         envMap={envMap}
//         floor={floor}
//         title="The East End"
//       />

//       <FlyTeleport
//         start={"zone_a4"}
//         dest={"zone_f1"}
//         envMap={envMap}
//         floor={floor}
//         title="The South End"
//       />

//       <FlyTeleport
//         start={"zone_f2"}
//         dest={"zone_a0"}
//         envMap={envMap}
//         floor={floor}
//         title="The Brith Place"
//       />

//       <FlyTeleport
//         start={"zone_b1"}
//         dest={"zone_a0"}
//         floor={floor}
//         envMap={envMap}
//         title="The Birth Place"
//       />
//     </group>
//   );
// }
