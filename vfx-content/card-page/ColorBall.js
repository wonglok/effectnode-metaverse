//
import { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { BackSide, Color, DoubleSide } from "three";
import { getFirebase, loginRedirectGoogle } from "../../vfx-firebase/firelib";
import { makeShallowStore, useAutoEvent } from "../../vfx-metaverse";

const Store = makeShallowStore({
  type: "loading",
  text: "Verifying Card",
  bottomText: "",
  loggedIn: false,
  color: new Color("#fff"),
  sharpChangeColor: new Color("#0ff"),
});
export function ColorBall({ cardID, camera, envMap }) {
  let { get } = useThree();

  let checkCardValidity = () => {
    return new Promise((resolve) => {
      fetch(`/api/card/${cardID}`)
        .then((e) => e.json())
        .then(
          (data) => {
            if (data?.valid) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          () => {
            resolve(false);
          }
        );
    });
  };

  useEffect(() => {
    Store.text = "Loading....";
    Store.bottomText = "";
    Store.onClick = "";

    return getFirebase()
      .auth()
      .onAuthStateChanged(async (user) => {
        if (user && user.uid) {
          //

          Store.text = "Checking Card Validity";
          let isValid = await checkCardValidity();

          if (isValid) {
            Store.text = "Card is Valid";
            Store.bottomText = "Click to Conintue...";
            Store.onClick = "valid";
            Store.sharpChangeColor.set("#fff");
          } else {
            Store.text = "Card is Invalid :( ";
            Store.onClick = "invalid";
            Store.bottomText = "Click to Get Help...";
            Store.sharpChangeColor.set("#f00");
          }
        } else {
          Store.text = "Login to Activate Card";
          Store.bottomText = "Click to Conintue...";
          Store.onClick = "login";
          Store.sharpChangeColor.set("#0ff");
        }
      });
  }, []);

  useEffect(() => {
    getFirebase().auth().getRedirectResult();
  }, []);

  let handleClick = () => {
    if (Store.onClick === "login") {
      loginRedirectGoogle();
    } else if (Store.onClick === "valid") {
      //
    } else if (Store.onClick === "invalid") {
      //
    }
  };

  useAutoEvent(
    "click",
    () => {
      handleClick();
    },
    { passive: true },
    get().gl.domElement
  );
  useAutoEvent(
    "touchstart",
    () => {
      handleClick();
    },
    { passive: true },
    get().gl.domElement
  );

  return (
    <group>
      <group position={[0, camera.position.y, camera.position.z - 5.6]}>
        {/* <directionalLight args={[10, 10, 10]}></directionalLight> */}

        <BallArea envMap={envMap}></BallArea>
        <CenterText></CenterText>
        <Subtitle></Subtitle>
      </group>
    </group>
  );
}

function BallArea({ envMap }) {
  let ballMatRef = useRef();

  useFrame(() => {
    let ball = ballMatRef.current;

    if (ball) {
      /** @type {Color} */
      Store.color.lerpHSL(Store.sharpChangeColor, 0.1);
      ball.color = Store.color;
    }
  });

  return (
    <mesh>
      <meshStandardMaterial
        ref={ballMatRef}
        metalness={1}
        roughness={0}
        envMap={envMap}
        side={BackSide}
      ></meshStandardMaterial>
      <sphereBufferGeometry args={[2, 24, 24]}></sphereBufferGeometry>
    </mesh>
  );
}

function CenterText() {
  Store.makeKeyReactive("text");
  return (
    <group>
      <Text
        font={`/font/trivial/Trivial-Regular.otf`}
        // rotation={[Math.PI * -0.25, 0, 0]}
        maxWidth={1}
        position={[0, 0, 2]}
        fontSize={0.09}
        color={"white"}
        outlineBlur={0.005}
        outlineWidth={0.005}
        outlineColor={"black"}
        textAlign={"center"}
      >
        {Store.text}
      </Text>
    </group>
  );
}

function Subtitle() {
  Store.makeKeyReactive("bottomText");
  return (
    <group>
      <Text
        font={`/font/trivial/Trivial-Regular.otf`}
        // rotation={[Math.PI * -0.25, 0, 0]}
        maxWidth={1.6}
        position={[0, -0.9, 2]}
        fontSize={0.09}
        color={"white"}
        outlineBlur={0.005}
        outlineWidth={0.005}
        outlineColor={"black"}
        textAlign={"center"}
      >
        {Store.bottomText}
      </Text>
    </group>
  );
}
