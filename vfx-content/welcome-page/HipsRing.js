import { Cylinder, useTexture } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide } from "three";

export function HipsRing({ visible, avatar }) {
  //
  let gradMap = useTexture(`/image/thankyou-jesus.png`);
  return (
    <group>
      {createPortal(
        <ScaleUp>
          <Spinner>
            <Cylinder
              visible={visible}
              scale={0.3}
              position={[0, 0.1, 0]}
              args={[3, 3, 1.5, 23, 1, true]}
            >
              <meshStandardMaterial
                map={gradMap}
                userData={{ enableBloom: true }}
                color="#bababa"
                roughness={0.0}
                metalness={1.0}
                transparent={true}
                side={DoubleSide}
              ></meshStandardMaterial>
            </Cylinder>
          </Spinner>
        </ScaleUp>,
        avatar.getObjectByName("Hips")
      )}
      {/*  */}
    </group>
  );
}

function Spinner({ children }) {
  let ref = useRef();
  useFrame((st, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.3;
    }
  });

  return <group ref={ref}>{children}</group>;
}

function ScaleUp({ children }) {
  let ref = useRef();
  let i = 0;
  useFrame(() => {
    if (ref.current) {
      i += 1 / 30;
      if (i >= 1) {
        i = 1;
      }
      ref.current.scale.setScalar(i);
    }
  });

  return <group ref={ref}>{children}</group>;
}

//
