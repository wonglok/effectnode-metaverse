import { useProgress } from "@react-three/drei";
import { createPortal, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Object3D } from "three";

export default function Loading() {
  let { get } = useThree();
  let { loaded, total } = useProgress();

  // let o3d = useMemo(() => {
  //   return new Object3D();
  // }, []);

  useEffect(() => {
    // o3d.children.forEach((k) => {
    //   o3d.remove(k);
    // });

    return () => {
      //
      //
    };
  });

  return (
    <group>
      {createPortal(
        <group position={[0, 0, 10]}>
          {/*  */}
          {/*  */}
          {/*  */}
          {/*  */}
          {/*  */}
          <Text>
            {loaded} Loaded / {total} Items to be loaded
          </Text>
        </group>,
        get().camera
      )}
    </group>
  );
}
