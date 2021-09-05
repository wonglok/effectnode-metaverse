import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import router from "next/dist/client/router";
import React, { useEffect, useRef } from "react";
import { MathUtils, Mesh, PlaneBufferGeometry } from "three";
import { useAutoEvent } from "../utils/use-auto-event";
// import { Tooltip } from "./Tooltip";

export function TheHelper({ Now }) {
  return (
    <group>
      <ClickToOpen Now={Now}></ClickToOpen>
      <TheCursor Now={Now}></TheCursor>
      <DomCursor></DomCursor>
    </group>
  );
}

function TheCursor({ Now }) {
  let { get } = useThree();
  Now.makeKeyReactive("hint");

  let core = useRef();
  let mouse1 = useRef();

  useAutoEvent("set-tail-state", ({ detail: state }) => {
    if (mouse1.current) {
      if (state === "hovering") {
        mouse1.current.userData.enableBloom = true;
      } else {
        mouse1.current.userData.enableBloom = false;
      }
    }
  });

  // let front = new Mesh(new PlaneBufferGeometry(200, 200, 2, 2));
  // front.visible = false;
  // front.position.z = -1;
  // get().camera.add(front);

  useFrame(({ camera, raycaster }) => {
    if (core.current) {
      core.current.position.copy(camera.position);
      core.current.rotation.copy(camera.rotation);
    }
  });

  return (
    <group>
      <group ref={core}>
        <group position={[0.01, -0.01, -1]}>
          <Text
            anchorX="left"
            anchorY="top"
            userData={{ enableBloom: true }}
            outlineWidth={0.001333}
            fontSize={0.024}
            maxWidth={0.15}
            font={`/font/Cronos-Pro-Light_12448.ttf`}
          >
            {Now.hint ? `${Now.hint}\n` : ``}
            {/* {Now.hoverData?.website ? `${Now.hoverData?.website}\n` : ""} */}
            <meshStandardMaterial
              metalness={1.0}
              roughness={0.0}
              userData={{ enableBloom: true }}
            ></meshStandardMaterial>
          </Text>
        </group>

        <group>
          <group scale={[1, 1, 1]} position={[0, 0, -1]}>
            <group scale={0.001} rotation={[0, 0, Math.PI * 0.25]}>
              <Floating Now={Now}>
                <mesh ref={mouse1} position={[0, -9 / 2, 0]}>
                  <coneBufferGeometry args={[4, 9, 3, 1]}></coneBufferGeometry>
                  <meshStandardMaterial
                    //
                    metalness={1.0}
                    roughness={0.0}
                  ></meshStandardMaterial>
                </mesh>
              </Floating>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Floating({ Now, children }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    let time = clock.getElapsedTime();
    if (ref.current) {
      //
      let target = 0;
      if (Now?.hoverData?.website) {
        target = -3 + Math.cos(time * 5.0) * 3;
      }
      ref.current.position.y = MathUtils.lerp(
        ref.current.position.y,
        target,
        0.5
      );
    }
  });
  //
  return <group ref={ref}>{children}</group>;
}

function ClickToOpen({ Now }) {
  let { gl } = useThree();

  let move = 0;
  let isDown = false;
  useAutoEvent(
    "pointerdown",
    () => {
      isDown = true;
      move = 0;
    },
    { passive: false },
    gl.domElement
  );

  useAutoEvent(
    "pointermove",
    () => {
      if (isDown) {
        move++;
      }
    },
    { passive: false },
    gl.domElement
  );

  useAutoEvent(
    "pointerup",
    () => {
      //
      if (Now && move <= 10) {
        if (Now?.hoverData?.website && isDown) {
          let href = document.createElement("a");
          href.href = Now.hoverData.website;
          href.target = "_blank";
          href.click();
          isDown = false;
        }
        if (Now?.hoverData?.router && isDown) {
          router.push(Now.hoverData.router);
          isDown = false;
        }
        if (Now?.hoverData?.onClick && isDown) {
          if (typeof Now?.hoverData?.onClick === "function") {
            Now?.hoverData?.onClick();
          }
          isDown = false;
        }
      }
    },
    { passive: false },
    gl.domElement
  );

  return null;
}

function DomCursor() {
  useAutoEvent(
    "pointerdown",
    () => {
      document.body.style.cursor = "none";
    },
    { passive: false },
    document.body
  );
  useAutoEvent(
    "pointerup",
    () => {
      document.body.style.cursor = "grab";
    },
    { passive: false },
    document.body
  );

  useEffect(() => {
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);
  return null;
}

// they have meta verses i have bible verses
