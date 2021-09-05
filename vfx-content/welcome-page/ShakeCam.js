import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";

export function ShakeCam({ avatar }) {
  let currentPos = new Vector3();
  let current = new Vector3();
  let last = new Vector3();
  let diff = new Vector3();
  let diffApply = new Vector3();
  let cam = new PerspectiveCamera();

  //
  useFrame((st, dt) => {
    let tracker = avatar.getObjectByName("Head");

    if (tracker) {
      tracker.getWorldPosition(currentPos);

      cam.copy(st.camera);
      cam.lookAt(currentPos);

      st.camera.updateMatrix();
      st.camera.updateProjectionMatrix();

      last.copy(current);
      cam.getWorldDirection(current);

      diff.copy(current).sub(last);
      diffApply.lerp(diff, 0.2);

      st.camera.rotation.x += diffApply.x;
      st.camera.rotation.y += diffApply.y;
    }
  });

  return null;
}
