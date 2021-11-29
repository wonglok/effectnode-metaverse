import {
  BufferAttribute,
  BufferGeometry,
  Color,
  FrontSide,
  ShaderMaterial,
  Points,
  DoubleSide,
} from "three";
import { FieldCompute } from "./FieldCompute";

export class FieldRendering {
  /** @param {{ fc: FieldCompute }} */
  constructor({ count = 128, base = 128, progress }) {
    this.count = count;
    this.base = base;
    this.progress = progress;

    let iGeo = new BufferGeometry();
    let arr3 = [];
    let tt = this.count * this.base;
    for (let i = 0; i < tt; i++) {
      arr3.push(0.0, 0.0, 0.0);
    }

    iGeo.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(arr3), 3)
    );

    let arr = [];
    for (let b = 0; b < this.base; b++) {
      for (let i = 0; i < this.count; i++) {
        arr.push(i / this.count, b / this.base);
      }
    }

    iGeo.setAttribute("myUV", new BufferAttribute(new Float32Array(arr), 2));

    //
    this.uniforms = {
      time: { value: 0 },
      progress: this.progress,
      opacity: { value: 1.0 * 0.4 },
      tCube: { value: null },
      mRefractionRatio: { value: 1.02 },
      mFresnelBias: { value: 0.1 },
      mFresnelPower: { value: 0.7 },
      mFresnelScale: { value: 0.6 },
      positionTexture: { value: null },
      // colorTexture: colorUniform,
      // colorA: { value: new Color("#FBC02E") },
      // colorB: { value: new Color("#C59231") },
      // colorC: { value: new Color("#DBA32B") },
      // colorD: { value: new Color("#ECB42E") },

      colorA: { value: new Color("#fe5000") },
      colorB: { value: new Color("#fe5000") },
      colorC: { value: new Color("#fd652d") },
      colorD: { value: new Color("#fd652d") },
    };
    //
    let shaderMat = new ShaderMaterial({
      //
      transparent: true,
      uniforms: this.uniforms,
      vertexShader: `
        // mat4 rotationMatrix(vec3 axis, float angle) {
        //     axis = normalize(axis);
        //     float s = sin(angle);
        //     float c = cos(angle);
        //     float oc = 1.0 - c;

        //     return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
        //                 oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
        //                 oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
        //                 0.0,                                0.0,                                0.0,                                1.0);
        // }

        mat4 rotationX( in float angle ) {
          return mat4(	1.0,		0,			0,			0,
                  0, 	cos(angle),	-sin(angle),		0,
                  0, 	sin(angle),	 cos(angle),		0,
                  0, 			0,			  0, 		1);
        }

        mat4 rotationY( in float angle ) {
          return mat4(	cos(angle),		0,		sin(angle),	0,
                      0,		1.0,			 0,	0,
                  -sin(angle),	0,		cos(angle),	0,
                      0, 		0,				0,	1);
        }

        mat4 rotationZ( in float angle ) {
          return mat4(	cos(angle),		-sin(angle),	0,	0,
                  sin(angle),		cos(angle),		0,	0,
                      0,				0,		1,	0,
                      0,				0,		0,	1);
        }

        mat4 translate(float x, float y, float z){
          return mat4(
              vec4(1.0, 0.0, 0.0, 0.0),
              vec4(0.0, 1.0, 0.0, 0.0),
              vec4(0.0, 0.0, 1.0, 0.0),
              vec4(x,   y,   z,   1.0)
          );
      }

        attribute vec2 myUV;
        varying vec2 vUv;
        uniform sampler2D positionTexture;
        uniform float progress;

        // uniform sampler2D colorTexture;

        uniform float mRefractionRatio;
        uniform float mFresnelBias;
        uniform float mFresnelScale;
        uniform float mFresnelPower;

        // varying vec3 vReflect;
        // varying vec3 vRefract[3];
        // varying float vReflectionFactor;

        varying vec4 vPos;
        varying vec3 vNormal;



      //	Classic Perlin 3D Noise
      //	by Stefan Gustavson
      //
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

      float cnoise(vec3 P){
        vec3 Pi0 = floor(P); // Integer part for indexing
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod(Pi0, 289.0);
        Pi1 = mod(Pi1, 289.0);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 / 7.0;
        vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 / 7.0;
        vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
        return 2.2 * n_xyz;
      }


        void main (void) {
          vUv = myUV;
          vec4 pos = texture2D(positionTexture, myUV);

          // vec4 col = texture2D(colorTexture, myUV);
          vPos = pos;
          vNormal = normalize(pos.xyz);

          // vec4 funPos = translate(pos.x, pos.y, pos.z) * vec4(position.xyz, 1.0);
          vec4 funPos = vec4(pos.xyz, 1.0);

          vec4 mvPosition = modelViewMatrix * funPos;
          vec4 worldPosition = modelMatrix * vec4( funPos.xyz, 1.0 );

          // vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

          // vec3 I = worldPosition.xyz - cameraPosition;

          // vReflect = reflect( I, worldNormal );
          // vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
          // vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
          // vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
          // vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );


          gl_Position = projectionMatrix * mvPosition;

          gl_PointSize = 1.0;// + 0.3;
          //  + dot(vNormal, pos.xyz);
          // if (gl_PointSize >= 1.0) {
          //   gl_PointSize = 1.0;
          // }


        }
      `,
      fragmentShader: `
      uniform samplerCube tCube;
      varying vec2 vUv;

      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform vec3 colorC;
      uniform vec3 colorD;
      // uniform sampler2D colorTexture;
      uniform sampler2D positionTexture;
      uniform float opacity;
      uniform float time;
      uniform float progress;

      varying vec4 vPos;
      varying vec3 vNormal;

      // varying vec3 vReflect;
      // varying vec3 vRefract[3];
      // varying float vReflectionFactor;

      #include <common>

      void main (void) {
        gl_FragColor = vec4(mix(colorA, colorD, progress), opacity);

        // if (length(gl_PointCoord.xy - 0.5) < 0.5) {
        // // vec4 col = texture2D(positionTexture, vUv);

        //   vec4 col = vPos;

        //   float rUV = rand(vUv);
        //   if (rUV >= 0.75) {
        //     float rrr = mod(time * 5.0 + sin(col.x * 1.0) + rand(vUv + 0.1), 1.0);
        //     gl_FragColor = vec4(0.1 + colorA * rrr, rrr * opacity);
        //   } else if (rUV >= 0.5) {
        //     float rrr = mod(time * 5.0 + sin(col.y * 1.0) + rand(vUv + 0.2), 1.0);
        //     gl_FragColor = vec4(0.1 + colorB * rrr, rrr * opacity);
        //   } else if (rUV >= 0.25) {
        //     float rrr = mod(time * 5.0 + sin(col.z * 1.0) + rand(vUv + 0.3), 1.0);
        //     gl_FragColor = vec4(0.1 + colorC * rrr, rrr * opacity);
        //   } else {
        //     float rrr = mod(time * 5.0 + sin(col.w * 1.0) + rand(vUv + 0.4), 1.0);
        //     gl_FragColor = vec4(0.1 + colorD * rrr, rrr * opacity);
        //   }
        // } else {
        //   discard;
        // }

        // vec3 tRefract0 = vRefract[0];
        // vec3 tRefract1 = vRefract[1];
        // vec3 tRefract2 = vRefract[2];

        // vec4 reflectedColor = textureCube( tCube, vec3( vReflect.x, vReflect.y, vReflect.z ) );
        // vec4 refractedColor = vec4(1.0);

        // refractedColor.r = textureCube( tCube, vec3( tRefract0.x, tRefract0.yz ) ).r;
        // refractedColor.g = textureCube( tCube, vec3( tRefract1.x, tRefract1.yz ) ).g;
        // refractedColor.b = textureCube( tCube, vec3( tRefract2.x, tRefract2.yz ) ).b;

        // vec4 col = texture2D(colorTexture, vUv);

        // gl_FragColor = abs(normalize(col)).rgba * 0.0 + mix( reflectedColor, refractedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
        // gl_FragColor.a = 1.0;

        // gl_FragColor = vec4(abs(col.rgb), 1.0);
        // } else {
        //   discard;
        // }


      }
      `,
      side: DoubleSide,
      // blending: AdditiveBlending,
    });

    let pts = new Points(iGeo, shaderMat);
    pts.frustumCulled = false;

    this.compute = () => {
      shaderMat.uniforms.time.value = window.performance.now() / 1000;
    };

    this.renderable = pts;

    // let slider = document.createElement("input");
    // slider.value = this.uniforms.opacity.value;
    // slider.type = "range";
    // slider.step = 0.01;
    // slider.min = 0.0;
    // slider.max = 1.0;

    // slider.style.cssText = `
    //   position: absolute;
    //   top: 0px;
    //   right: 0px;
    // `;
    // window.document.body.append(slider);
    // slider.addEventListener("input", ({ target: value }) => {
    //   this.uniforms.opacity.value = Number(value);
    // });
  }
}
