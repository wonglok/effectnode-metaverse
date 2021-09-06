import { useFBO } from "@react-three/drei";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, PerspectiveCamera, Scene, Vector3 } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { Now } from "../../vfx-metaverse/lib/Now";
// import {  } from "react-dom";
// import { Now } from "../../vfx-metaverse/lib/Now";
//

export function MiniMap({ map }) {
  //
  let { get } = useThree();
  let fbo = useFBO(256, 256);
  let scene = useMemo(() => {
    let scene = new Scene();

    let mapper = SkeletonUtils.clone(map);

    scene.add(mapper);
    return scene;
  }, [fbo, map]);

  let cam = useMemo(() => {
    let cam = new PerspectiveCamera(35, fbo.width / fbo.height, 0.1, 1000);
    cam.position.z = 0;
    cam.position.x = 0;
    cam.position.y = 500;
    cam.lookAt(0, 0, 0);
    return cam;
  }, [fbo]);

  useFrame(({ gl }) => {
    let ortt = null;
    gl.setRenderTarget(fbo);
    //
    gl.render(scene, cam);
    //
    gl.setRenderTarget(ortt);
  });

  let ref = useRef();
  let mesh = useRef();

  let dir = new Vector3();
  let fakecam = new PerspectiveCamera(
    get().camera.fov,
    get().camera.aspect,
    0.1,
    1000
  );
  useFrame(({ camera }) => {
    if (ref.current) {
      camera.getWorldPosition(ref.current.position);
      camera.getWorldDirection(dir);

      fakecam.position.z = 5;

      fakecam.fov = camera.fov;
      fakecam.aspect = camera.aspect;
      let h = visibleHeightAtZDepth(0, fakecam);
      let w = visibleWidthAtZDepth(0, fakecam);

      mesh.current.position.x = w / 2 + h * 0.1 * 0.5;
      mesh.current.position.y = h / 2 + h * 0.1 * 0.5;
      ref.current.scale.set(h * 0.1, h * 0.1, 1);

      cam.position.x = Now.avatarAt.x;
      cam.position.z = Now.avatarAt.z;

      dir.normalize().multiplyScalar(5);
      ref.current.position.add(dir);
    }
  });

  return (
    <group>
      {createPortal(
        <group>
          <directionalLight intensity={3} position={[3, 3, 3]} />
          <ambientLight intensity={3}></ambientLight>
        </group>,
        scene
      )}

      <group ref={ref}>
        <sprite userData={{ disableBloom: true }} center={[0, 0]} ref={mesh}>
          <planeBufferGeometry args={[1, 1]}></planeBufferGeometry>
          <spriteMaterial side={DoubleSide} map={fbo.texture}></spriteMaterial>
        </sprite>
      </group>

      {/* {createPortal(<primitive object={get().camera}></primitive>, get().scene)} */}
    </group>
  );
}

const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if (depth < cameraOffset) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = (camera.fov * Math.PI) / 180;

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera);
  return height * camera.aspect;
};
