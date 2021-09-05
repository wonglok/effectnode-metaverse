import { useFBO } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Scene, PerspectiveCamera } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

export function PortalPlane({ children = () => <group></group>, ...props }) {
  const { get } = useThree();
  const showWW = 53.98 / 60;
  const showHH = 85.6 / 60;
  const showAspect = showWW / showHH;

  // const cam = useRef();
  const [cam] = useState(
    () => new PerspectiveCamera(35, showAspect, 0.1, 1000)
  );
  const fbo = useFBO(512, 512 / showAspect);
  const [myScene] = useState(() => new Scene());

  let boxGeo = useMemo(() => {
    return new RoundedBoxGeometry(showWW, showHH, 0.15, 3, showHH / 5);
  }, [showWW, showHH]);

  useFrame(({ gl, camera: appCamera }) => {
    if (cam) {
      appCamera.updateMatrixWorld();
      cam.matrixWorldInverse.copy(appCamera.matrixWorldInverse);
      cam.updateProjectionMatrix();

      gl.setRenderTarget(fbo);
      gl.clear(true, true, true);
      gl.render(myScene, cam);
      gl.setRenderTarget(null);
    }
  });

  return (
    <>
      <mesh
        onClick={() => {
          window.dispatchEvent(new CustomEvent("click-ball"));
        }}
        geometry={boxGeo}
        {...props}
      >
        <meshBasicMaterial transparent={false} map={fbo.texture} />
      </mesh>

      {createPortal(children({ fbo, camera: cam, get }), myScene)}
    </>
  );
}
