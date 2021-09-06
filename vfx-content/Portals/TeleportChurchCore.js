import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import router from "next/router";
import { useRef } from "react";
import { DoubleSide, Vector3 } from "three";
import { Now } from "../../vfx-metaverse/lib/Now";

//
export function TeleportChurchCore({ envMap }) {
  //
  let ref = useRef();
  let text = useRef();
  let wp = new Vector3();
  useFrame(() => {
    if (ref.current) {
      ref.current.getWorldPosition(wp);
      if (Now.avatarAt.distanceTo(wp) <= 3) {
        Now.avatarFlyTo.fromArray([-0.69, -1.35, 0.28]);
      } else {
      }
    }
  });

  useFrame(({ camera }) => {
    if (text.current) {
      text.current.lookAt(camera.position);
    }
  });

  return (
    <mesh
      ref={ref}
      // onClick={() => {
      //   Now.avatarFlyTo.fromArray([-0.69, -1.35, 0.28]);
      // }}
      userData={{
        // onClick: () => {
        //   Now.avatarFlyTo.fromArray([-0.69, -1.35, 0.28]);
        // },
        hint: "Snap to Church Map Center",
      }}
    >
      <Text
        position={[0, 0.4, 0]}
        textAlign={"center"}
        anchorX={"center"}
        anchorY={"bottom"}
        maxWidth={0.7}
        fontSize={0.12}
        font={`/font/Cronos-Pro-Light_12448.ttf`}
        frustumCulled={false}
        color={"white"}
        outlineColor={"black"}
        outlineWidth={0.005}
        userData={{ enableBloom: true }}
        ref={text}
      >
        Snap to Church Map Center
      </Text>
      <cylinderBufferGeometry
        args={[0.45, 0.45, 0.3, 23, 23, true]}
      ></cylinderBufferGeometry>
      <meshStandardMaterial
        metalness={1}
        roughness={0.0}
        envMap={envMap}
        color="#ffffff"
        side={DoubleSide}
        transparent={0.2}
      ></meshStandardMaterial>
    </mesh>
  );
}
