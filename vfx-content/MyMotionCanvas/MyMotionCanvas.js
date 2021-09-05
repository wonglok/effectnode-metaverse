import { Text, useGLTF } from "@react-three/drei";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimationMixer, BackSide, Object3D, Vector3 } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getFirebase } from "../../vfx-firebase/firelib";

import { makeShallowStore } from "../../vfx-utils/make-shallow-store";

import { useEnvLight } from "../../vfx-content/Use/useEnvLight.js";
import { Actions } from "../Actions/Actions";
import router from "next/router";

export function MyMotionCanvas() {
  return (
    <div className="h-full w-full relative flex flex-col lg:flex-row">
      <div className=" order-2 h-52  lg:h-full overflow-scroll lg:w-3/12">
        <h1 className="text-2xl p-5  text-right">Avatar Motions</h1>
        <RigList></RigList>
        {/*  */}
      </div>
      <Canvas
        className="  lg:order-3 lg:w-9/12"
        concurrent
        onCreated={(st) => {
          st.gl.physicallyCorrectLights = true;
        }}
        dpr={[1, 3]}
      >
        <Suspense fallback={<LoadingAvatar></LoadingAvatar>}>
          <Content></Content>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Content() {
  let { envMap } = useEnvLight({});

  return (
    <group>
      <pointLight intensity={30} position={[-10, 10, 10]}></pointLight>

      <directionalLight
        intensity={1}
        position={[10, 10, 10]}
      ></directionalLight>

      <directionalLight
        intensity={2}
        position={[-10, 10, -10]}
      ></directionalLight>

      <mesh position={[0, 0, 0]}>
        <sphereBufferGeometry args={[8, 32, 32]}></sphereBufferGeometry>
        <meshBasicMaterial
          envMap={envMap}
          side={BackSide}
          color={"#fff"}
        ></meshBasicMaterial>
      </mesh>

      <MySelf envMap={envMap}></MySelf>
    </group>
  );
}

export function MySelf({ envMap }) {
  let [url, setURL] = useState(false);

  useEffect(() => {
    return getFirebase()
      .auth()
      .onAuthStateChanged(async (user) => {
        if (user && user.uid) {
          let snap = await getFirebase()
            .database()
            .ref(`/card-avatar-info/${router.query.cardID}`)
            .get();
          let val = snap.val();

          if (val && val.avatarURL) {
            setURL(`${val.avatarURL}?avatarSignature=${val.avatarSignature}`);
          } else {
          }
        }
      });
  }, []);

  return (
    <group>
      {url && (
        <Suspense fallback={<LoadingAvatar></LoadingAvatar>}>
          <AvatarItem envMap={envMap} url={url}></AvatarItem>
        </Suspense>
      )}
    </group>
  );
}

function LoadingAvatar() {
  let { camera } = useThree();
  useEffect(() => {
    camera.position.y = 1.6;
    camera.position.z = 1;
    camera.lookAt(0, 1.6, 0.2);
  });

  return (
    <Text
      scale={0.7}
      fontSize={0.05}
      color="black"
      outlineColor="white"
      outlineWidth={0.002}
      position={[0, 1.6, 0.2]}
    >
      Loading....
    </Text>
  );
}

function AvatarItem({ url }) {
  let o3d = new Object3D();
  o3d.name = "avatar";

  let gltf = useGLTF(`${url}`);
  let avatar = useMemo(() => {
    let cloned = SkeletonUtils.clone(gltf.scene);
    return cloned;
  }, [gltf]);

  return (
    <group>
      {createPortal(<primitive object={avatar}></primitive>, o3d)}
      <primitive object={o3d}></primitive>

      <Suspense fallback={null}>
        <Rig avatar={avatar}></Rig>
      </Suspense>
      <Decorate avatar={avatar}></Decorate>

      <MyCamera></MyCamera>
    </group>
  );
}

function Decorate({ avatar }) {
  useEffect(() => {
    avatar.traverse((it) => {
      it.frustumCulled = false;
    });

    avatar.traverse((it) => {
      if (it.material) {
        it.material.envMapIntensity = 3;
      }
    });
  }, [avatar]);

  return null;
}
export let RigStore = makeShallowStore({
  actions: Actions,
  act: 0,
  action: false,
});

function RigList() {
  return (
    <div className="p-3">
      {RigStore.actions.map((e, i) => {
        return (
          <div
            className="px-3 mb-3 cursor-pointer text-right"
            key={e.id}
            onClick={() => {
              RigStore.act = i;
            }}
            onMouseEnter={() => {}}
          >
            {e.name}
          </div>
        );
      })}
    </div>
  );
}

function Rig({ avatar }) {
  RigStore.makeKeyReactive("act");

  // let mixer = useMemo(() => {
  //   return new AnimationMixer();
  // }, [RigStore.act]);

  // useFrame((st, dt) => {
  //   mixer.update(dt);
  // });
  let { get } = useThree();
  let last = useRef(false);
  useEffect(() => {
    let tt = 0;
    let now = RigStore.actions[RigStore.act];
    if (now && now.url) {
      new FBXLoader().load(now.url, (fbx) => {
        if (last.current) {
          last.current.fadeOut(0.1);
        }

        let mixer = new AnimationMixer();
        let action = mixer.clipAction(fbx.animations[0], avatar);
        action.reset();
        action.play();
        action.fadeIn(0.1);

        last.current = action;

        let rAF = () => {
          tt = requestAnimationFrame(rAF);
          mixer.update(1 / 60);
        };
        tt = requestAnimationFrame(rAF);
      });
    }

    return () => {
      cancelAnimationFrame(tt);
    };
  }, [get, RigStore.act]);

  return <group></group>;
}

function MyCamera() {
  let { camera, gl } = useThree();
  let orbit = useMemo(() => {
    camera.near = 0.1;
    camera.far = 5000;
    camera.fov = 35;
    camera.updateProjectionMatrix();
    camera.position.z = 13;

    let orbit = new OrbitControls(camera, gl.domElement);
    orbit.minDistance = 0.4;
    orbit.maxDistance = 5.5;
    orbit.rotateSpeed = 0.3;
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.1;
    orbit.zoomSpeed = 0.3;
    orbit.enableZoom = true;
    orbit.enablePan = false;
    orbit.enableRotate = true;

    orbit.update();
    return orbit;
  }, [camera]);

  let lookAt = new Vector3(0, 0, 0);
  let lookAtlerp = new Vector3(0, 0, 0);
  let lookAtInfluence = new Object3D();
  let lookAtInfluenceNow = new Object3D();
  let corePos = new Vector3();

  useFrame(({ get }) => {
    let { camera, scene, mouse } = get();

    let avatar = scene.getObjectByName("avatar");
    if (avatar) {
      let coreTarget = avatar.getObjectByName("Head");
      if (coreTarget) {
        coreTarget.getWorldPosition(corePos);
        orbit.target.lerp(corePos, 0.1);

        camera.position.y = orbit.target.y;
        camera.position.y += 0.2;
        orbit.update();

        lookAt.set(mouse.x * 15, mouse.y * 15, 15);
        lookAtlerp.lerp(lookAt, 0.4);
        lookAtInfluence.lookAt(lookAtlerp);

        lookAtInfluenceNow.quaternion.slerp(lookAtInfluence.quaternion, 0.4);
        coreTarget.quaternion.slerp(lookAtInfluenceNow.quaternion, 0.4);
      }
    }
  });
  return <group></group>;
}
