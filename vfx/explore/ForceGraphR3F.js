import { useFrame, useThree } from "@react-three/fiber";
// import router from "next/router";
import md5 from "md5";
import { useEffect, useMemo, useRef } from "react";
import {
  CircleBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  TextureLoader,
  Color,
  BoxBufferGeometry,
  sRGBEncoding,
} from "three";
import { useAutoEvent } from "../utils/use-auto-event";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

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

      graph.linkWidth(1);
      graph.linkCurvature(0.6);
      graph.linkDirectionalParticles(1);
      graph.linkDirectionalParticleSpeed(0.5 / 20);
      graph.linkDirectionalParticleWidth(1);

      let box = new RoundedBoxGeometry(12, 12, 2, 2, 2);
      box.translate(0, 0, 1);

      //
      let circle = new CircleBufferGeometry(7, 32);
      circle.translate(0, 0, 1);

      graph.nodeThreeObject((node) => {
        let material = new MeshBasicMaterial({
          transparent: true,
          map: new TextureLoader().load(
            node.thumbnail,
            (t) => {
              t.encoding = sRGBEncoding;

              if (t.image.width >= t.image.height) {
                mesh.scale.x = t.image.width / t.image.height;
              } else if (t.image.width <= t.image.height) {
                mesh.scale.y = t.image.height / t.image.width;
              } else {
              }
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
          mesh.geometry = box;
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

      o3d.children.forEach((l) => {
        o3d.remove(l);
      });

      o3d.add(graph);

      works.current.sim = () => {
        graph.tickFrame();
        gworks.forEach((w) => w());
        o3d.rotation.y += 1 / 60 / 12;
      };

      let cache = new Map();
      fetch(`/api/starlink`, { mode: "cors" })
        .then((e) => e.json())
        .then((v) => {
          cache.set(v.id, v);
          onRunHoods([v]);
          return {
            me: v,
            bucket: [],
          };
        })
        .then(({ me, bucket }) => {
          if (me) {
            let loadFriends = (me) => {
              me.friends.forEach((f) => {
                let urlObj = new URL(f.url);
                let origin = urlObj.origin;
                return fetch(`${f.url}?domain=${encodeURIComponent(origin)}`)
                  .then((e) => e.json())
                  .then((j) => {
                    //
                    cache.set(j.id, j);
                    bucket.push(j);
                    onRunHoods([me, ...bucket], me.myself);
                  })
                  .catch((e) => {
                    console.log(e);
                    return false;
                  });
              });
            };

            loadFriends(me);
          }
        });

      let onRunHoods = (hoods, me) => {
        let others = hoods.filter((e) => e);

        let currentData = { nodes: [], links: [] };

        others.forEach((eHood) => {
          eHood.nodes.forEach((s) => {
            if (!currentData.nodes.some((a) => a.id === s.id)) {
              currentData.nodes.push(s);
            }
          });

          eHood.links.forEach((s) => {
            currentData.links.push(s);
          });
        });

        if (me) {
          others.forEach((otherPpl) => {
            currentData.links.push({
              source: me?.id,
              target: otherPpl?.myself?.id,
              id: md5(`${me?.id}${otherPpl?.myself?.id}`),
            });
          });
        }

        graph.graphData(currentData);
      };
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

  return (
    <group position={[0, 0, 0]} scale={1}>
      {/*  */}
      {/*  */}
      {/*  */}
      <primitive object={o3d}></primitive>
    </group>
  );
}
