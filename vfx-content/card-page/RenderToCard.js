//

import { useFBO } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Scene, PerspectiveCamera } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

export function RenderToCard({ res = 512, children, envMap = null, ...props }) {
  const showWW = 53.98 / 60;
  const showHH = 85.6 / 60;
  const showAspect = showWW / showHH;

  const cam = useRef(new PerspectiveCamera(35, showAspect, 0.1, 1000));
  const fbo = useFBO(res, res / showAspect);
  const [myScene] = useState(() => new Scene());

  let boxGeo = useMemo(() => {
    return new RoundedBoxGeometry(showWW, showHH, 0.15, 3, showHH / 5);
  }, [showWW, showHH]);

  useFrame(({ gl, camera }) => {
    if (cam.current) {
      // camera.updateMatrixWorld();
      cam.current.position.x = 0;
      cam.current.position.y = 0;
      cam.current.position.z = 10;
      cam.current.updateProjectionMatrix();
      // cam.current.matrixWorldInverse.copy(camera.matrixWorldInverse);

      gl.setRenderTarget(fbo);
      gl.setClearColor(0xffffff);
      gl.setClearAlpha(1);
      gl.clear(true, true, true);
      gl.render(myScene, cam.current);
      gl.setRenderTarget(null);
      gl.setClearColor(0x000000);
      gl.setClearAlpha(0);
    }
  });

  return (
    <>
      <mesh geometry={boxGeo} {...props}>
        <meshBasicMaterial map={fbo.texture} />
      </mesh>

      {createPortal(children, myScene)}
    </>
  );
}
