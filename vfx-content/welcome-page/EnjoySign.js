import { Text } from "@react-three/drei";
import { createPortal, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  Object3D,
  ShaderMaterial,
  TorusBufferGeometry,
  Vector3,
} from "three";
import { useMiniEngine } from "../../vfx-metaverse";
import { EnergyArt } from "../../vfx-metaverse/lib/EnergyArt";

export function EnjoySign({ visible, avatar, envMap }) {
  //
  return (
    <group>
      {/* // */}

      {/* // */}
      {createPortal(
        <group position={[0, 0, 0.2]} visible={true}>
          {/*  */}
          {/*  */}

          {/*  */}
          {/*  */}
          {/* <RingAroundBody envMap={envMap}></RingAroundBody> */}
          {/* <RingAroundBody avatar={avatar} envMap={envMap}></RingAroundBody> */}
        </group>,
        avatar.getObjectByName("Hips")
      )}
    </group>
  );
}
