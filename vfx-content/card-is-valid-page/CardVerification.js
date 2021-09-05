import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  makeShallowStore,
  ShallowStoreMethods,
  useAutoEvent,
} from "../../vfx-metaverse";
import { useShaderEnvLight } from "../welcome-page/useShaderEnvLight";
import { ColorBall } from "../card-page/ColorBall";
import { PortalPlane } from "../card-page/PortalPlane";

let internal = {};

let RenderStoreType = {
  ...ShallowStoreMethods,
  ...internal,
};
/** @type {RenderStoreType} */
export const Render = makeShallowStore(internal);

export function CardVerification({ cardID }) {
  let { envMap } = useShaderEnvLight();
  let { gl } = useThree();

  useAutoEvent(
    `touchstart`,
    (ev) => {
      ev.preventDefault();
    },
    { passive: false },
    gl.domElement
  );

  useAutoEvent(
    `touchmove`,
    (ev) => {
      ev.preventDefault();
    },
    { passive: false },
    gl.domElement
  );

  useAutoEvent(
    `touchend`,
    (ev) => {
      ev.preventDefault();
    },
    { passive: false },
    gl.domElement
  );
  //

  //
  return (
    <group>
      <Suspense fallback={null}>
        <group scale={2} position={[0, 0, 0]}>
          <FloatingCard position={[0, 0, 0]}>
            <PortalPlane>
              {({ camera }) => {
                return (
                  <ColorBall
                    cardID={cardID}
                    envMap={envMap}
                    camera={camera}
                  ></ColorBall>
                );
              }}
            </PortalPlane>
          </FloatingCard>
        </group>
      </Suspense>

      {/*  */}
    </group>
  );
}

function FloatingCard({ children }) {
  let gpRef = useRef();

  useFrame(({ clock }) => {
    let time = clock.getElapsedTime();
    let gp = gpRef.current;
    if (gp) {
      gp.rotation.z = Math.sin(time) * 0.05;
      gp.rotation.x = Math.cos(time) * -0.05;
      gp.rotation.y = Math.sin(time) * -0.15;
    }
  });

  return <group ref={gpRef}>{children}</group>;
}
