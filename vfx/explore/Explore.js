import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Object3D } from "three";
import { ForceGraphR3F } from "./ForceGraphR3F";
import { Prototyper } from "./Prototyper";
// import ThreeGraph from "";

export function Explore() {
  return (
    <div className="w-full h-full">
      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      <Canvas dpr={[1, 2]}>
        <ForceGraphR3F></ForceGraphR3F>
        <Prototyper></Prototyper>
      </Canvas>
    </div>
  );
}
