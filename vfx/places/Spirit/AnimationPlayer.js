import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";

export function AllAnimationPlayer({ animations, scene, prog }) {
  const { actions, mixer, names } = useAnimations(animations, scene);

  // Storybook Knobs

  useFrame((st, dt) => {
    if (prog && prog.current) {
      mixer.setTime(prog.current);
    } else {
      mixer.update(dt);
    }
  });
  useEffect(() => {
    names.forEach((kn) => {
      actions[kn].reset();
      actions[kn].repetitions = Infinity;
      actions[kn].play();
    });
  }, []);

  // useEffect(() => {
  //   actions[selectedAction]?.reset().fadeIn(blendDuration).play();
  //   return () => {
  //     actions[selectedAction]?.fadeOut(blendDuration);
  //   };
  // }, [actions, selectedAction, blendDuration]);

  return null;
}
