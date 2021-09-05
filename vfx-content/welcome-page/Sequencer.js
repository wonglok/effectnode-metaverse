import React, { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { DirectionalLight, DoubleSide, Object3D, Vector3 } from "three";
import { createPortal, useFrame } from "@react-three/fiber";
import { HelloSign } from "./HelloSign";
import { Portal } from "./Portal";
import { Social } from "./Social";
import { ByeSign } from "./ByeSign";
import { EnjoySign } from "./EnjoySign";
import { HipsRing } from "./HipsRing";
import { BubbleGun } from "./BubbleGun";

export function Sequencer({ avatar, mixer, actions, envMap }) {
  let ref = useRef();
  let banner = useRef();
  let [text, setBannerText] = useState("Welcome to Your Card!");
  let [showVFX, setVFX] = useState("hands");

  // useEffect(() => {
  //   return () => {
  //     avatar.visible = false;
  //   };
  // }, []);

  // useEffect(() => {
  //   ref.current.add(avatar);
  //   return () => {
  //     if (ref.current) {
  //       ref.current.remove(avatar);
  //     }
  //   };
  // }, [avatar]);
  //  avatarslot.000
  useEffect(() => {
    mixer.stopAllAction();
    let skip = false;
    let cursor = 0;

    let last = false;
    let sequences = [
      //
      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.hi0.reset();
        actions.hi0.repetitions = 1;
        actions.hi0.clampWhenFinished = true;
        actions.hi0.play();
        last = actions.hi0;
        setVFX("hi");
        setBannerText("Welcome to My Spaceship!");
      },
      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.happyHand.reset();
        actions.happyHand.repetitions = 1;
        actions.happyHand.clampWhenFinished = true;
        actions.happyHand.play();
        actions.happyHand.fadeIn(0.1);
        last = actions.happyHand;
        setVFX("none");
        setBannerText("I'm Lok Lok. :D");
      },

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.sillyjoey.reset();
        actions.sillyjoey.repetitions = 1;
        actions.sillyjoey.clampWhenFinished = true;
        actions.sillyjoey.play();
        actions.sillyjoey.fadeIn(0.1);
        last = actions.sillyjoey;
        setVFX("place");
        setBannerText("This is a place \nfor You to be You.");
      },
      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.gesturePointer.reset();
        actions.gesturePointer.repetitions = 1;
        actions.gesturePointer.clampWhenFinished = true;
        actions.gesturePointer.play();
        actions.gesturePointer.fadeIn(0.1);
        last = actions.gesturePointer;

        //
        setVFX("social");
        setBannerText(
          "You can add your social media accounts or websites in your Zone."
        );
      },

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.gesturePointer2.reset();
        actions.gesturePointer2.repetitions = 1;
        actions.gesturePointer2.clampWhenFinished = true;
        actions.gesturePointer2.play();
        actions.gesturePointer2.fadeIn(0.1);
        last = actions.gesturePointer2;
      },

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.happyIdle.reset();
        actions.happyIdle.repetitions = 1;
        actions.happyIdle.clampWhenFinished = true;
        actions.happyIdle.play();
        actions.happyIdle.fadeIn(0.1);
        last = actions.happyIdle;

        //
        setVFX("visit");
        setBannerText("You can also visit your friend's place with portals.");
      },

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.warmup.reset();
        actions.warmup.repetitions = 1;
        actions.warmup.clampWhenFinished = true;
        actions.warmup.play();
        actions.warmup.fadeIn(0.1);
        last = actions.warmup;

        //
        setVFX("warmup");
        setBannerText(
          "Let's use WASD keys or \n Joystick on screen \n to move around."
        );
      },

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }

        actions.shoot.reset();
        actions.shoot.repetitions = 3;
        actions.shoot.clampWhenFinished = true;
        actions.shoot.fadeIn(0.1);
        actions.shoot.play();
        last = actions.shoot;

        //
        setBannerText("Stay Fun with Bubble Gun!");
        setVFX("gun");
      },
      //
      //

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.handForward.reset();
        actions.handForward.repetitions = 1;
        actions.handForward.clampWhenFinished = true;
        actions.handForward.fadeIn(0.1);
        actions.handForward.play();
        last = actions.handForward;

        //
        setVFX("enjoy");
        setBannerText("Anyways, Enjoy your time here!");
      },

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }

        actions.greetings.reset();
        actions.greetings.repetitions = 1;
        actions.greetings.clampWhenFinished = true;
        actions.greetings.fadeIn(0.1);
        actions.greetings.play();
        last = actions.greetings;

        //
        setBannerText("See you around in the spaceship!");
        setVFX("none");
      },

      //

      () => {
        if (last) {
          last?.fadeOut(0.1);
        }
        actions.bow.reset();
        actions.bow.repetitions = 1;
        actions.bow.clampWhenFinished = true;
        actions.bow.play();
        actions.bow.fadeIn(0.1);
        last = actions.bow;

        //
        setBannerText("Thank You for visiting!");
        setVFX("none");
      },
    ];

    // sequences[0]();

    let isDebugging = false;
    if (isDebugging) {
      sequences[sequences.length - 3]();
      actions.shoot.repetitions = Infinity;
    } else {
      sequences[0]();
    }

    let h = {
      loop: () => {
        //
        console.log("loop ends");
      },
      finished: () => {
        //
        console.log("finished");
        cursor++;
        cursor = cursor % sequences.length;

        if (!skip && !isDebugging) {
          sequences[cursor]();
        }
      },
    };
    mixer.addEventListener("loop", h.loop);
    mixer.addEventListener("finished", h.finished);

    return () => {
      skip = true;
      mixer.removeEventListener("loop", h.loop);
      mixer.removeEventListener("finished", h.finished);
    };
  }, []);

  let facingToCamera = new Vector3();
  useFrame((st, dt) => {
    facingToCamera.copy(st.camera.position);
    if (ref.current) {
      facingToCamera.y = ref.current.position.y;
      ref.current.lookAt(facingToCamera);
    }
    if (banner.current) {
      banner.current.lookAt(facingToCamera);
    }
  });

  let o3d = new Object3D();
  return (
    <group>
      <group ref={ref}>
        {createPortal(<primitive object={avatar}></primitive>, o3d)}

        <primitive object={o3d}>
          <pointLight position={[0, 0, 10]} intensity={20}></pointLight>
        </primitive>
        <Text
          ref={banner}
          position={[0, 2, 0.5]}
          textAlign={"center"}
          anchorX={"center"}
          anchorY={"bottom"}
          maxWidth={2}
          fontSize={0.15}
          font={`/font/Cronos-Pro-Light_12448.ttf`}
          frustumCulled={false}
          color={"white"}
          outlineColor={"black"}
          outlineWidth={0.005}
          userData={{ enableBloom: true }}
        >
          {text}
          <meshBasicMaterial
            attach="material"
            side={DoubleSide}
            envMap={envMap}
            transparent={true}
            opacity={1}
          />
        </Text>

        <HelloSign visible={showVFX === "hi"} avatar={avatar}></HelloSign>

        <ByeSign visible={showVFX === "bye"} avatar={avatar}></ByeSign>

        <EnjoySign
          visible={showVFX === "enjoy"}
          envMap={envMap}
          avatar={avatar}
        ></EnjoySign>

        <HipsRing
          visible={showVFX === "place"}
          envMap={envMap}
          avatar={avatar}
        ></HipsRing>

        <group>
          <Social visible={showVFX === "social"} avatar={avatar}></Social>
        </group>

        <group>
          <Portal visible={showVFX === "visit"} avatar={avatar}></Portal>
        </group>

        <BubbleGun visible={showVFX === "gun"} avatar={avatar}></BubbleGun>
      </group>
    </group>
  );
}

/*

Hips
Spine
Spine1
Spine2
Neck
Head
HeadTop_End
LeftEye
RightEye
LeftShoulder
LeftArm
LeftForeArm
LeftHand
LeftHandThumb1
LeftHandThumb2
LeftHandThumb3
LeftHandThumb4
LeftHandIndex1
LeftHandIndex2
LeftHandIndex3
LeftHandIndex4
LeftHandMiddle1
LeftHandMiddle2
LeftHandMiddle3
LeftHandMiddle4
LeftHandRing1
LeftHandRing2
LeftHandRing3
LeftHandRing4
LeftHandPinky1
LeftHandPinky2
LeftHandPinky3
LeftHandPinky4

RightShoulder
RightArm
RightForeArm
RightHand
RightHandThumb1
RightHandThumb2
RightHandThumb3
RightHandThumb4
RightHandIndex1
RightHandIndex2
RightHandIndex3
RightHandIndex4
RightHandMiddle1
RightHandMiddle2
RightHandMiddle3
RightHandMiddle4
RightHandRing1
RightHandRing2
RightHandRing3
RightHandRing4
RightHandPinky1
RightHandPinky2
RightHandPinky3
RightHandPinky4

LeftUpLeg
LeftLeg
LeftFoot
LeftToeBase
LeftToe_End

RightUpLeg
RightLeg
RightFoot
RightToeBase
RightToe_End

*/
