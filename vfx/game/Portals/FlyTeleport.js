import { Text, useTexture } from "@react-three/drei";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import router from "next/router";
import { useRef } from "react";
import { DoubleSide, Vector3 } from "three";
import { Now } from "../../store/Now";
//
import { CommonAssets } from "../../places/common/CommonAssets";
export function FlyTeleport({ floor, envMap, title = "", start, dest }) {
  let { scene } = useThree();

  let alphaMap = useTexture(CommonAssets.portalAlphaMap.url);
  alphaMap.flipY = true;
  //
  let destination = floor.getObjectByName(dest);
  if (!destination) {
    throw new Error(`start ${start} dest: ${dest}`);
  }
  let startingPoint = floor.getObjectByName(start);
  if (!startingPoint) {
    throw new Error(`start ${start} dest: ${dest}`);
  }

  let ref = useRef();
  let text = useRef();
  let wp = new Vector3();
  useFrame(() => {
    if (ref.current) {
      ref.current.getWorldPosition(wp);
      wp.y = Now.avatarAt.y;
      if (Now.avatarAt.distanceTo(wp) <= 3.5) {
        destination.getWorldPosition(Now.avatarFlyTo);
      } else {
      }
    }
  });

  useFrame(({ camera }) => {
    if (text.current) {
      text.current.lookAt(camera.position);
    }
  });

  useFrame(() => {
    if (ref.current.position) {
      startingPoint.getWorldPosition(ref.current.position);
    }
  });

  return createPortal(
    <mesh
      rotation={[0, 0.0, 0.0]}
      scale={7}
      ref={ref}
      // onClick={() => {
      //   Now.avatarFlyTo.fromArray([-0.69, -1.35, 0.28]);
      // }}
      userData={{
        // onClick: () => {
        //   Now.avatarFlyTo.fromArray([-0.69, -1.35, 0.28]);
        // },
        hint: title,
      }}
    >
      <Text
        position={[0, 0.3, 0]}
        textAlign={"center"}
        anchorX={"center"}
        anchorY={"bottom"}
        maxWidth={1}
        fontSize={0.15}
        font={`/font/Cronos-Pro-Light_12448.ttf`}
        frustumCulled={false}
        color={"white"}
        outlineColor={"black"}
        outlineWidth={0.005}
        userData={{ enableBloom: true }}
        ref={text}
      >
        {title}
      </Text>
      <cylinderBufferGeometry
        args={[0.45, 0.45, 0.3, 23, 23, true]}
      ></cylinderBufferGeometry>
      {/* <torusBufferGeometry args={[0.45, 0.03, 120, 40]} /> */}
      <meshStandardMaterial
        metalness={1}
        roughness={0.0}
        envMap={envMap}
        color="#ffffff"
        side={DoubleSide}
        transparent={true}
        alphaMap={alphaMap}
        transparent={true}
      ></meshStandardMaterial>
    </mesh>,
    scene
  );
}
