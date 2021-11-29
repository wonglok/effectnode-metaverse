import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, ShaderMaterial } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

export function Floor() {
  let gltf = useGLTF(`/map/blockout/map-without-stage2/map-no-stage-2-v1.glb`);
  let moutner = useRef();
  let render = useRef(() => {});
  useFrame(() => {
    render.current();
  });
  useEffect(() => {
    if (moutner.current) {
      //
      moutner.current.children.forEach((l) => {
        moutner.current.remove(l);
      });
      //
      let o3d = moutner.current;

      let floor = SkeletonUtils.clone(gltf.scene);

      o3d.add(floor);

      let Plane002_2 = floor.getObjectByName("Plane002_2");
      Plane002_2.material = getRainbowMat();

      render.current = () => {};

      return () => {
        render.current = () => {};
      };
    }
  }, []);
  return (
    <group>
      <group ref={moutner}></group>
      {/*  */}
      {/*  */}
      {/*  */}
    </group>
  );
}

function getRainbowMat() {
  return new ShaderMaterial({
    uniforms: {
      colorA: {
        value: new Color("#f0f"),
      },
      colorB: {
        value: new Color("#0ff"),
      },
    },
    vertexShader: `

      varying vec2 vUv;
      void main (void) {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: `

    varying vec2 vUv;
    uniform vec3 colorA;
    uniform vec3 colorB;
    void main (void) {


        gl_FragColor = vec4(mix(colorA.rgb, colorB.rgb, (vUv.x + vUv.y) / 2.0), 1.0);
      }
    `,
  });
}
