import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  Color,
  CubeCamera,
  CubeRefractionMapping,
  DoubleSide,
  LinearEncoding,
  ShaderMaterial,
  TextureLoader,
  WebGLCubeRenderTarget,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { ForceShield } from "./ForceShield";
import { useThree } from "@react-three/fiber";

export function Stage2() {
  let gltf = useGLTF(`/map/blockout/stage2/stage2-v1.glb`);
  let moutner = useRef();
  let render = useRef(() => {});
  useFrame((st, dt) => {
    render.current(st, dt);
  });
  //
  //
  useEffect(() => {
    if (moutner.current) {
      //
      moutner.current.children.forEach((l) => {
        moutner.current.remove(l);
      });

      let o3d = moutner.current;

      let floor = SkeletonUtils.clone(gltf.scene);

      o3d.add(floor);

      let crtt = new WebGLCubeRenderTarget(256);
      crtt.texture.mapping = CubeRefractionMapping;
      let cubeCam = new CubeCamera(0.3, 1000, crtt);
      // get().scene.environment = cubeCam.texture;

      let honey = floor.getObjectByName("HoneyCome");

      honey.scale.multiplyScalar(3);

      let force = new ForceShield({
        //
        //
      });
      honey.material = force.shield;
      force.uniforms.tCube.value = crtt.texture;
      //

      render.current = (st, dt) => {
        //
        force.time += dt;
        honey.visible = false;
        cubeCam.position.copy(honey.position);

        // console.log(honey.position);

        cubeCam.update(st.gl, st.scene);
        honey.visible = true;

        // debug
        honey.visible = false;
      };

      return () => {
        render.current = (st, dt) => {
          //
        };
      };
    }
  }, []);
  return (
    <group>
      <group ref={moutner}></group>

      {/* <AnimationController
        animations={gltf.animations}
        scene={gltf.scene}
      ></AnimationController> */}
      {/* <group></group> */}
      {/*  */}
      {/*  */}
      {/*  */}
    </group>
  );
}

// function AnimationController({ animations, scene }) {
//   const { actions } = useAnimations(animations, scene);

//   // Storybook Knobs
//   const actionOptions = Object.keys(actions);
//   const selectedAction = actionOptions[0];
//   const blendDuration = 2;

//   useEffect(() => {
//     actions[selectedAction]?.reset().fadeIn(blendDuration).play();
//     return () => {
//       actions[selectedAction]?.fadeOut(blendDuration);
//     };
//   }, [actions, selectedAction, blendDuration]);

//   return null;
// }

// function getRainbowMat({ works }) {
//   let dudv = new TextureLoader().load(`/texture/waterdudv.jpg`, (t) => {
//     //
//     //
//     t.encoding = LinearEncoding;

//     //
//   });
//   let uniforms = {
//     colorA: {
//       value: new Color("#f0f"),
//     },
//     colorB: {
//       value: new Color("#0ff"),
//     },
//     dudv: {
//       value: dudv,
//     },
//   };

//   //
//   works.push((st, dt) => {
//     //
//   });

//   return new ShaderMaterial({
//     uniforms,
//     side: DoubleSide,

//     //
//     vertexShader: `
//       varying vec2 vUv;
//       void main (void) {
//         vUv = uv;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `,
//     //

//     //
//     fragmentShader: `
//       varying vec2 vUv;
//       uniform vec3 colorA;
//       uniform vec3 colorB;
//       void main (void) {

//         gl_FragColor = vec4(mix(colorA.rgb, colorB.rgb, (vUv.x - vUv.y) / 2.0), 1.0);
//       }
//     `,
//     //
//   });
// }
