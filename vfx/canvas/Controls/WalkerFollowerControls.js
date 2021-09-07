import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { useDrag, useWheel } from "@use-gesture/react";
import { Now } from "../../store/Now";
import { useAutoEvent } from "../../utils/use-auto-event";
// import { createPortal } from "react-dom";
export function WalkerFollowerControls({ floor, cameraHeight = 1.5 }) {
  let { get } = useThree();
  //

  let nameList = [];
  floor.traverse((it) => {
    if (it.name.indexOf("walk") === 0) {
      nameList.push(it.name);
    }
  });

  let pts = nameList.map((e) => {
    return floor.getObjectByName(e).position;
  });

  let roll = useMemo(() => {
    return new CatmullRomCurve3(pts, true, "catmullrom", 1.0);
  }, [pts]);

  let progress = useRef(0);

  let speed = 0.003;

  //
  useDrag(
    (state) => {
      state.event.preventDefault();

      let change = state.movement[1] || 0;
      let delta = change / 200;

      if (delta >= speed) {
        delta = speed;
      }
      if (delta <= -speed) {
        delta = -speed;
      }

      progress.current += delta * 0.3;
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

      if (delta >= speed * 0.2) {
        delta = speed * 0.2;
      }

      if (delta <= -speed * 0.2) {
        delta = -speed * 0.2;
      }

      progress.current += delta;
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
  useFrame(({ camera, scene }) => {
    lv = MathUtils.lerp(lv, progress.current, 0.1);

    roll.getPoint(lv + 0.01, at);
    roll.getPoint(lv + -0.0, back);
    roll.getPoint(lv + -0.01, back2);

    Now.goingTo.copy(at);
    camera.position.copy(back2);
    camera.lookAt(back);

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
      camera.lookAt(Now.avatarAt.x, 1.5, Now.avatarAt.z);
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
