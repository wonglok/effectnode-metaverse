//

import { useGLTF, useFBX } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationAction, AnimationMixer, Object3D, Vector3 } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

export function AvatarShowCard({
  avatarURL = `/rpm/rpm-avatar/white-armor.glb`,
  envMap,
  children,
}) {
  // let { get } = useThree();

  let avaGLTF = useGLTF(
    avatarURL
    // `/rpm/rpm-avatar/white-armor.glb`
    // `https://d1a370nemizbjq.cloudfront.net/5f19fedd-6729-42c8-9bf7-81858270cbfe.glb`
  );

  let o3d = new Object3D();
  /** @type {Object3D} */
  let avatar = useMemo(() => {
    let cloned = SkeletonUtils.clone(avaGLTF.scene);

    cloned.traverse((it) => {
      it.frustumCulled = false;

      if (
        it &&
        it.material &&
        it.material.name.toLowerCase().indexOf("skin") === -1 &&
        it.material.name.toLowerCase().indexOf("eye") === -1
      ) {
        it.material.envMap = envMap;
        it.material.envMapIntensity = 1.3;
      }
    });

    return cloned;
  }, []);

  useEffect(() => {
    //
  }, []);

  let leaves = useRef();

  let left = new Vector3();
  let right = new Vector3();
  let head = new Vector3();
  let neck = new Vector3();
  let center = new Vector3();

  let eyeTarget = new Vector3();
  let lerpEye = new Vector3();

  //

  useFrame(({ camera, clock, mouse, viewport }) => {
    let time = clock.getElapsedTime();
    // .getWorldPosition(leftEye);
    avatar.getObjectByName(`LeftHand`).getWorldPosition(left);
    avatar.getObjectByName(`RightHand`).getWorldPosition(right);
    avatar.getObjectByName(`Head`).getWorldPosition(head);
    avatar.getObjectByName(`Neck`).getWorldPosition(neck);

    center.copy(left).add(right).multiplyScalar(0.5);

    camera.position.x = 0.1;
    camera.position.z = 0.9;
    camera.position.y = 1.7;

    if (leaves.current) {
      leaves.current.position.copy({
        x: center.x,
        y: center.y + Math.sin(time) * 0.02 + 0.1,
        z: center.z + 0.2,
      });

      camera.lookAt(
        leaves.current.position.x,
        leaves.current.position.y,
        leaves.current.position.z
      );

      eyeTarget.set(
        viewport.width * mouse.x * 0.05 + Math.cos(time) * 0.05,
        viewport.height * mouse.y * 0.05 + Math.sin(time) * 0.05,
        0.0
      );

      lerpEye.lerp(eyeTarget, 0.1);

      leaves.current.lookAt(
        camera.position.x + lerpEye.x * 0.23,
        camera.position.y + lerpEye.y * 0.23,
        camera.position.z
      );

      avatar.getObjectByName(`Spine`).lookAt(
        //
        camera.position.x - 0.3 + lerpEye.x * 0.5,
        camera.position.y - 0.25 + lerpEye.y * 0.5,
        camera.position.z
      );

      avatar.getObjectByName(`Head`).lookAt(
        //
        camera.position.x + lerpEye.x,
        camera.position.y - 0.1 + lerpEye.y,
        camera.position.z
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <ActionMixer avatar={avatar}></ActionMixer>
      <directionalLight intensity={2} position={[2, 2, 2]}></directionalLight>

      {createPortal(<primitive object={avatar}></primitive>, o3d)}
      <primitive object={o3d}></primitive>

      <pointLight intensity={2} position={[0, 2, 2]}></pointLight>
      <pointLight intensity={2} position={[0, 0, -2]}></pointLight>

      <group ref={leaves}>
        <group scale={1} position={[0, 0, 0.0]}>
          {children}
        </group>
      </group>
    </group>
  );
}

function ActionMixer({ avatar }) {
  let mixer = useMemo(() => new AnimationMixer(avatar), [avatar]);
  useFrame((st, dt) => {
    mixer.update(dt);
  });

  //
  let fbx = {
    hand: useFBX(`/rpm/rpm-actions-look/look-hand.fbx`),
    // ground: useFBX(`/rpm/rpm-actions-look/look-ground.fbx`),
  };

  let actions = useMemo(() => {
    let acts = {};

    for (let kn in fbx) {
      acts[kn] = mixer.clipAction(fbx[kn].animations[0]);
    }

    return acts;
  }, []);

  useEffect(() => {
    /** @type {AnimationAction} */
    let act = actions.hand;
    act.repetitions = 1;
    act.clampWhenFinished = true;
    act.play();
  }, []);

  return null;
}
