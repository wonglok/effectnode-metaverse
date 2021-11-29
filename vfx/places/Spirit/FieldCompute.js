import {
  HalfFloatType,
  Mesh,
  MeshNormalMaterial,
  SphereBufferGeometry,
  Vector3,
  Object3D,
  FloatType,
} from "three";
import { GPUComputationRenderer } from "three-stdlib";

export class FieldCompute {
  constructor({
    init = [],
    gl,
    camera = new Object3D(),
    virtualHand = new Object3D(),
    base = 1,
    count = 2048,
    progress,
  }) {
    //
    this.progress = progress;
    this.initPosition = null;
    this.camera = camera;
    this.init = init;
    this.virtualHand = virtualHand;
    this.gl = gl;
    this.influencerRadius = 1;

    this.height = base;
    this.width = count;
    this.pointer3d = new Vector3();
    this.prepareShaders();
    this.compute = () => {};
    this.getPositionTex = () => null;
    this.getColorTex = () => null;

    this.getPositionRTT = () => {
      return null;
    };
    this.getColorRTT = () => {
      return null;
    };

    this.setup();
  }

  setup() {
    let gl = this.gl;
    let virtualHand = this.virtualHand;

    let gpu = new GPUComputationRenderer(this.width, this.height, gl);
    // gpu.setDataType(FloatType);
    gpu.setDataType(HalfFloatType);

    var pos0 = gpu.createTexture();

    this.init.forEach((v, i) => {
      pos0.image.data[i] = v;
    });

    // var color0 = gpu.createTexture();

    // and fill in here the texture data...
    // Add texture variables
    // var colorVar = gpu.addVariable(
    //   "textureColor",
    //   this.fragmentShaderColor(),
    //   pos0
    // );
    var posVar = gpu.addVariable(
      "texturePosition",
      this.fragmentShaderPos(),
      pos0
    );

    // Add variable dependencies
    // gpu.setVariableDependencies(colorVar, [colorVar, posVar]);
    // colorVar,
    gpu.setVariableDependencies(posVar, [posVar]);
    gpu.init();

    // Add custom uniforms
    // colorVar.material.uniforms.time = { value: 0.0 };
    posVar.material.uniforms.time = { value: 0.0 };

    // colorVar.material.uniforms.delta = { value: 1 / 60 };
    posVar.material.uniforms.delta = { value: 1 / 60 };

    // colorVar.material.uniforms.pointer3d = {
    //   value: this.pointer3d,
    // };
    posVar.material.uniforms.pointer3d = {
      value: this.pointer3d,
    };

    // colorVar.material.uniforms.cameraLocation = { value: camera.position };
    posVar.material.uniforms.cameraLocation = { value: this.camera.position };

    posVar.material.uniforms.initPosition = { value: null };
    setInterval(() => {
      posVar.material.uniforms.initPosition.value = this.initPosition || null;
    }, 0);
    // initPosition

    posVar.material.uniforms.resultLevel = { value: 1 };
    posVar.material.uniforms.progress = this.progress;

    this.position = posVar;

    // window.addEventListener("magnet", ({ detail: { type, percentage } }) => {
    //   posVar.material.uniforms.resultLevel.value = percentage;
    // });

    // this.color = colorVar;

    // let vt3 = new Vector3();
    // vt3.copy(this.pointer3d);
    this.compute = () => {
      // this.pointer3d.lerp(vt3, 0.1);

      posVar.material.uniforms.time.value += 1 / 60;
      // colorVar.material.uniforms.time.value += 1 / 60;
      gpu.compute();
    };

    this.getPositionRTT = () => {
      return gpu.getCurrentRenderTarget(posVar);
    };
    this.getColorRTT = () => {
      return null;
      // return gpu.getCurrentRenderTarget(colorVar).texture;
    };

    this.getPositionTex = () => {
      return gpu.getCurrentRenderTarget(posVar).texture;
    };
    this.getColorTex = () => {
      return null;
      // return gpu.getCurrentRenderTarget(colorVar).texture;
    };
    //
  }

  prepareShaders() {
    this.commonProvision = `
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec4 tmpPos = texture2D( texturePosition, uv );
      // vec4 tmpColor = texture2D( textureColor, uv );

      vec3 position = tmpPos.xyz;
      // vec3 color = tmpColor.xyz;

      float phasePos = tmpPos.w;
      // float phaseColor = tmpColor.w;
    `;
    this.commonHeaders = () => {
      return `
        uniform float time;
        uniform float delta;
        uniform float progress;
        uniform vec3 pointer3d;
        uniform vec3 cameraLocation;
        uniform sampler2D initPosition;
        uniform float resultLevel;
        #include <common>

        bool detectReset (vec3 position) {

          vec2 uv = gl_FragCoord.xy / resolution.xy;

          // vec4 initPos = texture2D(initPosition, uv);
          // length(position - initPos.xyz) >= 4.0 ||

          return rand(uv + time) < 0.1;

          // return position.y <= 0.0;
          // return mod(time, 20.0) < 0.01;
        }
      `;
    };

    this.markToReset = (type) => {
      if (type === "color") {
        return `
          if (detectReset(position)) {
            phaseColor = 0.0;
          }
        `;
      } else if (type === "position") {
        return `
          if (detectReset(position)) {
            phasePos = 0.0;
          }
        `;
      }
    };

    this.birthPlace = (type) => {
      if (type === "color") {
        return `
        if (phaseColor == 0.0) {
          color = vec3(0.0);
          phaseColor = 1.0;
        }
        `;
      } else if (type === "position") {
        return `
          if (phasePos == 0.0) {

            vec4 initPos = texture2D(initPosition, uv);
            // float varyv  = (initPos.y / 5.);

            float varyv = cnoise(initPos.xyz * 3.0);
            bool canDis = varyv <= (progress);
            if (canDis) {
              position.xyz = initPos.xyz;
            } else {
              position.xyz = initPos.xyz;
            }

            phasePos = 10.0;
          }
          `;
      }
    };

    this.finalOutput = (type) => {
      if (type === "color") {
        return `
          ${this.birthPlace("color")}
          // color = getDiff(position + color, pointer3d) * 3.0;

          // color.xyz = 1.0 / vec3(length(position - pointer3d));

          vec3 dif = (pointer3d) - (position.xyz + color);
          float len = length( dif );
          vec3 vel = normalize(dif) * 1.0 / len;

          float avgv = (vel.x + vel.y + vel.z) / 3.0;
          color.xyz = vel;

          ${this.markToReset("color")}
          gl_FragColor = vec4(color.xyz, phaseColor);
        `;
      } else if (type === "position") {
        return /* glsl */ `
          // ${this.birthPlace("position")}


          // vec4 posOut = vec4(position.xyz, 1.0);

          // vec3 velocity = vec3(0.0);
          // // velocity.y += -0.5; //+ -0.5 * rand(uv);
          // // velocity.y *= 5.5;

          // float radius = ${this.influencerRadius.toFixed(3)};
          // vec3 dif = (pointer3d) - position.xyz;
          // float len = length( dif );

          // velocity.xyz += cnoise(posOut.xyz + time * 3.0) * 1.0;
          // velocity += getDiff(position, pointer3d) * 40.0;

          // posOut *= rotationY(position.y * (0.00315));

          // if (len <= radius) {
          //   // velocity.xyz = -normalize(dif) * len * (1.0 + resultLevel * 1.0);
          //   // velocity.xyz += cnoise(position.xyz + time) * 17.0;
          //   // posOut *= rotationY(position.y * (0.00315));

          //   // posOut *= rotationX(position.y * 0.015);
          //   // posOut *= rotationZ(position.y * 0.015);

          //   velocity.xyz = normalize(dif) * len * (1.0 + resultLevel * 1.0);
          // } else {
          // }

          // vec4 initPos = texture2D(initPosition, uv);

          // velocity.xyz += cnoise(position.xyz * 10.0) * 3.0 * (1.0 - progress);

          // velocity.xyz += vec3(0,-3.0 * position.y - initPos.y, 0.0) * (1.0 - progress);

          // velocity.xyz += normalize(dif) * (-0.6) * (1.0 - progress); // len *

          // velocity.xyz += position * galaxy(position * 3.0 + pointer3d) * 1.0 *  (1.0 - progress);


          // vec3 dif2 = (cameraLocation) - position.xyz;
          // float len2 = length( dif2 );

          // posOut *= rotationX(color.x * 0.01);
          // posOut *= rotationY(position.y * 0.035 * 0.4);

          // posOut *= rotationY(position.y * 0.0015);


          // vec4 initPos = texture2D(initPosition, uv);
          // float varyv  = 1.0 -  (cnoise(initPos.xyz) * 0.5 + 0.5);


          vec3 velocity = vec3(0.0);
          vec4 initPos = texture2D(initPosition, uv);
          // float varyv  = (initPos.y / 5.);

          // float varyv  = cnoise(initPos.xyz) * 0.5 + 0.5;
          float varyv = cnoise(initPos.xyz) * 0.5 + 0.5;
          float iProgress = 1.0 - progress;

          if (varyv <= progress && false) {
            ${this.birthPlace("position")}

            ${this.markToReset("position")}
          } else {
            ${this.birthPlace("position")}

            // vec3 p = position;

            // p.y -= 1.3;
            // // change this to get a new vector field
            // velocity.x = (cos(p.y)+sin(pow(length(p), cos(length(p))))/p.y);
            // velocity.y = sin(min(sin((length(p)-p.x)),p.x));


            // fade in out, shadow flame
            // velocity.xyz += vec3(0.0, (iProgress) * 5.0, 0.0);
            // velocity += funSwirl(position.rgb) * 5.0 * (iProgress);

            // fade out, sand fall down
            // velocity.xyz += vec3(0.0, iProgress * -1.0, 0.0);

            // fade out, Black hole
            // velocity.xyz += 0.1 * ((ballify((position.rgb + vec3(0.0, -2.0, 0.0)) * 4.0, -3.0)) * iProgress + cnoise(sin(time) + pointer3d * 0.2 + 0.3 * position.rgb)) * (30.0 + 20.0 * sin(time)) * iProgress;

            // fadeout, blwon away dune
            velocity.xyz += -0.1 * (galaxy(position.rgb * 4.0) * iProgress + cnoise(sin(time) + pointer3d * 0.2 + 0.3 * position.rgb)) * (30.0 + 20.0 * sin(time)) * iProgress;

            // faed inout, phantom
            velocity.xyz += 0.15 * (boxedSwirl(position.rgb * 5.0) * iProgress + cnoise(sin(time) + pointer3d * 0.2 + 0.3 * position.rgb)) * (1.0 + 1.0 * sin(time)) * iProgress;

            ${this.markToReset("position")}
          }

          // velocity.xyz += boxedSwirl(position) * invertProgress * varyv;

          //

          vec3 outputPos = position.rgb + velocity.xyz * delta;

          gl_FragColor = vec4(outputPos, phasePos);
        `;
      }
    };
  }
  fragmentShaderColor() {
    return /* glsl */ `
    ${this.commonHeaders()}
    ${this.glslFunctions()}

    void main ()	{
      ${this.commonProvision}
      ${this.finalOutput("color")}
    }

      //
      //
      //
      //
    `;
  }

  fragmentShaderPos() {
    return /* glsl */ `
      ${this.commonHeaders()}
      ${this.glslFunctions()}

      void main ()	{
        ${this.commonProvision}
        ${this.finalOutput("position")}
      }

      //
      //
      //
      //
    `;
  }

  glslFunctions() {
    return /* glsl */ `


      // void collisionStaticSphere (inout vec3 particlePos, inout vec3 particleVel, vec3 colliderSpherePosition, float sphereRadius) {
      //   vec3 dif = (colliderSpherePosition) - particlePos.xyz;
      //   if( length( dif ) <= sphereRadius ){
      //     particleVel += -normalize(dif);
      //   }
      // }

      float constrain(float val, float min, float max) {
        if (val < min) {
            return min;
        } else if (val > max) {
            return max;
        } else {
            return val;
        }
      }


      vec3 getDiff (in vec3 lastPos, in vec3 mousePos) {
        vec3 diff = lastPos - mousePos;

        float distance = constrain(length(diff), 30.0, 150.0);

        // v is extra speed
        float strength = 3.0 * 1.0 / pow(distance, 2.0);

        diff = normalize(diff);
        diff = diff * pow(strength, 1.0) * -2.0;

        // extra strength
        diff *= 10.0;

        return diff;
      }


      vec3 multiverse (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        // many lines of multiverse
        p.xy *= 10.0;
        p.x += 11.0;
        v.x = cos((max(p.x, p.y) - min(length(p), p.y)));
        v.y = cos(max((p.y - cos(length(p))),p.x)) * cos((p.x - p.x));
        v.xy *= 1.0;

        return v;
      }

      vec3 galaxy (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        // galaxy
        v.x += p.y;
        v.y += sin(sin((min(exp(length(p)),p.y)-p.x)));

        return v;
      }

      vec3 circle (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        // circle
        v.x += -p.y;
        v.z += p.z;

        return v;
      }


      vec3 river (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        // river
        v.x += sin(length(p));
        v.y += cos((length(p)-p.x*p.y));

        return v;
      }


      vec3 squares (vec3 pp) {
        vec3 p = vec3(pp * 2.7);
        vec3 v = vec3(0.0);

        v.x = p.y;
        v.y = p.x/length(p)/max(p.y,sin(length(p)));

        return v;
      }


      vec3 funSwirl (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        p *= 3.5;
        p.y += 1.5;
        p.x *= 2.5;
        v.x += cos(p.x + 2.0 * p.y);
        v.y += sin(p.x - 2.0 * p.y);
        v.xy *= 0.5;

        return v;
      }


      vec3 stoneFlow (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        // flow to a stone
        p *= 2.0 * 2.0 * 3.1415;
        v.x = p.y - length(p);
        v.y = length(p);
        v.xy *= 1.0;

        return v;
      }

      vec3 jade (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        p.xy *= 10.0;
        v.x = sin(min(p.y,length(p)));
        v.y = (sin(p.y)-p.x);
        v.xy *= 1.0;


        return v;
      }

      vec3 converge (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        p.xy *= 2.0;
        p.y += 1.0;
        v.x = length(p);
        v.y = cos(p.y);
        v.xy *= 1.0;

        return v;
      }

      vec3 boxedSwirl (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        p.xyz *= 3.1415 * 2.0 * 1.5;
        v.x = sin(sin(time) + p.y);
        v.y = cos(sin(time) + p.x);
        v.z = cos(sin(time) + p.z);

        v.xyz *= 1.0;

        return v;
      }

      vec3 passWave (vec3 pp) {
        vec3 p = vec3(pp);
        vec3 v = vec3(0.0);

        p.xy *= 2.0 * 3.1415;
        p.x += 4.0;
        v.x = max(sin(p.x),p.x)/p.x;
        v.y = (min(exp(cos(length(p))),sin(p.x))+cos(p.x));

        return v;
      }

      vec3 get_vel (vec3 pp) {
        float timer = mod(time * 0.05, 1.0);
        if (timer < 0.5) {
          return funSwirl(pp) * 0.5;
        } else {
          return funSwirl(pp) * -0.5;
        }
      }

      #define M_PI_3_1415 3.1415926535897932384626433832795

      float atan2(in float y, in float x) {
        bool xgty = (abs(x) > abs(y));
        return mix(M_PI_3_1415 / 2.0 - atan(x,y), atan(y,x), float(xgty));
      }

      vec3 fromBall(float r, float az, float el) {
        return vec3(
          r * cos(el) * cos(az),
          r * cos(el) * sin(az),
          r * sin(el)
        );
      }
      void toBall(vec3 pos, out float az, out float el) {
        az = atan2(pos.y, pos.x);
        el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
      }

      // float az = 0.0;
      // float el = 0.0;
      // vec3 noiser = vec3(lastVel);
      // toBall(noiser, az, el);
      // lastVel.xyz = fromBall(1.0, az, el);

      vec3 ballify (vec3 pos, float r) {
        float az = atan2(pos.y, pos.x);
        float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
        return vec3(
          r * cos(el) * cos(az),
          r * cos(el) * sin(az),
          r * sin(el)
        );
      }

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

      mat4 rotationMatrix (vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;

          return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                      0.0,                                0.0,                                0.0,                                1.0);
      }


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

    `;
  }
}
