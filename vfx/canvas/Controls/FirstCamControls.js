import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Camera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Now } from "../../store/Now";
import { useAutoEvent } from "../../utils/use-auto-event";

export function FirstCamControls({ Now, envMap, higherCamera = 1.3 }) {
  //
  let { get } = useThree();

  // useFrame(({ camera }) => {
  //   camera.position.x = Now.avatarAt.x;
  //   camera.position.y = Now.avatarAt.y + higherCamera;
  //   camera.position.z = Now.avatarAt.z;
  // });

  return (
    <group>
      {/*  */}
      {/*  */}
      {/*  */}
      <Keyboard camera={get().camera}></Keyboard>

      <DragOrbit
        onRotation={({ camera }) => {
          get().camera.rotation.copy(camera.rotation);
        }}
      ></DragOrbit>
    </group>
  );
}

function DragOrbit({ onRotation }) {
  let { get } = useThree();

  let ref = useRef({ works() {} });

  useEffect(() => {
    //
    let cam = new Camera();
    cam.position.z = 10;
    let orbit = new OrbitControls(cam, get().gl.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.93;
    ref.current.works = () => {
      //
      orbit.update();
      onRotation({ camera: cam });
    };
    // onRotation
  }, []);

  useFrame(() => {
    ref.current.works();
  });

  return <group></group>;
}

function Keyboard({ camera }) {
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
      keyBoardForward.set(0, 0, -1);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;

      keyBoardForward.normalize().multiplyScalar(scaler);
      camera.position.add(keyBoardForward);
    } else if (Now.keyA) {
      keyBoardForward.set(-1, 0, 0);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;
      keyBoardForward.normalize().multiplyScalar(scaler);

      camera.position.add(keyBoardForward);
    } else if (Now.keyS) {
      keyBoardForward.set(0, 0, 1);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;
      keyBoardForward.normalize().multiplyScalar(scaler);

      camera.position.add(keyBoardForward);
    } else if (Now.keyD) {
      keyBoardForward.set(1, 0, 0);
      keyBoardForward.applyEuler(camera.rotation);
      keyBoardForward.y = 0.0;
      keyBoardForward.normalize().multiplyScalar(scaler);

      camera.position.add(keyBoardForward);
    }

    camera.position.y = 1.5;

    if (camera.position.distanceTo(Now.goingTo) >= 3) {
      Now.goingTo.lerp(camera.position, 0.05);
    }
  });

  return null;
}
