import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function effect({ mini, node }) {
  node.in0.stream((v) => {
    console.log("second", v);
  });

  mini.set("MyCustomComponent", <MyCustomComponent />);
}

function MyCustomComponent() {
  let ref = useRef();

  useFrame((st, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <boxBufferGeometry args={[1, 1, 1, 2, 2, 2]} />
        <meshBasicMaterial color={"green"} wireframe={true} />
      </mesh>
    </group>
  );
}
