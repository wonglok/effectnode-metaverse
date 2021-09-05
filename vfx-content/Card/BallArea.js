import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide } from "three";
import { Card } from "../CardOOBE/Card";

export function BallArea({ envMap, camera }) {
  let ballMatRef = useRef();

  useFrame(() => {
    let ball = ballMatRef.current;

    if (ball) {
      /** @type {Color} */
      Card.fadingColor.lerpHSL(Card.sharpChangeColor, 0.1);
      ball.color = Card.fadingColor;
    }

    camera.position.z = 5;
  });

  return (
    <mesh>
      <meshStandardMaterial
        ref={ballMatRef}
        metalness={1}
        roughness={0}
        envMap={envMap}
        envMapIntensity={1}
        side={BackSide}
      ></meshStandardMaterial>
      <sphereBufferGeometry args={[2, 24, 24]}></sphereBufferGeometry>
    </mesh>
  );
}
