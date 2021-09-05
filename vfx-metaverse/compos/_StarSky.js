import { Box, Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { BackSide, Color, DoubleSide, Scene } from "three";
import { useComputeEnvMap } from "../use/useComputeEnvMap";

export function StarSky() {
  // let shaders = {
  //   vertexShader: /* glsl */ `
  //   // varying vec3 vPos;
  //   // varying vec3 vUv3;
  //   varying vec3 vWorldDirection;
  //   vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
  //     return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
  //   }
  //   void main() {
  //     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  //     gl_Position = projectionMatrix * mvPosition;
  //     // vPos = position;
  //     // vUv3 = uv.xyx;
  //     vWorldDirection = transformDirection( position, modelMatrix );
  //   }
  //   `,
  //   fragmentShader: `
  //     precision highp float;
  //     varying vec3 vWorldDirection;
  //     vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  //     vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  //     vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
  //     float cnoise(vec3 P){
  //       vec3 Pi0 = floor(P); // Integer part for indexing
  //       vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  //       Pi0 = mod(Pi0, 289.0);
  //       Pi1 = mod(Pi1, 289.0);
  //       vec3 Pf0 = fract(P); // Fractional part for interpolation
  //       vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  //       vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  //       vec4 iy = vec4(Pi0.yy, Pi1.yy);
  //       vec4 iz0 = Pi0.zzzz;
  //       vec4 iz1 = Pi1.zzzz;
  //       vec4 ixy = permute(permute(ix) + iy);
  //       vec4 ixy0 = permute(ixy + iz0);
  //       vec4 ixy1 = permute(ixy + iz1);
  //       vec4 gx0 = ixy0 / 7.0;
  //       vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  //       gx0 = fract(gx0);
  //       vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  //       vec4 sz0 = step(gz0, vec4(0.0));
  //       gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  //       gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  //       vec4 gx1 = ixy1 / 7.0;
  //       vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  //       gx1 = fract(gx1);
  //       vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  //       vec4 sz1 = step(gz1, vec4(0.0));
  //       gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  //       gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  //       vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  //       vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  //       vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  //       vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  //       vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  //       vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  //       vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  //       vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  //       vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  //       g000 *= norm0.x;
  //       g010 *= norm0.y;
  //       g100 *= norm0.z;
  //       g110 *= norm0.w;
  //       vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  //       g001 *= norm1.x;
  //       g011 *= norm1.y;
  //       g101 *= norm1.z;
  //       g111 *= norm1.w;
  //       float n000 = dot(g000, Pf0);
  //       float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  //       float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  //       float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  //       float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  //       float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  //       float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  //       float n111 = dot(g111, Pf1);
  //       vec3 fade_xyz = fade(Pf0);
  //       vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  //       vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  //       float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  //       return 2.2 * n_xyz;
  //     }
  //     // varying vec3 vPos;
  //     uniform float time;
  //     // varying vec3 vUv3;
  //     void main() {
  //       float speed = time / 3.5;
  //       vec3 pp;
  //       pp = vWorldDirection.xyz * 500.0 + speed * 2.0;
  //       // pp += vPos * 0.25 + speed;
  //       float noise = clamp(cnoise(speed + pp / 250.0 + 0.0 ), 0.0, 1.0);
  //       vec3 colorA = vec3(81.0, 135.0, 228.0) * 0.35 / 255.0;
  //       vec3 colorB = vec3(0.0, 150.0, 136.0) * 0.6 / 255.0;
  //       vec3 colorC = mix(colorA, colorB, noise);
  //       vec4 backgroundColor = vec4(colorC * colorC, 1.0);
  //       gl_FragColor = backgroundColor;
  //       float starNoise1 = (noise) * pow(cnoise(speed + pp * 2.0) * 0.5 + 0.5, 15.5 + sin(time)) * 15.0;
  //       float starNoise2 = (noise) * pow(cnoise(speed + pp * 1.3) * 0.5 + 0.5, 15.5 + sin(time)) * 15.0;
  //       gl_FragColor.rgb += vec3(pow(starNoise1, 1.3) * vec3(10.0, 20.0, 255.0) / 255.0) * 1.0;
  //       gl_FragColor.rgb += vec3(pow(starNoise2, 1.3) * vec3(30.0, 140.0, 255.0) / 255.0) * 1.0;
  //     }
  //     `,
  // };
  // let ref = useRef();
  // useEffect(() => {
  //   if (ref.current) {
  //     ref.current.needsUpdate = true;
  //   }
  // }, [shaders, shaders.fragmentShader, shaders.vertexShader]);
  // let uniforms = useRef({
  //   time: { value: 0 },
  // });
  // useFrame((st, dt) => {
  //   uniforms.current.time.value += dt;
  // });
  // let envMap = useComputeEnvMap(
  //   /* glsl */ `
  //   precision highp float;
  //   // varying vec3 vWorldDirection;
  //   vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  //   vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  //   vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
  //   float cnoise(vec3 P){
  //   vec3 Pi0 = floor(P); // Integer part for indexing
  //   vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  //   Pi0 = mod(Pi0, 289.0);
  //   Pi1 = mod(Pi1, 289.0);
  //   vec3 Pf0 = fract(P); // Fractional part for interpolation
  //   vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  //   vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  //   vec4 iy = vec4(Pi0.yy, Pi1.yy);
  //   vec4 iz0 = Pi0.zzzz;
  //   vec4 iz1 = Pi1.zzzz;
  //   vec4 ixy = permute(permute(ix) + iy);
  //   vec4 ixy0 = permute(ixy + iz0);
  //   vec4 ixy1 = permute(ixy + iz1);
  //   vec4 gx0 = ixy0 / 7.0;
  //   vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  //   gx0 = fract(gx0);
  //   vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  //   vec4 sz0 = step(gz0, vec4(0.0));
  //   gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  //   gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  //   vec4 gx1 = ixy1 / 7.0;
  //   vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  //   gx1 = fract(gx1);
  //   vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  //   vec4 sz1 = step(gz1, vec4(0.0));
  //   gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  //   gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  //   vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  //   vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  //   vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  //   vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  //   vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  //   vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  //   vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  //   vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  //   vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  //   g000 *= norm0.x;
  //   g010 *= norm0.y;
  //   g100 *= norm0.z;
  //   g110 *= norm0.w;
  //   vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  //   g001 *= norm1.x;
  //   g011 *= norm1.y;
  //   g101 *= norm1.z;
  //   g111 *= norm1.w;
  //   float n000 = dot(g000, Pf0);
  //   float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  //   float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  //   float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  //   float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  //   float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  //   float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  //   float n111 = dot(g111, Pf1);
  //   vec3 fade_xyz = fade(Pf0);
  //   vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  //   vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  //   float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  //   return 2.2 * n_xyz;
  //   }
  //   // varying vec3 vPos;
  //   // uniform float time;
  //   // varying vec3 vUv3;
  //   // const float PI = 3.14159265;
  //   // const float SCALE = 1.0;
  //   // const mat3 m = mat3(
  //   //   cos(PI * SCALE), -sin(PI * SCALE), 0.0,
  //   //   sin(PI * SCALE),  cos(PI * SCALE), 0.0,
  //   //   0.0,  0.0, 1.0
  //   // );
  //   // float noise( in vec3 p ) {
  //   //   return cos(p.x) * sin(p.y) * cos(p.z);
  //   // }
  //   // float fbm4( vec3 p ) {
  //   //     float f = 0.0;
  //   //     f += 0.5000 * noise( p ); p = m * p * 2.02;
  //   //     f += 0.2500 * noise( p ); p = m * p * 2.03;
  //   //     f += 0.1250 * noise( p ); p = m * p * 2.01;
  //   //     f += 0.0625 * noise( p );
  //   //     return f / 0.9375;
  //   // }
  //   // float fbm6( vec3 p ) {
  //   //     float f = 0.0;
  //   //     f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
  //   //     f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
  //   //     f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
  //   //     f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
  //   //     f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
  //   //     f += 0.015625*(0.5 + 0.5 * noise( p ));
  //   //     return f/0.96875;
  //   // }
  //   // float pattern (vec3 p) {
  //   //   float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
  //   //   return abs(vout);
  //   // }
  //   vec4 mainImage (vec2 uv, vec3 direction, vec3 pos) {
  //     float speed = time / 13.5;
  //     vec3 pp;
  //     pp = vWorldDirection.xyz * 1500.0 + speed * 2.0;
  //     // pp += vPos * 0.25 + speed;
  //     float noise = clamp(cnoise(speed + pp / 550.0 + 0.0 ), 0.0, 1.0);
  //     vec3 colorA = vec3(81.0, 135.0, 228.0) * 0.35 / 255.0;
  //     vec3 colorB = vec3(0.0, 150.0, 136.0) * 0.6 / 255.0;
  //     vec3 colorC = mix(colorA, colorB, noise);
  //     vec4 backgroundColor = vec4(colorC * colorC, 1.0);
  //     gl_FragColor = backgroundColor;
  //     float starNoise1 = (noise) * pow(cnoise(speed + pp * 2.0) * 0.5 + 0.5, 15.5 + sin(time)) * 15.0;
  //     float starNoise2 = (noise) * pow(cnoise(speed + pp * 1.3) * 0.5 + 0.5, 15.5 + sin(time)) * 15.0;
  //     gl_FragColor.rgb += vec3(pow(starNoise1, 1.3) * vec3(10.0, 20.0, 255.0) / 255.0) * 1.0;
  //     gl_FragColor.rgb += vec3(pow(starNoise2, 1.3) * vec3(30.0, 140.0, 255.0) / 255.0) * 1.0;
  //     return gl_FragColor.rgba;
  //     // return vec4(vec3(
  //     //   -0.2 + 1.0 - 1.0 * pow(pattern(direction.xyz + -0.15 * cos(time * 0.1)), 1.25),
  //     //   -0.2 + 1.0 - 1.0 * pow(pattern(direction.xyz +   0.0 * cos(time * 0.1)), 1.25),
  //     //   -0.2 + 1.0 - 1.0 * pow(pattern(direction.xyz +  0.15 * cos(time * 0.1)), 1.25)
  //     // ), 1.0);
  //   }
  // `.trim(),
  //   {
  //     // textureBG: { value: tex },
  //   },
  //   256
  // );
  // let { scene } = useThree();
  // useEffect(() => {
  //   scene.background = new Color("#000");
  //   return () => {
  //     scene.background = null;
  //   };
  // }, []);
  // return (
  //   <group position={[0, 0, 0]}>
  //     <points
  //       rotation={[Math.PI * 0.1, Math.PI * 0.1, 0]}
  //       frustumCulled={false}
  //     >
  //       <sphereBufferGeometry args={[250, 128, 128]}></sphereBufferGeometry>
  //       <Mat></Mat>
  //     </points>
  //   </group>
  // );
}

// function Mat() {
//   let ref = useRef();

//   useEffect(() => {
//     ref.current.uniforms.time = { value: 0 };
//     ref.current.vertexShader = `

//     precision highp float;
//     // varying vec3 vWorldDirection;

//     vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
//     vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
//     vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

//     float cnoise(vec3 P){
//       vec3 Pi0 = floor(P); // Integer part for indexing
//       vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
//       Pi0 = mod(Pi0, 289.0);
//       Pi1 = mod(Pi1, 289.0);
//       vec3 Pf0 = fract(P); // Fractional part for interpolation
//       vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
//       vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
//       vec4 iy = vec4(Pi0.yy, Pi1.yy);
//       vec4 iz0 = Pi0.zzzz;
//       vec4 iz1 = Pi1.zzzz;

//       vec4 ixy = permute(permute(ix) + iy);
//       vec4 ixy0 = permute(ixy + iz0);
//       vec4 ixy1 = permute(ixy + iz1);

//       vec4 gx0 = ixy0 / 7.0;
//       vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
//       gx0 = fract(gx0);
//       vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
//       vec4 sz0 = step(gz0, vec4(0.0));
//       gx0 -= sz0 * (step(0.0, gx0) - 0.5);
//       gy0 -= sz0 * (step(0.0, gy0) - 0.5);

//       vec4 gx1 = ixy1 / 7.0;
//       vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
//       gx1 = fract(gx1);
//       vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
//       vec4 sz1 = step(gz1, vec4(0.0));
//       gx1 -= sz1 * (step(0.0, gx1) - 0.5);
//       gy1 -= sz1 * (step(0.0, gy1) - 0.5);

//       vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
//       vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
//       vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
//       vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
//       vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
//       vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
//       vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
//       vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

//       vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
//       g000 *= norm0.x;
//       g010 *= norm0.y;
//       g100 *= norm0.z;
//       g110 *= norm0.w;
//       vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
//       g001 *= norm1.x;
//       g011 *= norm1.y;
//       g101 *= norm1.z;
//       g111 *= norm1.w;

//       float n000 = dot(g000, Pf0);
//       float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
//       float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
//       float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
//       float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
//       float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
//       float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
//       float n111 = dot(g111, Pf1);

//       vec3 fade_xyz = fade(Pf0);
//       vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
//       vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
//       float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
//       return 2.2 * n_xyz;
//     }

//     mat4 rotation3d(vec3 axis, float angle) {
//       axis = normalize(axis);
//       float s = sin(angle);
//       float c = cos(angle);
//       float oc = 1.0 - c;

//       return mat4(
//         oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
//         oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
//         oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
//         0.0,                                0.0,                                0.0,                                1.0
//       );
//     }

//     uniform float time;

//     #include <common>
//     varying float vRand;

//     // vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
//     //   return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
//     // }

//     void main (void) {
//         vec3 dir = transformDirection( position, modelMatrix );

//         gl_Position = projectionMatrix * modelViewMatrix * rotation3d(vec3(1.0, 0.0, 0.0), 0.5 * 3.14159265) * vec4(vec3(
//           position.x * cnoise(dir.x + 0.1 + position.xxx + time * 0.001),
//           position.y * cnoise(dir.y + 0.2 + position.yyy + time * 0.001),
//           position.z * cnoise(dir.z + 0.3 + position.zzz + time * 0.001)
//         ) * 0.5 + 0.5 * position, 1.0);

//         gl_PointSize = 3.0;

//         vRand = rand(uv);
//     }
//     `;
//     ref.current.fragmentShader = `
//     #include <common>
//     varying float vRand;
//     uniform float time;

//     void main (void) {

//       float center = length(gl_PointCoord.xy - 0.5);
//       float ticker = abs(mod(time * vRand * vRand + vRand, 1.0));
//       if (center < 0.5) {
//         if (vRand <= 0.2) {
//           gl_FragColor = ticker * vec4(vRand * vec3(30.0, 60.0, 255.0) / 255.0, 1.0);
//         } else if (vRand <= 0.4) {
//           gl_FragColor = ticker * vec4(vRand * vec3(30.0, 0.0, 255.0) / 255.0, 1.0);
//         } else {
//           gl_FragColor = ticker * vec4(vRand * vec3(30.0, 150.0, 255.0) / 255.0, 1.0);
//         }
//       } else {
//         discard;
//       }
//     }
//     `;

//     ref.current.userData.enableBloom = true;
//     ref.current.needsUpdate = true;
//   });

//   useFrame((st, dt) => {
//     ref.current.uniforms.time.value += dt;
//   });

//   return <shaderMaterial side={DoubleSide} ref={ref}></shaderMaterial>;
// }
