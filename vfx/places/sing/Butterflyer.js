import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  AnimationMixer,
  Color,
  Euler,
  MathUtils,
  Object3D,
  Vector3,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { AQ } from "./Assets";

export function Butterflyer({ speed = 0, to, from }) {
  let o3d = new Object3D();

  let gltf = useGLTF(AQ.butterfly.rawurl);

  let butterfly = useMemo(() => {
    return SkeletonUtils.clone(gltf.scene);
  }, [gltf]);

  useMemo(() => {
    butterfly.traverse((it) => {
      it.userData.enableBloom = true;
      if (it.material) {
        it.material = it.material.clone();
        it.material.metalness = 1.0;
        it.material.roughness = 0.5;
        if (Math.random() <= 0.5) {
          it.material.color = new Color("yellow").offsetHSL(0, -0.3, 0.2);
        } else {
          it.material.color = new Color("pink").offsetHSL(0, -0.3, -0.2);
        }
      }
    });
  }, [butterfly]);

  let mixer = useMemo(() => {
    return new AnimationMixer(butterfly);
  }, [butterfly]);

  o3d.position.copy(from.position);

  useFrame((st, dt) => {
    let far = from.position.distanceTo(st.camera.position);
    if (far < 70) {
      mixer.update(dt + speed / 50);
      o3d.position.lerp(to.position, 0.005);

      o3d.lookAt(to.position);
      o3d.rotation.y += Math.PI;
      o3d.visible = true;
      o3d.scale.x = MathUtils.lerp(o3d.scale.x, 1, 0.1);
      o3d.scale.y = MathUtils.lerp(o3d.scale.y, 1, 0.1);
      o3d.scale.z = MathUtils.lerp(o3d.scale.z, 1, 0.1);
    } else {
      o3d.position.lerp(from.position, 0.1);
      o3d.scale.x = MathUtils.lerp(o3d.scale.x, 0, 0.1);
      o3d.scale.y = MathUtils.lerp(o3d.scale.y, 0, 0.1);
      o3d.scale.z = MathUtils.lerp(o3d.scale.z, 0, 0.1);
    }

    if (o3d.scale.x <= 0.1) {
      o3d.visible = false;
    } else {
      o3d.visible = true;
    }
  });

  useEffect(() => {
    let fly = mixer.clipAction(gltf.animations[0], butterfly);
    fly.play();
  }, [gltf, butterfly, mixer]);

  return (
    <group>
      {createPortal(<primitive object={butterfly}></primitive>, o3d)}
      <primitive object={o3d}></primitive>
    </group>
  );
}
//
