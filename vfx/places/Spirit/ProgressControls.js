import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useWheel, useDrag } from "@use-gesture/react";
import { Vector3 } from "three";
import { Now } from "../../store/Now";
export function ProgressControls({ children }) {
  let { get } = useThree();

  let prog = useRef(0);
  let vel = useRef(0);

  useWheel(
    (st) => {
      st.event.preventDefault();
      vel.current = -st.event.deltaY / 50;
    },
    {
      target: get().gl.domElement.parentElement,
      eventOptions: { passive: false },
    }
  );

  useDrag(
    (st) => {
      // st.event.preventDefault();

      vel.current = -st.delta[1] / 40;
    },
    {
      target: get().gl.domElement,
      // eventOptions: { passive: false },
    }
  );

  useEffect(() => {
    get().gl.domElement.parentElement.style.touchAction = "none";
    get().gl.domElement.style.touchAction = "none";
  });

  useFrame((st, dt) => {
    let velocity = (vel.current / 1000) * 50;

    prog.current += velocity * 1.5;

    if (Now.autoPlayScroll) {
      prog.current += dt / 10.0;
    } else {
    }

    vel.current *= 0.98;
  });

  //

  return <group>{children({ prog })}</group>;
}
