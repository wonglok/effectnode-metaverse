// public/map/blockout/mech/mech-v1.glb

import { Html, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  Object3D,
  BufferGeometry,
  Points,
  ShaderMaterial,
  Mesh,
  Vector3,
  Color,
  BufferAttribute,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Raycaster,
  DataTexture,
  FloatType,
  MathUtils,
  DataUtils,
  HalfFloatType,
  RGBFormat,
  BoxGeometry,
  RGBAFormat,
  Quaternion,
  Euler,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { AllAnimationPlayer } from "./AnimationPlayer";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { FieldCompute } from "./FieldCompute";
import { FieldRendering } from "./FieldRendering";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
// export function Mech({ prog }) {
//   return <MechPhantom prog={prog}></MechPhantom>;
// }

export function GeoSpirit({ prog }) {
  let gltf = useGLTF(`/church/dove-v2.glb`);
  // let [found, setFound] = useState();
  let { get } = useThree();
  let touchPoint = useMemo(() => {
    return new Object3D();
  });

  // useEffect(() => {
  //   let tt = setInterval(() => {
  //     let addon = get().scene.getObjectByName("Empty083");
  //     if (addon) {
  //       clearInterval(tt);
  //       setFound(addon);
  //     }
  //   });

  //   return () => {};
  // }, []);

  let o3d = useMemo(() => {
    return new Object3D();
  }, []);

  o3d.rotation.x = Math.PI * 0.15;
  o3d.rotation.y = Math.PI * -0.15;
  o3d.rotation.z = Math.PI * 0.1;

  let render = useRef([]);
  useFrame((st, dt) => {
    render.current.forEach((t) => t(st, dt));
  });

  let progress = useMemo(() => {
    return { value: 0.4 };
  }, []);

  useEffect(() => {
    let cleans = [];
    if (true) {
      let toBeMerged = [];
      let offset = new Object3D();
      offset.position.y = 1.7;
      // offset.rotation.y = Math.PI * -0.7;
      // offset.rotation.z = Math.PI * -0.1;
      offset.scale.setScalar(0.2);
      offset.updateMatrix();
      gltf.scene.rotation.set(Math.PI * -2.06, Math.PI * 0.5, 0);
      gltf.scene.updateMatrixWorld();
      gltf.scene.traverse((c) => {
        if (c.geometry && !c.userData.skipFloor) {
          const cloned = c.geometry.clone().toNonIndexed();

          cloned.applyMatrix4(c.matrixWorld);

          for (const key in cloned.attributes) {
            if (key === "position" || key === "index") {
            } else {
              cloned.deleteAttribute(key);
            }
          }

          toBeMerged.push(cloned);
        }
      });
      //
      const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
        toBeMerged,
        false
      );
      //
      toBeMerged.forEach((m) => {
        m.dispose();
      });

      let display = SkeletonUtils.clone(gltf.scene);
      display.applyMatrix4(offset.matrix);
      o3d.add(display);

      let copy = new Mesh(mergedGeometry);

      let renderable = new Points(
        mergedGeometry,
        new MeshBasicMaterial({
          color: 0xffffff,
          // opacity: progress.value,
          transparent: true,
        })
      );
      renderable.applyMatrix4(offset.matrix);
      renderable.visible = false;
      o3d.add(renderable);

      let sampler = new MeshSurfaceSampler(copy);
      sampler.build();
      let pos = new Vector3();

      let sW = 256;
      let sH = 128;
      if (window.innerWidth >= 1441) {
        sW = 512;
        sH = 256;
      }

      let sCount = sW * sH;

      let buff = {
        pos: [],
      };

      // let wQ = new Quaternion();
      // let wP = new Vector3();
      for (let i = 0; i < sCount; i++) {
        sampler.sample(pos);

        pos.applyMatrix4(offset.matrix);
        pos.multiplyScalar(1.1);

        buff.pos.push(pos.x || 0.01, pos.y || 0.01, pos.z || 0.01, 1.0);
      }

      let dataTex = new DataTexture(
        new Uint16Array(buff.pos.map((a) => DataUtils.toHalfFloat(a))),
        sW,
        sH,
        RGBAFormat,
        HalfFloatType
      );

      ///
      ///
      ///
      ///
      ///
      ///
      ///

      let fc = new FieldCompute({
        progress,
        gl: get().gl,
        camera: get().camera,
        base: sW,
        count: sH,
      });

      render.current.push(() => {
        fc.initPosition = dataTex;
        fc.compute();

        /** @type {Object3D} */
        touchPoint = touchPoint;

        // pointer3d.
        fc.pointer3d.copy(touchPoint.position);
      });

      let fr = new FieldRendering({
        progress,
        base: sW,
        count: sH,
        positionTexture: fc.getPositionTex(),
      });

      render.current.push(() => {
        // renderable.material.opacity = progress.value * 0.4;
        fr.uniforms.positionTexture.value = fc.getPositionTex();
        fr.compute();
      });

      o3d.add(fr.renderable);
      cleans.push(() => {
        o3d.remove(fr.renderable);
      });
      ///
      ///
      ///
      ///
      ///
      ///
      ///
      ///
      ///
      ///
      ///
      ///
      ///

      let planeGeo = new PlaneBufferGeometry(10, 10);
      let planeTouch = new Mesh(planeGeo);

      let positionW = new Vector3();
      render.current.push((st, dt) => {
        st.camera.getWorldPosition(positionW);
        planeTouch.lookAt(positionW);
      });

      planeTouch.visible = false;

      o3d.userData.planeTouch = planeTouch;
      o3d.add(planeTouch);
      o3d.add(touchPoint);
      //
      cleans.push(() => {
        display.visible = false;
        renderable.visible = false;
        fr.renderable.visible = false;
        //
        o3d.children.forEach((c) => {
          o3d.remove(c);
        });
      });
    }

    // gltf.scene.traverse((it) => {
    //   if (it.geometry) {
    //     let ccc = it.geometry.clone();
    //     toBeMerged.push(ccc);
    //   }
    // });

    // gltf.scene.traverse((it) => {

    // });

    return () => {
      cleans.forEach((c) => c());
    };
  }, [touchPoint]);

  useFrame(({ get, camera }) => {
    let raycaster = get().raycaster;
    raycaster.setFromCamera(get().mouse, get().camera);

    if (o3d.userData.planeTouch) {
      o3d.userData.planeTouch.lookAt(camera.position);
      let res = raycaster.intersectObject(o3d.userData.planeTouch, true);

      if (res[0]) {
        res[0].object.worldToLocal(res[0].point);
        touchPoint.position.copy(res[0].point);
      }
    }
  });

  //
  return (
    <group>
      <group
        position={new Vector3()
          // .copy({
          //   x: -84.92800903320312,
          //   y: 1.091020941734314,
          //   z: -93.56330871582031,
          // })
          .toArray()}
      >
        <Html>
          <div style={{ backgroundColor: "white" }}>
            <input
              type={"range"}
              defaultValue={progress.value}
              onInput={(v) => {
                //
                //
                //
                progress.value = v.target.value;
              }}
              min={0}
              max={1}
              step={0.0001}
            ></input>
          </div>
        </Html>

        <primitive object={o3d}></primitive>
      </group>

      <group></group>
    </group>
  );
}

// export function MechSolid({ prog }) {
//   //
//   let gltf = useGLTF(`/map/blockout/mech/mech-v1.glb`);
//   let { get } = useThree();
//   let [found, setFound] = useState();
//   let render = useRef(() => {});
//   useFrame((st, dt) => {
//     render.current(st, dt);
//   });

//   //
//   let o3d = new Object3D();
//   useEffect(() => {
//     let tt = setInterval(() => {
//       let addon = get().scene.getObjectByName("Empty083");
//       if (addon) {
//         clearInterval(tt);
//         setFound(addon);

//         console.log("found adddon", addon);
//       }
//     });

//     render.current = () => {};
//     return () => {
//       render.current = () => {};
//     };
//   }, [o3d]);
//   return (
//     <group>
//       {/*  */}
//       {/*  */}
//       {found &&
//         createPortal(
//           <group>
//             <group scale={1}>
//               {/* <primitive object={o3d}></primitive> */}
//               <primitive object={gltf.scene}></primitive>
//             </group>
//             {/* <mesh position={[0, 0, 0]}>
//               <meshPhysicalMaterial
//                 transmission={1}
//                 opacity={1}
//                 transparent={true}
//               />
//               <sphereBufferGeometry args={[0.5, 32, 32]}></sphereBufferGeometry>
//             </mesh> */}
//           </group>,
//           found
//         )}
//       {/*  */}
//       {/*  */}
//       {found && (
//         <AllAnimationPlayer
//           scene={gltf.scene}
//           animations={gltf.animations}
//           prog={prog}
//         ></AllAnimationPlayer>
//       )}
//     </group>
//   );
// }
