import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

export function SpaceWrap() {
  //
  let tl = new Vector3();
  let velocity = new Vector3();
  useFrame((st, dt) => {
    st.camera.getWorldPosition(velocity);
    let vv = velocity.sub(tl).length();
    if (vv <= 0) {
      vv = 0;
    }
    if (vv >= 1) {
      vv = 1;
    }
    st.camera.getWorldPosition(tl);

    st.camera.fov = MathUtils.lerp(st.camera.fov, 50 + vv * 130, 0.1);
    st.camera.updateProjectionMatrix();
  });

  return null;
}
