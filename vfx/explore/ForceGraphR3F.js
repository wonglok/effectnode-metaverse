import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Sprite,
  SpriteMaterial,
  TextureLoader,
} from "three";
export function ForceGraphR3F() {
  let { get } = useThree();
  let works = useRef({ sim() {} });
  let o3d = useMemo(() => {
    return new Object3D();
  }, []);

  useEffect(() => {
    let cleans = [];
    let gworks = [];

    // let demo = (graph) => {
    //   const N = 300;
    //   const gData = {
    //     nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    //     links: [...Array(N).keys()]
    //       .filter((id) => id)
    //       .map((id) => ({
    //         source: id,
    //         target: Math.round(Math.random() * (id - 1)),
    //       })),
    //   };
    //   graph.graphData(gData);
    // };
    import("three-forcegraph").then(({ default: ThreeGraph }) => {
      //
      let graph = new ThreeGraph();

      o3d.children.forEach((l) => {
        o3d.remove(l);
      });

      o3d.add(graph);

      works.current.sim = () => {
        graph.tickFrame();
        gworks.forEach((w) => w());
      };

      /// load data

      fetch(`/api/starlink`)
        .then((e) => e.json())
        .then((v) => {
          graph.graphData(v);

          graph.linkWidth(1);
          graph.linkCurvature(1);
          graph.linkDirectionalParticles(1);
          graph.linkDirectionalParticleSpeed(0.5 / 20);
          graph.linkDirectionalParticleWidth(1);

          let geo = new CircleBufferGeometry(6, 32);
          geo.translate(0, 0, 1);

          graph.nodeThreeObject((node) => {
            let material = new MeshBasicMaterial({
              transparent: true,
              map: new TextureLoader().load(node.thumbnail, (t) => {
                mesh.scale.x = t.image.width / t.image.height;
                mesh.scale.multiplyScalar(1);
              }),
            });

            let mesh = new Mesh(geo, material);
            mesh.userData.enableBloom = false;

            gworks.push(() => {
              mesh.lookAt(get().camera.position);
            });
            return mesh;
          });
        });

      ///
      ///
      ///
      ///
    });

    return () => {
      cleans.forEach((e) => e());
    };
  }, []);

  useFrame(() => {
    works.current.sim();
  });

  return (
    <group position={[0, 0, 0]} scale={1}>
      {/*  */}
      {/*  */}
      {/*  */}
      <primitive object={o3d}></primitive>
    </group>
  );
}
