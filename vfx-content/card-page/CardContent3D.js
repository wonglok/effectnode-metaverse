import { useThree } from "@react-three/fiber";
import { Suspense } from "react";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  makeShallowStore,
  ShallowStoreMethods,
  useAutoEvent,
} from "../../vfx-metaverse";
import { useShaderEnvLight } from "../welcome-page/useShaderEnvLight";
import { AvatarShowCard } from "./AvatarShowCard";
import { ColorBall } from "./ColorBall";
import { PortalPlane } from "./PortalPlane";

let internal = {};

let RenderStoreType = {
  ...ShallowStoreMethods,
  ...internal,
};
/** @type {RenderStoreType} */
export const Render = makeShallowStore(internal);

export function CardContent3D({ cardID }) {
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
  return (
    <group>
      <Suspense fallback={null}>
        <AvatarShowCard envMap={envMap}>
          <group scale={0.23} position={[0, 0, 0]}>
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
          </group>
        </AvatarShowCard>
      </Suspense>
    </group>
  );
}
