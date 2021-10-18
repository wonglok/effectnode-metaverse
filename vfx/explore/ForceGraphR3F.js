import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Object3D } from "three";
export function ForceGraphR3F() {
  let { get } = useThree();
  let works = useRef({ sim() {} });
  let o3d = useMemo(() => {
    return new Object3D();
  }, []);

  useEffect(() => {
    let cleans = [];
    import("three-forcegraph").then(({ default: ThreeGraph }) => {
      //
      const N = 300;
      const gData = {
        nodes: [...Array(N).keys()].map((i) => ({ id: i })),
        links: [...Array(N).keys()]
          .filter((id) => id)
          .map((id) => ({
            source: id,
            target: Math.round(Math.random() * (id - 1)),
          })),
      };

      let graph = new ThreeGraph();
      graph.graphData(gData);

      o3d.children.forEach((l) => {
        o3d.remove(l);
      });

      //
      o3d.add(graph);

      works.current.sim = () => {
        graph.tickFrame();
      };
    });

    return () => {
      cleans.forEach((e) => e());
    };
  }, []);

  useFrame(() => {
    works.current.sim();
  });

  return (
    <group>
      {/*  */}
      {/*  */}
      {/*  */}
      <primitive object={o3d}></primitive>
    </group>
  );
}
