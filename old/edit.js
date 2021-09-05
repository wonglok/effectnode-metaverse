import React, { useEffect, useRef, useState } from "react";
import { ENRuntime, getEffectNodeData } from "effectnode";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { getCodes, firebaseConfig } from "../vfx-effectnode/index.js";
import { GraphEditorPage } from "effectnode-cms";
import { PCFSoftShadowMap, sRGBEncoding } from "three";
import { getGPUTier } from "detect-gpu";

// visit
// http://localhost:3000/cms

export function Page() {
  /* graphTitle: loklok */
  /* canvasID: -MfyYdM7swln7PVk3_rp */
  /* ownerID: NGpUixuU0NOkOlmLsLuepkaZxxt1 */
  let canvasID = `-MfyYdM7swln7PVk3_rp`;
  let ownerID = `NGpUixuU0NOkOlmLsLuepkaZxxt1`;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ height: "65%", width: "100%" }}>
        <Canvas
          onCreated={({ gl }) => {
            gl.outputEncoding = sRGBEncoding;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = PCFSoftShadowMap;
          }}
        >
          <EffectNodeRuntime
            firebaseConfig={firebaseConfig}
            canvasID={canvasID}
            ownerID={ownerID}
          >
            {({ runtime }) => {
              return (
                <RuntimeComponent
                  name={"MyCustomComponent"}
                  runtime={runtime}
                ></RuntimeComponent>
              );
            }}
          </EffectNodeRuntime>

          <AdaptivePixelRatio></AdaptivePixelRatio>

          <OrbitControls></OrbitControls>
        </Canvas>
      </div>
      <div style={{ height: "35%", width: "100%" }}>
        <GraphEditorPage
          firebaseConfig={firebaseConfig}
          canvasID={canvasID}
          ownerID={ownerID}
          codes={getCodes()}
        />
      </div>
    </div>
  );
}

export function EffectNodeRuntime({ firebaseConfig, canvasID, children }) {
  let mounter = useRef();
  let [runtime, setRuntime] = useState(false);
  let [endata, setENData] = useState(false);

  useEffect(() => {
    let h = () => {
      getEffectNodeData({
        firebaseConfig,
        graphID: canvasID,
      }).then((json) => {
        setENData(json);
      });
    };
    h();

    window.addEventListener("change-graph", h);
    return () => {
      window.removeEventListener("change-graph", h);
    };
  }, [JSON.stringify(firebaseConfig), canvasID]);

  useEffect(() => {
    if (endata) {
      let newRuntime = new ENRuntime({
        json: endata,
        codes: getCodes(),
      });

      setRuntime(newRuntime);

      return () => {
        if (newRuntime) {
          newRuntime.mini.clean();
          newRuntime.clean();
        }
      };
    } else {
      return () => {};
    }
  }, [endata]);

  useFrame((three) => {
    if (runtime) {
      for (let kn in three) {
        runtime.mini.set(kn, three[kn]);
      }
      if (mounter.current) {
        runtime.mini.set("mounter", mounter.current);
      }
      runtime.mini.work();
    }
  });

  return (
    <group ref={mounter}>
      {runtime && typeof children === "function" && children({ runtime })}
    </group>
  );
}

function RuntimeComponent({ name, runtime }) {
  let [instance, setCompos] = useState(() => {
    return null;
  });

  useEffect(() => {
    runtime.mini.get(name).then((v) => {
      setCompos(v);
    });
    return () => {
      setCompos(null);
    };
  }, [runtime]);

  return instance;
}

//

function AdaptivePixelRatio() {
  let { gl } = useThree();
  useEffect(() => {
    getGPUTier({ glContext: gl.getContext() }).then((v) => {
      let setDPR = ([a, b]) => {
        let base = window.devicePixelRatio || 1;
        if (b >= base) {
          b = base;
        }
        gl.setPixelRatio(b);
      };

      if (v.gpu === "apple a9x gpu") {
        setDPR([1, 1]);
        return;
      }
      if (v.fps < 30) {
        setDPR([1, 1]);
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

  return null;
}

export default Page;
