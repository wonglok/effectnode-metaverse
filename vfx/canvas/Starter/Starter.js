import { Canvas } from "@react-three/fiber";
import { sRGBEncoding } from "three";

export function Starter({ children }) {
  return (
    <Canvas
      concurrent
      dpr={[1, 3]}
      onCreated={(state) => {
        // state.gl.toneMapping = ReinhardToneMapping;
        state.gl.outputEncoding = sRGBEncoding;
        state.gl.physicallyCorrectLights = true;
      }}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </Canvas>
  );
}
