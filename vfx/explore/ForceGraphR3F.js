import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import router from "next/router";
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
import { baseURL } from "../places";
import { useAutoEvent } from "../utils/use-auto-event";
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
            mesh.name = node.placeID;
            mesh.userData.enableBloom = false;
            mesh.userData.type = "metaverse-node";
            mesh.userData.node = node;
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

  let detect = (o3d) => {
    if (!o3d) {
      return false;
    }
    get().raycaster.setFromCamera(get().mouse, get().camera);
    let res = get().raycaster.intersectObjects([o3d], true);
    if (res && res[0]) {
      return res[0];
    } else {
      return false;
    }
  };

  let target = useRef(false);
  let isDown = useRef(false);
  let move = useRef(0);
  let runrun = () => {
    if (isDown.current) {
      move.current++;
    }
    let res = detect(o3d);
    let show = false;
    if (res) {
      target.current = res.object;
    }
    if (show) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "";
    }
  };
  useFrame(runrun);

  let down = (ev) => {
    move.current = 0;
    isDown.current = true;
  };
  let up = (ev) => {
    runrun();
    if (
      target.current &&
      target.current?.userData?.node &&
      move.current <= 10
    ) {
      let node = target.current.userData?.node;
      if (baseURL === node.baseURL) {
        router.router.push(node.sameSiteLink);
      } else {
        window.location.assign(node.url);
      }
    }

    move.current = 0;
    isDown.current = false;
  };

  let dom = get().gl.domElement;

  useAutoEvent(
    "metaverse-click-mesh",
    ({ detail }) => {
      let node = detail?.userData?.node;

      console.log(node);
      if (node && baseURL === node.baseURL) {
        router.router.push(node.sameSiteLink);
      } else {
        window.location.assign(node.url);
      }
    },
    { passive: false },
    window
  );
  useAutoEvent("pointerdown", down, { passive: false }, dom);
  useAutoEvent("pointerup", up, { passive: false }, dom);

  return (
    <group position={[0, 0, 0]} scale={1}>
      {/*  */}
      {/*  */}
      {/*  */}
      <primitive object={o3d}></primitive>
    </group>
  );
}
