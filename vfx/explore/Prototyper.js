import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Color, sRGBEncoding } from "three";

export function Prototyper() {
  let { get } = useThree();

  useEffect(() => {
    get().gl.physicallyCorrectLights = true;
    get().gl.outputEncoding = sRGBEncoding;
    get().scene.background = new Color("#333");
    get().camera.position.z = 100;
  }, []);

  return (
    <group>
      <OrbitControls />
      <ambientLight />
    </group>
  );
}
