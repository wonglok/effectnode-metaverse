import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { useDrag, useWheel } from "@use-gesture/react";
export function WalkerControls({ floor }) {
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

  let speed = 0.015;

  //
  useDrag(
    (state) => {
      // state.event.preventDefault();

      let change = state.velocity[1] || 0;
      let delta = change / 100;

      if (delta >= speed) {
        delta = speed;
      }
      if (delta <= -speed) {
        delta = -speed;
      }
      progress.current += delta;
    },
    {
      target: get().gl.domElement,
    }
  );

  useWheel(
    (state) => {
      state.event.preventDefault();
      // state.event.preventDefault();
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

  // roll
  let lv = progress.current;
  let lookAt = new Vector3();
  let lookAtLerp = new Vector3();
  useFrame(({ camera }) => {
    //
    lv = MathUtils.lerp(lv, progress.current, 0.1);
    roll.getPoint(lv, camera.position);
    camera.position.y = 1.3;

    roll.getPoint(lv + 0.03, lookAt);
    lookAt.y = camera.position.y;

    lookAtLerp.lerp(lookAt, 0.56);
    camera.lookAt(lookAtLerp);
  });

  useEffect(() => {
    //
    //
  }, []);

  return (
    <group>
      {/*  */}
      {/*  */}
    </group>
  );
}
