import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BackSide } from "three";

export function Portal({ avatar, visible }) {
  let ref = useRef();
  let i = 0;
  useFrame(() => {
    if (ref.current) {
      i += 1 / 60;
      if (i >= 1) {
        i = 1;
      }
      ref.current.scale.setScalar(i);
      let mesh = ref.current.children[0];
      if (mesh) {
        mesh.material.opacity = i * 0.8;
      }
    }
  });

  return (
    <group visible={visible} ref={ref}>
      <mesh
        userData={{
          enableBloom: true,
        }}
        position={[0, 1.15, 0]}
      >
        <sphereBufferGeometry args={[1.15, 35, 35]}></sphereBufferGeometry>
        <meshStandardMaterial
          color={"#888"}
          // userData={{ enableBloom: true }}
          metalness={1}
          roughness={0.0}
          side={BackSide}
          transparent={true}
        ></meshStandardMaterial>
      </mesh>
    </group>
  );
}

//
