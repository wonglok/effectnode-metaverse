import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, Object3D, Vector3 } from "three";
import { useDrag, useWheel } from "@use-gesture/react";
import { Now } from "../../store/Now";
import { useAutoEvent } from "../../utils/use-auto-event";
// import { createPortal } from "react-dom";
export function WalkerFollowerControls({
  floor,
  overallSpeed = 1,
  cameraHeight = 1.5,
  loop = true,
}) {
  let { get } = useThree();
  //

  let nameList = [];
  floor.traverse((it) => {
    if (it.name.indexOf("walk") === 0) {
      nameList.push(it.name);
    }
  });

  let pts = nameList.map((e) => {
    let obj = floor.getObjectByName(e) || new Object3D();
    return obj.position;
  });

  let roll = useMemo(() => {
    if (pts.length === 0) {
      return false;
    }
    return new CatmullRomCurve3(pts, loop, "catmullrom", 0.8);
    return new CatmullRomCurve3(pts, loop, "catmullrom", 0.8);
  }, [pts]);

  console.log(pts);

  let progress = useRef(0);

  let speed = 0.003;
  get().gl.domElement.style.touchAction = "none";

  //
  useDrag(
    (state) => {
      state.event.preventDefault();

      let change = state.movement[1] || 0;
      let delta = change / 120;

      if (delta >= speed) {
        delta = speed;
      }
      if (delta <= -speed) {
        delta = -speed;
      }

      progress.current += delta * overallSpeed;
    },
    {
      target: get().gl.domElement,
      eventOptions: {
        passive: false,
      },
    }
  );

  useWheel(
    (state) => {
      state.event.preventDefault();

      let change = state.delta[1] || 0;
      let delta = change / 100;

      if (delta >= speed * 0.4) {
        delta = speed * 0.4;
      }

      if (delta <= -speed * 0.4) {
        delta = -speed * 0.4;
      }

      progress.current += delta * overallSpeed;
    },
    {
      target: get().gl.domElement,
      eventOptions: {
        passive: false,
      },
    }
  );

  useAutoEvent("touchstart", (ev) => {
    ev.preventDefault();
  });
  useAutoEvent("touchmove", (ev) => {
    ev.preventDefault();
  });
  useAutoEvent("touchend", (ev) => {
    ev.preventDefault();
  });

  let lv = progress.current;
  let at = new Vector3();
  let back = new Vector3();
  let back2 = new Vector3();
  let headWP = new Vector3();
  let camWD = new Vector3();

  //
  useFrame(({ camera, scene }) => {
    lv = MathUtils.lerp(lv, progress.current, 0.18);
    if (!roll) {
      return;
    }
    roll.getPoint(lv + 0.001, at);
    roll.getPoint(lv + -0.0, back);
    roll.getPoint(lv + -0.001, back2);

    Now.goingTo.copy(at);
    camera.position.copy(back2);
    camera.position.y = 1.5;
    camera.lookAt(back.x, 1.5, back.z);

    let head = scene.getObjectByName("Head");
    if (head) {
      head.getWorldPosition(headWP);
      camera.getWorldDirection(camWD);

      camera.position.lerp(Now.avatarAt, 0.1);

      camWD.normalize().multiplyScalar(2);
      camWD.y = 0;

      camera.position.copy(back2);
      camera.position.sub(camWD);

      camera.position.y = 1.5;
      camera.lookAt(at.x, 1.5, at.z);
    }
  });

  useEffect(() => {
    get().scene.add(get().camera);
    return () => {
      get().scene.remove(get().camera);
    };
  }, []);

  return (
    <group>
      {createPortal(
        <group>
          <pointLight intensity={2}></pointLight>
          <directionalLight
            intensity={1}
            position={[0, 0, 0]}
          ></directionalLight>
        </group>,
        get().camera
      )}

      {/*  */}
      {/*  */}
    </group>
  );
}
