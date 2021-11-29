import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import {
  CineonToneMapping,
  Color,
  EquirectangularReflectionMapping,
  sRGBEncoding,
} from "three";

export function Lighting() {
  let { get } = useThree();

  useEffect(() => {
    get().scene.background = new Color("#000000");
    get().gl.toneMapping = CineonToneMapping;
    get().gl.toneMappingExposure = 1;
    get().gl.physicallyCorrectLights = true;
    //
  }, []);
  return (
    <group>
      <Suspense fallback={null}>
        <Load></Load>
      </Suspense>
    </group>
  );
}

function Load() {
  let { get } = useThree();

  let wilderness = useTexture(`/hdr/nightwilderness.png`);
  useEffect(() => {
    wilderness.encoding = sRGBEncoding;
    wilderness.mapping = EquirectangularReflectionMapping;

    get().scene.environment = wilderness;
    //
  }, []);
  return <group></group>;
}
