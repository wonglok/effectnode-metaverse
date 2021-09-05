import React, { useMemo } from "react";
import { useFBX, useGLTF } from "@react-three/drei";
import { AnimationMixer } from "three";
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { Sequencer } from "./Sequencer";
// import { ShakeCam } from "./ShakeCam";

export function WelcomeAvatar({ envMap }) {
  let gltf = useGLTF(
    `https://d1a370nemizbjq.cloudfront.net/20077d0b-fd84-4b1c-a1b1-edd3c110423c.glb`
  );

  let avatar = useMemo(() => {
    let scene = SkeletonUtils.clone(gltf.scene);
    let avatar = scene;

    avatar.traverse((it) => {
      it.frustumCulled = false;

      if (it.material) {
        if (
          it.material.name === "Wolf3D_Skin" ||
          it.material.name === "Wolf3D_Eye"
        ) {
        } else {
          if (envMap) {
            it.material.envMap = envMap;

            it.material.metalness = 1.0;
            it.material.roughness = 0.05;
            it.material.roughnessMapIntensity = 0.02;
            it.material.metalnessMapIntensity = 1.0;
          }
        }
      }
    });

    return avatar;
  }, []);

  let mixer = useMemo(() => {
    let mixer = new AnimationMixer(avatar);
    return mixer;
  }, []);

  let fbx = {
    warmup: useFBX(`/rpm/rpm-actions/mma-warmup.fbx`),
    // hiphop: useFBX(`/rpm/rpm-actions/dance-hiphop.fbx`),

    greetings: useFBX(`/rpm/rpm-actions/greetings.fbx`),
    handForward: useFBX(`/rpm/rpm-actions/hand-forward.fbx`),
    idle: useFBX(`/rpm/rpm-actions/mma-idle.fbx`),
    gesturePointer: useFBX(`/rpm/rpm-actions/guesture-pointer.fbx`),
    gesturePointer2: useFBX(`/rpm/rpm-actions/guesture-pointer-2.fbx`),
    excited: useFBX(`/rpm/rpm-actions/excited.fbx`),
    spin: useFBX(`/rpm/rpm-actions/spin-in-place.fbx`),
    happyIdle: useFBX(`/rpm/rpm-actions/happy-idle.fbx`),
    happyHand: useFBX(`/rpm/rpm-actions/happy-hand.fbx`),
    sillyjoey: useFBX(`/rpm/rpm-actions/silly-dance.fbx`),
    bow: useFBX(`/rpm/rpm-actions/bow-quick-formal.fbx`),
    hi0: useFBX(`/rpm/rpm-actions/hi-wave-both-hands.fbx`),
    shoot: useFBX(`/rpm/rpm-actions/gun-shoot.fbx`),
  };

  let actions = useMemo(() => {
    let actions = {};
    for (let kn in fbx) {
      actions[kn] = mixer.clipAction(fbx[kn].animations[0]);
    }
    return actions;
  }, []);

  useFrame((st, dt) => {
    mixer.update(dt);
  });

  return (
    <group>
      <Sequencer
        envMap={envMap}
        avatar={avatar}
        mixer={mixer}
        actions={actions}
      ></Sequencer>
      {/* <ShakeCam avatar={avatar}></ShakeCam> */}
    </group>
  );
}
