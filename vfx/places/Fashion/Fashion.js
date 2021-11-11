import {
  useCubeTexture,
  useGLTF,
  OrbitControls as DOribt,
  Plane,
} from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  Mesh,
  SphereBufferGeometry,
  MeshBasicMaterial,
  GridHelper,
  AxesHelper,
  MeshStandardMaterial,
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
import { InteractionUI } from "./InteractionUI";

export default function Fashion() {
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
        <FunSimCom></FunSimCom>
        <UControls></UControls>
      </Suspense>
    </group>
  );
}

function UControls() {
  //
  let { get } = useThree();

  useEffect(() => {
    get().camera.fov = 40;
    get().camera.position.x = 0;
    get().camera.position.y = 0;
    get().camera.position.z = 35;
    get().camera.updateMatrix();
    get().camera.updateProjectionMatrix();

    InteractionUI.fixTouchScreen({ target: get().gl.domElement.parentElement });
  }, []);
  let ref = useRef();
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });
  return (
    <group>
      <DOribt></DOribt>
      <Plane
        onPointerMove={(ev) => {
          window.dispatchEvent(new CustomEvent("gridPt", { detail: ev.point }));
        }}
        ref={ref}
        args={[100, 100, 50, 50]}
      >
        <meshBasicMaterial
          color={"#ffffff"}
          wireframe={true}
        ></meshBasicMaterial>
      </Plane>
    </group>
  );
}

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
        //   mouse: false,
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
          radius: 2,
          force: 35.0,
          noise: 3.0,
        },

        {
          type: `computeSphere`,
          enabled: true,
          mouse: false,
          needsUpdate: true,
          position: { x: 0, y: 0, z: 0 },
          radius: 1.5,
          force: -30.0,
          noise: 3.0,
        },

        //
        // {
        //   type: `computeGravity`,
        //   enabled: true,
        //   direction: { x: 0, y: -1, z: 0 },
        //   force: -1,
        // },
      ],
      tailLength: 512, // 512, 1024
      howManyTrackers: 2048,
    });
  }, [mini, cursorPointer]);

  useFrame(() => {
    sim.track();
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
      {/* <DOrbit /> */}
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
