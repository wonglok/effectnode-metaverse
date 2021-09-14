import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AnimationMixer, Euler, Object3D, Vector3 } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { AQ } from "./Assets";

export function Butterflyer({ speed = 0, to, from }) {
  let gltf = useGLTF(AQ.butterfly.rawurl);

  let butterfly = useMemo(() => {
    return SkeletonUtils.clone(gltf.scene);
  }, [gltf]);

  let mixer = useMemo(() => {
    return new AnimationMixer(butterfly);
  }, [butterfly]);

  let fromPos = new Vector3();
  let toPos = new Vector3();

  useEffect(() => {
    from.getWorldPosition(fromPos);
    to.getWorldPosition(toPos);
  });

  useFrame((st, dt) => {
    let far = fromPos.distanceTo(st.camera.position);
    if (far < 70) {
      mixer.update(dt + speed / 50);
      o3d.position.lerp(toPos, 0.006);
      o3d.lookAt(to.position);
      o3d.rotation.y += Math.PI;
      o3d.visible = true;
    } else if (far < 150) {
      mixer.update(dt + speed / 50);

      o3d.position.lerp(fromPos, 0.1);
      o3d.visible = true;
    } else {
      o3d.visible = false;
    }
  });

  useEffect(() => {
    let fly = mixer.clipAction(gltf.animations[0], butterfly);
    fly.play();
  }, [gltf, butterfly, mixer]);

  let o3d = new Object3D();

  return (
    <group>
      {createPortal(<primitive object={butterfly}></primitive>, o3d)}
      <primitive object={o3d}></primitive>
    </group>
  );
}
