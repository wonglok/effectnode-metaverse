import { Preload, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
// import { MeshLambertMaterial, MeshPhongMaterial } from "three";
import { WelcomeAvatar } from "../vfx-content/welcome-page/WelcomeAvatar";
import {
  Map3D,
  UserContorls,
  TailCursor,
  SimpleBloomer,
  StarSky,
  TheHelper,
  useComputeEnvMap,
  makeShallowStore,
} from "../vfx-metaverse";

import { Now } from "../vfx-metaverse/lib/Now";
import { LoginBall } from "../vfx-content/welcome-page/LoginBall";
import { LoadingScreen } from "../vfx-content/welcome-page/LoadingScreen";
import { HoneyShip } from "../vfx-content/welcome-page/HoneyShip";
import { useShaderEnvLight } from "../vfx-content/welcome-page/useShaderEnvLight";
import { SceneDecorator } from "../vfx-metaverse/compos/SceneDecorator";

// import { MathUtils } from "three";

let UI = makeShallowStore({
  //
  layer: "none",
});

export default function Page() {
  //

  let [wait, setOK] = useState(false);
  return (
    <div className="full">
      <Canvas
        concurrent
        dpr={[1, 3]}
        onCreated={({ gl }) => {
          getGPUTier({ glContext: gl.getContext() }).then((v) => {
            let setDPR = ([a, b]) => {
              let base = window.devicePixelRatio || 1;
              if (b >= base) {
                b = base;
              }

              gl.setPixelRatio(b);

              setOK(true);
            };

            if (v.gpu === "apple a9x gpu") {
              setDPR([1, 1]);
              return;
            } else if (v.fps <= 30) {
              setDPR([1, 1]);
            } else if (v.tier >= 3) {
              setDPR([1, 3]);
            } else if (v.tier >= 2) {
              setDPR([1, 2]);
            } else if (v.tier >= 1) {
              setDPR([1, 1]);
            } else if (v.tier < 1) {
              setDPR([1, 1]);
            }
          });
        }}
        //
        //
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={<LoadingScreen></LoadingScreen>}>
          {wait && (
            <group>
              <Content3D></Content3D>
              <Preload all></Preload>
            </group>
          )}
        </Suspense>
        <StarSky></StarSky>
      </Canvas>

      <Overlays></Overlays>
    </div>
  );
}

function Overlays() {
  UI.makeKeyReactive("layer");
  let cursorRef = useRef();
  useEffect(() => {
    let tt = setInterval(() => {
      let cur = cursorRef.current;
      if (cur) {
        cur.innerHTML = JSON.stringify(
          Now.cursorPos.toArray().map((e) => Number(e.toFixed(2)))
        );
      }
    });
    //
    //
    //
    return () => {
      clearInterval(tt);
    };
  });

  return (
    <>
      <div className="absolute top-0 right-0" ref={cursorRef}></div>
    </>
  );
}

/*
 */

function Content3D() {
  let { envMap } = useShaderEnvLight({});
  let gltf = useGLTF(`/map/spaewalk/space-walk-v003.glb`);

  return (
    <group>
      {gltf.scene && (
        <group>
          <Map3D object={gltf.scene}></Map3D>
          <primitive object={gltf.scene}></primitive>
          <SceneDecorator object={gltf.scene}></SceneDecorator>

          <group
            position={[
              //
              gltf.scene.getObjectByName("welcomeAt").position.x,
              0,
              gltf.scene.getObjectByName("welcomeAt").position.z,
            ]}
          >
            <WelcomeAvatar envMap={envMap}></WelcomeAvatar>
          </group>
        </group>
      )}

      <UserContorls
        higherCamera={-0.6}
        avatarSpeed={0.9}
        Now={Now}
      ></UserContorls>

      <TailCursor Now={Now} color={"#ffffff"}></TailCursor>
      <TheHelper Now={Now}></TheHelper>

      <SimpleBloomer></SimpleBloomer>

      <LoginBall envMap={envMap}></LoginBall>

      <mesh
        onClick={() => {
          let router = require("next/router").default;
          router.push(`/storymaker`);
        }}
        position={[3, 2, 23]}
        userData={{
          onClick: () => {
            let router = require("next/router").default;
            router.push(`/storymaker`);
          },
          hint: "Let's Make Action Movie",
        }}
      >
        <sphereBufferGeometry args={[0.3, 23, 23]}></sphereBufferGeometry>
        <meshStandardMaterial
          metalness={1}
          roughness={0}
          envMap={envMap}
          color="#44ffff"
        ></meshStandardMaterial>
      </mesh>

      <HoneyShip></HoneyShip>
    </group>
  );
}

//

// public/objects

/* <mesh
        onClick={() => {
          console.log("click IG");
        }}
        position={[3, 2, 0]}
        userData={{
          onClick: () => {
            console.log("emit on fun");
          },
          hint: "Activate Card",
        }}
      >
        <sphereBufferGeometry></sphereBufferGeometry>
        <meshStandardMaterial
          metalness={1}
          roughness={0}
          envMap={envMap}
          color="#ff00ff"
        ></meshStandardMaterial>
      </mesh> */

// const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

// float noise( in vec2 p ) {
//   return sin(p.x)*sin(p.y);
// }

// float fbm4( vec2 p ) {
//     float f = 0.0;
//     f += 0.5000 * noise( p ); p = m * p * 2.02;
//     f += 0.2500 * noise( p ); p = m * p * 2.03;
//     f += 0.1250 * noise( p ); p = m * p * 2.01;
//     f += 0.0625 * noise( p );
//     return f / 0.9375;
// }

// float fbm6( vec2 p ) {
//     float f = 0.0;
//     f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
//     f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
//     f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
//     f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
//     f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
//     f += 0.015625*(0.5 + 0.5 * noise( p ));
//     return f/0.96875;
// }

// float pattern (vec2 p) {
//   float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
//   return abs(vout);
// }

// vec4 mainImage (vec2 uv, vec3 direction, vec3 pos) {
//   return vec4(vec3(
//     1.0 - pattern(direction.xy * 3.70123 + -0.17 * cos(time * 0.05)),
//     1.0 - pattern(direction.xy * 3.70123 +  0.0 * cos(time * 0.05)),
//     1.0 - pattern(direction.xy * 3.70123 +  0.17 * cos(time * 0.05))
//   ), 1.0);
// }
