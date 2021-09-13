import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, Object3D, Vector3 } from "three";
import { useDrag, useWheel } from "@use-gesture/react";
import { Now } from "../../store/Now";
import { useAutoEvent } from "../../utils/use-auto-event";
// import { createPortal } from "react-dom";
export function StoryFlyControls({
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
  }, [pts, loop]);

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

  useAutoEvent("touchstart", (ev) => {
    ev.preventDefault();
  });
  useAutoEvent("touchmove", (ev) => {
    ev.preventDefault();
  });
  useAutoEvent("touchend", (ev) => {
    ev.preventDefault();
  });

  // let lv = progress.current;
  let at = new Vector3();
  let at2 = new Vector3();

  //
  let lv = 0;
  useFrame(({ camera, scene }) => {
    progress.current = progress.current % 1;
    progress.current = Math.abs(progress.current);

    lv = MathUtils.lerp(lv, progress.current, 0.3);
    // lv = MathUtils.lerp(lv, progress.current, 0.18);
    if (!roll) {
      return;
    }

    // if (lv <= 0) {
    //   lv = 0;
    // }

    roll.getPoint(lv, at);
    roll.getPoint(lv + 0.03, at2);

    camera.position.copy(at);
    camera.lookAt(at2.x, at2.y, at2.z);
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
