import { Canvas } from "@react-three/fiber";
import { sRGBEncoding } from "three";

export function Starter({ children, reducedMaxDPI = 3 }) {
  return (
    <Canvas
      concurrent
      dpr={[1, reducedMaxDPI]}
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
