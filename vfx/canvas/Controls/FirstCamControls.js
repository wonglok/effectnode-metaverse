import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { Now } from "../../store/Now";
import { useAutoEvent } from "../../utils/use-auto-event";

export function FirstCamControls({ Now, envMap, higherCamera = 1.3 }) {
  //

  useFrame(({ camera }) => {
    camera.position.x = Now.avatarAt.x;
    camera.position.y = Now.avatarAt.y + higherCamera;
    camera.position.z = Now.avatarAt.z;
  });

  return (
    <group>
      {/*  */}
      {/*  */}
      {/*  */}
      <Keyboard></Keyboard>
    </group>
  );
}

function Keyboard() {
  //
  useAutoEvent("keydown", (ev) => {
    // console.log(ev.key);

    if (ev.key === "w") {
      Now.keyW = true;
    }
    if (ev.key === "a") {
      Now.keyA = true;
    }
    if (ev.key === "s") {
      Now.keyS = true;
    }
    if (ev.key === "d") {
      Now.keyD = true;
    }
  });

  useAutoEvent("keyup", (ev) => {
    // console.log(ev.key);

    if (ev.key === "w") {
      Now.keyW = false;
    }
    if (ev.key === "a") {
      Now.keyA = false;
    }
    if (ev.key === "s") {
      Now.keyS = false;
    }
    if (ev.key === "d") {
      Now.keyD = false;
    }
  });

  let scaler = 1;
  let keyBoardForward = new Vector3();
  useFrame(({ camera }) => {
    if (Now.keyW) {
      keyBoardForward.set(0, 0, -1 * scaler);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;
      Now.avatarAt.add(keyBoardForward).multiplyScalar(1);
    } else if (Now.keyA) {
      keyBoardForward.set(-1 * scaler, 0, 0);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;

      Now.avatarAt.add(keyBoardForward).multiplyScalar(1);
    } else if (Now.keyS) {
      keyBoardForward.set(0, 0, 1 * scaler);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;

      Now.avatarAt.add(keyBoardForward).multiplyScalar(1);
    } else if (Now.keyD) {
      keyBoardForward.set(1 * scaler, 0, 0);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;

      Now.avatarAt.add(keyBoardForward).multiplyScalar(1);
    }

    Now.goingTo.copy(Now.avatarAt);
  });

  return null;
}
