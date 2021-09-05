import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function BubbleGun({ avatar, visible }) {
  let gltf = useGLTF(`/objects/bubble-gun/bubble-gun.glb`);
  //

  //

  //
  return (
    <group>
      {createPortal(
        <group visible={visible}>
          <mesh
            rotation={[Math.PI * -1, Math.PI * -0.5, Math.PI * 0]}
            position={[0.0, 0.1, 0.03]}
            scale={0.06}
            geometry={gltf.nodes.gun.geometry}
          >
            <meshStandardMaterial
              metalness={1}
              roughness={0}
              flatShading={true}
            ></meshStandardMaterial>
          </mesh>
          <Bubbles avatar={avatar}></Bubbles>
        </group>,
        avatar.getObjectByName("RightHand")
      )}
    </group>
  );
}

function Bubbles({ avatar }) {
  let ref = useRef();
  //

  useFrame(({ clock }) => {
    //
    let hand = avatar.getObjectByName("RightHand");
    let time = clock.getElapsedTime();
    let obj = ref.current;
    if (obj) {
      obj.position.y = Math.sin(time * 3) * 0.1 + hand.rotation.y;
      obj.position.z = Math.sin(time * 3) * 0.1;
    }
  });
  //
  return (
    <group ref={ref}>
      <group position={[0, 0.5, -0.2]}>
        <mesh>
          <sphereBufferGeometry args={[0.1, 20, 20]}></sphereBufferGeometry>
          <meshStandardMaterial
            metalness={1}
            roughness={0.0}
            transparent={true}
            opacity={0.6}
          ></meshStandardMaterial>
        </mesh>
      </group>

      <group position={[0.5, 0.5, 0.0]}>
        <mesh>
          <sphereBufferGeometry args={[0.2, 20, 20]}></sphereBufferGeometry>
          <meshStandardMaterial
            metalness={1}
            roughness={0.0}
            transparent={true}
            opacity={0.6}
          ></meshStandardMaterial>
        </mesh>
      </group>

      <group position={[0.5, 0.5, -0.5]}>
        <mesh>
          <sphereBufferGeometry args={[0.2, 20, 20]}></sphereBufferGeometry>
          <meshStandardMaterial
            metalness={1}
            roughness={0.0}
            transparent={true}
            opacity={0.6}
          ></meshStandardMaterial>
        </mesh>
      </group>
    </group>
  );
}
