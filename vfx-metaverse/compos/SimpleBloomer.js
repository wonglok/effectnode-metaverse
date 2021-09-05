import { useEffect, useRef } from "react";

import { useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Layers,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  ShaderMaterial,
  sRGBEncoding,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { useMiniEngine } from "../utils/use-mini-engine";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FXAAfrag } from "./FXAAfrag";

export const ENTIRE_SCENE = 0;
export const BLOOM_SCENE = 1;
export const DARK_SCENE = 2;

export const enableBloom = (item) => {
  item.layers.enable(BLOOM_SCENE);
};

export const enableDarken = (item) => {
  item.layers.enable(DARK_SCENE);
};

export class BloomLayer {
  constructor({ mini }) {
    let { get } = mini.now;

    let resBase = new Vector2();

    resBase.copy({
      x: get().gl.domElement.clientWidth,
      y: get().gl.domElement.clientHeight,
    });
    resBase.multiplyScalar(0.75);

    let efComposer = new EffectComposer(get().gl);

    let renderPass = new RenderPass(get().scene, get().camera);
    mini.onResize(() => {
      resBase.copy({
        x: get().gl.domElement.clientWidth,
        y: get().gl.domElement.clientHeight,
      });
      resBase.multiplyScalar(0.75);

      renderPass.setSize(resBase.x, resBase.y);
    });
    efComposer.addPass(renderPass);

    let unrealPass = new UnrealBloomPass(resBase, 1.0, 0.8, 0.2);
    mini.onResize(() => {
      resBase.copy({
        x: get().gl.domElement.clientWidth,
        y: get().gl.domElement.clientHeight,
      });
      resBase.multiplyScalar(0.75);

      unrealPass.setSize(resBase.x, resBase.y);
    });

    efComposer.addPass(unrealPass);

    efComposer.renderToScreen = false;

    let dark = new Color("#000000");
    // let darkMat = new MeshBasicMaterial({ color: 0x000000, skinning: true })
    let baseLayer = new Layers();
    baseLayer.disableAll();
    baseLayer.enable(ENTIRE_SCENE);

    let bloomLayer = new Layers();
    bloomLayer.disableAll();
    bloomLayer.enable(BLOOM_SCENE);
    let darkLayer = new Layers();
    darkLayer.disableAll();
    darkLayer.enable(DARK_SCENE);

    // let uniqueMaterialMap = new Map();
    // let full = onBeforeCompileForStdMat.toString();

    let getSig = (uuid) => {
      return "done"; // + uuid;
    };
    let setup = () => {
      let { scene } = get();
      let darken = new MeshBasicMaterial({
        color: 0x000000,
        transparent: false,
        opacity: 0,
        side: DoubleSide,
      });
      scene.traverse((it) => {
        if (
          it.material &&
          it.userData.____lastSig !== getSig(it.uuid) &&
          (it.material instanceof MeshStandardMaterial ||
            it.material instanceof MeshPhongMaterial ||
            it.material instanceof MeshBasicMaterial ||
            it.material instanceof MeshLambertMaterial ||
            it.material instanceof MeshMatcapMaterial ||
            it.material instanceof MeshPhysicalMaterial ||
            it.material instanceof MeshToonMaterial)
        ) {
          // let loc = window.location.href;
          // it[loc] = it[loc] || {};

          // let hh = (shader) => {
          //   let globalDarkening = { value: true };
          //   let bloomAPI = {
          //     shine: () => {
          //       globalDarkening.value = false;
          //     },
          //     dim: () => {
          //       globalDarkening.value = true;
          //     },
          //   };

          //   shader.uniforms.globalDarkening = globalDarkening;
          //   let atBegin = `
          //       uniform bool globalDarkening;
          //     `;
          //   let atEnd = `
          //       if (globalDarkening) {
          //         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          //       }
          //     `;
          //   shader.fragmentShader = `${atBegin.trim()}\n${
          //     shader.fragmentShader
          //   }`;
          //   shader.fragmentShader = shader.fragmentShader.replace(
          //     `#include <dithering_fragment>`,
          //     `#include <dithering_fragment>\n${atEnd.trim()}`
          //   );

          //   it.userData.bloomAPI = bloomAPI;
          // };

          let orig = it.material;
          let bloomAPI = {
            shine: () => {
              it.material = orig;
              // globalDarkening.value = false;
            },
            dim: () => {
              it.material = darken;
              // globalDarkening.value = true;
            },
          };

          it.userData.bloomAPI = bloomAPI;

          it.userData.____lastSig = getSig(it.uuid);
          // it.material.onBeforeCompile = hh;
          // it.material.customProgramCacheKey = () => {
          //   return getSig(it.uuid);
          // };
          // it.material.needsUpdate = true;
        }
      });
    };

    // BloomLayer.darkenMap = BloomLayer.darkenMap || ;
    // let enableDarkenMap = new Map();

    let setBloomSceneMat = () => {
      let { scene } = get();

      //
      scene.traverse((it) => {
        if (it?.userData?.enableBloom || it?.material?.userData?.enableBloom) {
          if (it?.userData?.bloomAPI?.shine) {
            it.userData.bloomAPI.shine();
          }
        } else {
          if (it?.userData?.bloomAPI?.dim) {
            it.userData.bloomAPI.dim();
          }
        }

        if (it?.userData?.discard) {
          it.visible = false;
        }
        if (it?.material?.userData?.discard) {
          it.visible = false;
        }
        if (it?.userData?.disableBloom) {
          it.visible = false;
        }
      });
    };

    let renderToTexture = () => {
      let { scene, clock } = get();
      let dt = clock.getDelta();
      let origBG = scene.background;
      scene.background = dark;
      efComposer.render(dt);
      scene.background = origBG;
    };

    //

    let restore = () => {
      let { scene } = get();

      scene.traverse((it) => {
        if (it?.userData?.bloomAPI?.shine) {
          it.userData.bloomAPI.shine();
        }

        if (it?.userData?.discard) {
          it.visible = true;
        }
        if (it?.material?.userData?.discard) {
          it.visible = false;
        }
        if (it?.userData?.disableBloom) {
          it.visible = true;
        }
      });
    };

    this.renderTexture = () => {
      let { gl } = get();
      gl.shadowMap.enabled = false;

      // bloom with occulsion image
      setup();
      setBloomSceneMat();
      renderToTexture();
      restore();

      gl.shadowMap.enabled = true;
    };
    this.getTex = () => {
      return efComposer.readBuffer.texture;
    };
  }
}

export class BaseLayer {
  constructor({ mini }) {
    let { get } = mini.now;

    let resBase = new Vector2();

    let dpr = get().gl.getPixelRatio();
    resBase.copy({
      x: get().gl.domElement.clientWidth,
      y: get().gl.domElement.clientHeight,
    });
    resBase.multiplyScalar(dpr);

    this.rtt = new WebGLRenderTarget(resBase.width, resBase.height, {
      encoding: sRGBEncoding,
      generateMipmaps: false,
    });

    mini.onResize(() => {
      resBase.copy({
        x: get().gl.domElement.clientWidth,
        y: get().gl.domElement.clientHeight,
      });
      resBase.multiplyScalar(dpr);

      this.rtt = new WebGLRenderTarget(resBase.width, resBase.height, {
        encoding: sRGBEncoding,
        generateMipmaps: false,
      });
    });

    this.renderTexture = () => {
      let { gl, camera, scene } = get();

      // base image
      let orig = gl.getRenderTarget();
      gl.setRenderTarget(this.rtt);
      gl.render(scene, camera);
      gl.setRenderTarget(orig);
    };

    this.getTex = () => {
      return this.rtt.texture;
    };
  }
}

export class Compositor {
  constructor({ mini }) {
    let { gl } = mini.now;
    //
    let quadMat = new ShaderMaterial({
      //
      uniforms: {
        bloomDiffuse: { value: null },
        tDiffuse: { value: null },
        dpi: { value: gl.getPixelRatio() },
        resolution: {
          value: new Vector2(
            1 / gl.domElement.clientWidth,
            1 / gl.domElement.clientHeight
          ),
        },
      },

      //
      vertexShader: `
        varying vec2 vUv;
        void main (void) {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vUv = uv;
        }
      `,

      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform sampler2D bloomDiffuse;
        uniform float dpi;

        ${/* FXAAfrag */ FXAAfrag}
        varying vec2 vUv;
          void main (void) {

            if (dpi == 3.0) {
              vec4 tDiffuseColor = texture2D(tDiffuse, vUv);
              gl_FragColor = vec4(tDiffuseColor.rgb,  tDiffuseColor.a);
            } else {
              gl_FragColor = FxaaPixelShader(
                vUv,
                vec4(0.0),
                tDiffuse,
                tDiffuse,
                tDiffuse,
                resolution,
                vec4(0.0),
                vec4(0.0),
                vec4(0.0),
                0.75,
                0.166,
                0.0833,
                0.0,
                0.0,
                0.0,
                vec4(0.0)
              );
              // TODO avoid querying texture twice for same texel
              gl_FragColor.a = texture2D(tDiffuse, vUv).a;
            }


            vec4 bloomDiffuseColor = texture2D(bloomDiffuse, vUv);
            gl_FragColor.r += 0.5 * pow(bloomDiffuseColor.r, 0.9);
            gl_FragColor.g += 0.5 * pow(bloomDiffuseColor.g, 0.9);
            gl_FragColor.b += 0.5 * pow(bloomDiffuseColor.b, 0.9);
          }
        `,
    });

    let fsQuad = new FullScreenQuad(quadMat);

    this.render = ({ baseTex, bloomTex }) => {
      let { gl } = mini.now;
      if (gl) {
        quadMat.uniforms.bloomDiffuse.value = bloomTex;
        quadMat.uniforms.tDiffuse.value = baseTex;
        quadMat.uniforms.resolution.value.x = 1 / gl.domElement.clientWidth;
        quadMat.uniforms.resolution.value.y = 1 / gl.domElement.clientHeight;
        fsQuad.render(gl);
      }
    };
  }
}

export function SimpleBloomer({ placeID = "" }) {
  let { mini } = useMiniEngine();

  let task = useRef(() => {});

  useEffect(() => {
    mini.ready.gl.then(() => {
      //
      let base = new BaseLayer({ mini });
      let bloom = new BloomLayer({ mini });
      let compositor = new Compositor({ mini });

      //
      task.current = () => {
        base.renderTexture();
        bloom.renderTexture();

        compositor.render({
          baseTex: base.getTex(),
          bloomTex: bloom.getTex(),
        });
      };
    });

    return () => {
      mini.clean();
    };
  }, [placeID]);

  // invalidate orignal loop
  useFrame(() => {
    task.current();
  }, 1000);

  return null;
}
