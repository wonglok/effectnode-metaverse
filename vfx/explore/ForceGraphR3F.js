import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import md5 from "md5";
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
  Color,
  BoxBufferGeometry,
} from "three";
// import { BASEURL, baseURL } from "../places";
import { useAutoEvent } from "../utils/use-auto-event";

//

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

    import("three-forcegraph").then(async ({ default: ThreeGraph }) => {
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

      let downloadTasks = await fetch(`/api/starlink`, { mode: "cors" })
        .then((e) => e.json())
        .then((v) => {
          return [
            Promise.resolve(v),

            ...v.friends.map((f) => {
              console.log(f);
              //
              return fetch(f.url)
                .then((e) => e.json())
                .catch((e) => {
                  console.log(e);
                  return false;
                });
            }),
          ];
        });

      //
      Promise.all(downloadTasks).then((hoods) => {
        hoods = hoods.filter((e) => e);

        let me = hoods[0].myself;

        let others = hoods.slice(1, hoods.length);

        let accumulatedData = {
          nodes: [],
          links: [],
        };

        hoods.forEach((eHood) => {
          eHood.nodes.forEach((s) => {
            accumulatedData.nodes.push(s);
          });
          eHood.links.forEach((s) => {
            accumulatedData.links.push(s);
          });
        });

        others.forEach((otherPpl) => {
          console.log(otherPpl);
          accumulatedData.links.push({
            source: me.id,
            target: otherPpl.myself.id,
            id: md5(`${me.id}${otherPpl.myself.id}`),
          });
        });

        accumulatedData.links = accumulatedData.links.filter(
          (value, index, self) => {
            return self.findIndex((v) => v.id === value.id) === index;
          }
        );

        accumulatedData.nodes = accumulatedData.nodes.filter(
          (value, index, self) => {
            return self.findIndex((v) => v.id === value.id) === index;
          }
        );

        graph.graphData(accumulatedData);

        // stuff.filter(s => s.)

        // .forEach((eachStarHood) => {});
        // console.log(stuff);

        graph.linkWidth(1);
        graph.linkCurvature(0);
        graph.linkDirectionalParticles(1);
        graph.linkDirectionalParticleSpeed(0.5 / 20);
        graph.linkDirectionalParticleWidth(1);

        let circle = new CircleBufferGeometry(7, 32);
        circle.translate(0, 0, 1);
        let plane = new BoxBufferGeometry(12, 12, 12);
        plane.translate(0, 0, 1);

        graph.nodeThreeObject((node) => {
          let material = new MeshBasicMaterial({
            transparent: true,
            map: new TextureLoader().load(
              node.thumbnail,
              (t) => {
                mesh.scale.x = t.image.width / t.image.height;
                mesh.scale.multiplyScalar(1);
              },
              () => {},
              () => {
                mesh.material.color = new Color("#ff00ff");
              }
            ),
          });

          let mesh = new Mesh(undefined, material);
          if (node.type === "core") {
            mesh.geometry = circle;
          } else {
            mesh.geometry = plane;
          }
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

  let goByNode = (node) => {
    window.location.assign(node.url);
  };

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

      if (node && node.url) {
        goByNode(node);
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

      if (node && node.url) {
        goByNode(node);
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
