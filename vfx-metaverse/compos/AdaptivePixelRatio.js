import { useThree } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { useEffect, useState } from "react";

export function AdaptivePixelRatio({ children, wait }) {
  let [ok, setOK] = useState(false);
  let { gl } = useThree();
  useEffect(() => {
    getGPUTier({ glContext: gl.getContext() }).then((v) => {
      let setDPR = ([a, b]) => {
        let base = window.devicePixelRatio || 1;

        if (base >= 2.5) {
          base = 2.5;
        }

        if (b >= base) {
          b = base;
        }
        gl.setPixelRatio(b);

        setOK(true);
      };

      if (v.gpu === "apple a9x gpu") {
        setDPR([1, 1]);
        return;
      }

      if (v.fps < 30) {
        setDPR([1, 1.5]);
        return;
      }

      if (v.tier >= 3) {
        setDPR([1, 3]);
      } else if (v.tier >= 2) {
        setDPR([1, 2]);
      } else if (v.tier >= 1) {
        setDPR([1, 1]);
      } else if (v.tier < 1) {
        setDPR([1, 0.75]);
      }
    });
  });

  return ok ? children : wait;
}
