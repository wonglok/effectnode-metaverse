import { useEffect } from "react";
import { PointLight } from "three";

export function SceneDecorator({ object }) {
  useEffect(() => {
    object.traverse((it) => {
      if (it.geometry) {
        it.userData.isHoverable = true;
      }

      //
      if (it?.userData?.castShadow) {
        it.castShadow = true;
        it.traverse((sub) => {
          if (sub) {
            sub.castShadow = true;
          }
        });
      }

      if (it?.userData?.receiveShadow) {
        it.receiveShadow = true;
        it.traverse((sub) => {
          if (sub) {
            sub.receiveShadow = true;
          }
        });
      }

      //
      if (it instanceof PointLight && it.castShadow) {
        it.shadow.mapSize.width = 512;
        it.shadow.mapSize.height = 512;
        it.shadow.camera.near = 0.1;
        it.shadow.camera.far = 500;
      }
    });
  }, []);

  return null;
}
