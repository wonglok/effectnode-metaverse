import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import {
  AxesHelper,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereBufferGeometry,
  Vector3,
} from "three";
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
import { useMiniEngine } from "../../utils/use-mini-engine";
import { FunSim } from "../simulation/FunSim";
import { FirstCamControls } from "../../canvas/Controls/FirstCamControls";

export default function Magnet() {
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
        isSwim={true}
      ></PlayerDisplay>

      {/*
      <group ref={metagraph}>
        <ForceGraphR3F></ForceGraphR3F>
      </group> */}

      <FirstCamControls
        Now={Now}
        higherCamera={2.0}
        colliderMesh={colliderManager.collider}
      ></FirstCamControls>

      {/* <WalkerFollowerControls floor={floor}></WalkerFollowerControls> */}

      <FunSimCom></FunSimCom>
    </group>
  );
}

//

//

//

function FunSimCom() {
  // let { get } = useThree();
  let { mini, get } = useMiniEngine();

  let cursorPointer = useMemo(() => {
    return new Vector3();
  }, []);

  let sim = useMemo(() => {
    return new FunSim({
      cursorPointer: cursorPointer,
      node: mini,
      influences: [
        // {
        //   type: `computeAttract`,
        //   enabled: true,
        //   needsUpdate: true,
        //   mouse: true,
        //   position: { x: 0, y: 0, z: 0 },
        //   force: 40,
        //   radius: 4,
        //   min: -4.0,
        //   max: 4.0,
        // },

        {
          type: `computeSphere`,
          enabled: true,
          mouse: true,
          needsUpdate: true,
          position: { x: 0, y: 0, z: 0 },
          radius: 50,
          force: 35.0,
          noise: 3.0,
        },
        // {
        //   type: `computeSphere`,
        //   enabled: true,
        //   mouse: false,
        //   needsUpdate: true,
        //   position: { x: 0, y: 0, z: 0 },
        //   radius: 1.5,
        //   force: -30.0 * 1.3,
        //   noise: 3.0,
        // },
        //
        {
          type: `computeGravity`,
          enabled: true,
          direction: { x: 0, y: -1, z: 0 },
          force: 3,
        },
      ],
      tailLength: 64, // 512, 1024
      howManyTrackers: 2048,
    });
  }, [mini, cursorPointer]);

  useFrame(({ camera }) => {
    sim.track();

    // sim.influences[1].position.x = camera.position.x * 0.0;
    // sim.influences[1].position.y = camera.position.y * 1;
    // sim.influences[1].position.z = camera.position.z * 0.0;
    // sim.influences[1].needsUpdate = true;

    sim.influences[0].position.x = Now.avatarAt.x;
    sim.influences[0].position.y = Now.avatarAt.y;
    sim.influences[0].position.z = Now.avatarAt.z;
    sim.influences[0].needsUpdate = true;

    cursorPointer.copy(camera.position);
  });

  useEffect(() => {
    window.addEventListener("gridPt", ({ detail }) => {
      sim.influences
        .filter((e) => {
          return e.mouse;
        })
        .forEach((e) => {
          e.position.x = detail.x;
          e.position.y = detail.y;
          e.position.z = detail.z;
          e.needsUpdate = true;
        });
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* <OrbitDrei /> */}
      <Visualise influ={sim.influences} />
      <primitive object={sim.o3d}></primitive>
    </group>
  );
}

function Visualise({ influ }) {
  let { mini, get } = useMiniEngine();
  let ref = useRef();
  useEffect(() => {
    let o3d = ref.current;

    o3d.children.forEach((k) => {
      o3d.remove(k);
    });

    influ.forEach((it) => {
      if (it.type === "computeAttract") {
        let geo = new SphereBufferGeometry(1, 32, 32);
        let mesh = new Mesh(
          geo,
          new MeshBasicMaterial({
            color: "#fff",
            transparent: true,
            opacity: 0.05,
            wireframe: true,
          })
        );
        o3d.add(mesh);
        mini.onLoop(() => {
          mesh.scale.setScalar(it.radius);
          mesh.position.copy(it.position);
        });
      }

      if (it.type === "computeSphere") {
        let geo = new SphereBufferGeometry(1, 32, 32);
        let mesh = new Mesh(
          geo,
          new MeshBasicMaterial({
            color: "#00f",
            transparent: true,
            opacity: 0.3,
            wireframe: true,
          })
        );
        o3d.add(mesh);
        mini.onLoop(() => {
          mesh.scale.setScalar(it.radius);
          mesh.position.copy(it.position);
        });
      }

      if (it.type === "computeGravity") {
        let mesh1 = new AxesHelper(5);
        o3d.add(mesh1);
      }

      //
    });

    return () => {
      o3d.children.forEach((k) => {
        o3d.remove(k);
      });
    };

    //
  }, [mini, influ]);
  return <group ref={ref}></group>;
}
