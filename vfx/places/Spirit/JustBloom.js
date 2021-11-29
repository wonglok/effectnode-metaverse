import { Html, useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { DirectionalLight, Vector2 } from "three";
import { EffectComposer, RenderPass, UnrealBloomPass } from "three-stdlib";

export function JustBloom() {
  let { get } = useThree();
  let [bloomer, setBloomer] = useState(false);
  let [reoad, setReload] = useState(false);
  //
  let render = useRef(() => {});
  useEffect(() => {
    let camera = get().camera;
    let renderer = get().gl;
    let effectComposer = new EffectComposer(renderer);
    let renderPass = new RenderPass(get().scene, camera);
    renderPass.renderToScreen = false;
    effectComposer.renderToScreen = true;

    effectComposer.addPass(renderPass);
    let size = new Vector2(window.innerWidth, window.innerHeight);

    let bloomPass = new UnrealBloomPass(size, 3.3, 0.6, 0.0);
    effectComposer.addPass(bloomPass);

    window.addEventListener("resize", () => {
      renderer.getSize(size);

      bloomPass.setSize(size.width, size.height);
    });

    bloomPass.renderToScreen = true;
    //
    render.current = () => {
      effectComposer.render();
    };

    setBloomer(bloomPass);
    // let dirLight = new DirectionalLight(0xffffff, 10);
    // dirLight.position.y = 10;

    // window.addEventListener("magnet", ({ detail: { type, percentage } }) => {
    //   //
    //   bloomPass.strength = (percentage + 0.1) * 3.0;
    //   // dirLight.intensity = (percentage + 0.1) * 300.0;
    //   // dirLight.
    // });
  }, []);

  useFrame(({}) => {
    render.current();
  }, 10000);

  return (
    <group>
      {/* <Html
        center
        calculatePosition={(camera, o3d, size) => {
          return [size.width / 2, size.height / 2];
        }}
      >
        <div className="bg-white">
          <div className="flex mx-2 p-1">
            <input
              type={"range"}
              className="mr-3"
              defaultValue={bloomer.strength}
              min={0}
              max={5}
              step={0.001}
              onChange={({ target: { value } }) => {
                bloomer.strength = value;
                setReload(Math.random());
              }}
            />
            {bloomer.strength}
          </div>
          <div className="flex mx-2 p-1">
            <input
              type={"range"}
              className="mr-3"
              defaultValue={bloomer.radius}
              min={-10}
              max={10}
              step={0.001}
              onChange={({ target: { value } }) => {
                bloomer.radius = value;
                setReload(Math.random());
              }}
            />
            {bloomer.radius}
          </div>

          <div className="flex mx-2 p-1">
            <input
              type={"range"}
              className="mr-3"
              defaultValue={bloomer.threshold}
              min={0}
              max={1}
              step={0.001}
              onChange={({ target: { value } }) => {
                bloomer.threshold = value;
                setReload(Math.random());
              }}
            />
            {bloomer.threshold}
          </div>
        </div>
      </Html> */}
      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
    </group>
  );
}
