import { GPUComputationRenderer } from "three-stdlib";
import { InteractionUI } from "./InteractionUI";
import {
  HalfFloatType,
  Vector3,
  Clock,
  Mesh,
  SphereBufferGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  DataUtils,
  DataTexture,
  RGBAFormat,
  UVMapping,
  ClampToEdgeWrapping,
} from "three";
// import { Geometry } from "three/examples/jsm/deprecated/Geometry.js";

export class PhysicsInfluences {
  nearestPow2(aSize) {
    return Math.pow(2, Math.ceil(Math.log(aSize) / Math.log(2)));
  }

  constructor({ array, mini }) {
    this.mini = mini;
    this.array = array;
    let vec4Count = 4;
    let influencerCount = this.nearestPow2(array.length); // this.howManyTrackers

    /** @type {Array} */
    let raw = new Uint16Array(influencerCount * vec4Count * 4);
    let texture = new DataTexture(
      raw,
      vec4Count,
      influencerCount,
      RGBAFormat,
      HalfFloatType
    );

    // 4 data (rgba), * vec4Count
    let ww = 4 * vec4Count;

    let setCommandBuffer = ({ idx, data = {} }) => {
      //
      if (data.type === "computeSphere") {
        let { position, radius, force, noise } = data;

        // influence type
        raw[idx * ww + 0] = DataUtils.toHalfFloat(data.enabled ? 1 : 0);
        raw[idx * ww + 1] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 2] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 3] = DataUtils.toHalfFloat(0);

        // position
        raw[idx * ww + 4] = DataUtils.toHalfFloat(position.x);
        raw[idx * ww + 5] = DataUtils.toHalfFloat(position.y);
        raw[idx * ww + 6] = DataUtils.toHalfFloat(position.z);
        raw[idx * ww + 7] = DataUtils.toHalfFloat(1);

        // radius, force
        raw[idx * ww + 8] = DataUtils.toHalfFloat(radius);
        raw[idx * ww + 9] = DataUtils.toHalfFloat(force);
        raw[idx * ww + 10] = DataUtils.toHalfFloat(noise);
        raw[idx * ww + 11] = DataUtils.toHalfFloat(0);

        // others
        raw[idx * ww + 12] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 13] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 14] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 15] = DataUtils.toHalfFloat(0);
      }

      if (data.type === "computeGravity") {
        let { direction, force } = data;
        // influence type
        raw[idx * ww + 0] = DataUtils.toHalfFloat(data.enabled ? 2 : 0);
        raw[idx * ww + 1] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 2] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 3] = DataUtils.toHalfFloat(0);

        // direction
        raw[idx * ww + 4] = DataUtils.toHalfFloat(direction.x);
        raw[idx * ww + 5] = DataUtils.toHalfFloat(direction.y);
        raw[idx * ww + 6] = DataUtils.toHalfFloat(direction.z);
        raw[idx * ww + 7] = DataUtils.toHalfFloat(1);

        // influeMeta
        raw[idx * ww + 8] = DataUtils.toHalfFloat(force);
        raw[idx * ww + 9] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 10] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 11] = DataUtils.toHalfFloat(0);

        // others
        raw[idx * ww + 12] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 13] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 14] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 15] = DataUtils.toHalfFloat(0);
      }

      if (data.type === "computeAttract") {
        let { position, min, max, force, radius } = data;

        // influence type
        raw[idx * ww + 0] = DataUtils.toHalfFloat(data.enabled ? 3 : 0);
        raw[idx * ww + 1] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 2] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 3] = DataUtils.toHalfFloat(0);

        // position
        raw[idx * ww + 4] = DataUtils.toHalfFloat(position.x);
        raw[idx * ww + 5] = DataUtils.toHalfFloat(position.y);
        raw[idx * ww + 6] = DataUtils.toHalfFloat(position.z);
        raw[idx * ww + 7] = DataUtils.toHalfFloat(1);

        // radius, force
        raw[idx * ww + 8] = DataUtils.toHalfFloat(force);
        raw[idx * ww + 9] = DataUtils.toHalfFloat(min);
        raw[idx * ww + 10] = DataUtils.toHalfFloat(max);
        raw[idx * ww + 11] = DataUtils.toHalfFloat(radius);

        // others
        raw[idx * ww + 12] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 13] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 14] = DataUtils.toHalfFloat(0);
        raw[idx * ww + 15] = DataUtils.toHalfFloat(0);
      }

      texture.needsUpdate = true;
    };

    let textureName = `influenceTexture`;

    let lw = vec4Count.toFixed(1);

    let callerCode = `
        computeAllInfluence(position, velocity);
    `;
    let headerCode = `
        uniform sampler2D ${textureName};

        void computeSphere (float index, inout vec3 position, inout vec3 velocity) {
          float uv_Y = index / ${influencerCount.toFixed(1)};

          vec4 influPos = texture2D(${textureName}, vec2((1.0) / ${lw}, uv_Y));
          vec4 influMeta = texture2D(${textureName}, vec2((2.0) / ${lw}, uv_Y));

          vec3 influPosition = influPos.xyz;

          float radius = influMeta.x;
          float force = influMeta.y;
          float noiseV = influMeta.z;

          vec3 dif = (influPosition) - position.xyz;

          float len = length( dif );

          if( len <= radius){
            velocity += -normalize(dif) * force / len;
            if (noiseV != 0.0) {
              velocity += cnoise(velocity.xyz) * noiseV;
            }
          } else {
            velocity += normalize(dif) * force / len;

          }
        }

        void computeAttract (float index, inout vec3 position, inout vec3 velocity) {
          float uv_Y = index / ${influencerCount.toFixed(1)};

          vec4 influPos = texture2D(${textureName}, vec2((1.0) / ${lw}, uv_Y));
          vec4 influMeta = texture2D(${textureName}, vec2((2.0) / ${lw}, uv_Y));

          vec3 influPosition = influPos.xyz;
          float force = influMeta.x;
          float minV = influMeta.y;
          float maxV = influMeta.z;
          float radius = influMeta.w;

          vec3 dif = (influPosition) - position.xyz;
          float len = length( dif );

          float forceFilter = force;

          // if (forceFilter >= maxV) {
          //   forceFilter = maxV;
          // }
          // if (forceFilter <= minV) {
          //   forceFilter = minV;
          // }

          // if( len <= radius){
          //   velocity += normalize(dif) * force;
          // } else {
          //   velocity += normalize(dif) * force;
          // }

          // velocity += vec3(rotationX(force) * vec4(position, 1.0));
          // velocity += vec3(rotationY(force) * vec4(position, 1.0));
          // velocity += vec3(rotationZ(force) * vec4(position, 1.0));
        }

        void computeGravity (float index, inout vec3 position, inout vec3 velocity) {
          float uv_Y = index / ${influencerCount.toFixed(1)};

          vec4 groupIDX1 = texture2D(${textureName}, vec2((1.0) / ${lw}, uv_Y));
          vec4 influMeta = texture2D(${textureName}, vec2((2.0) / ${lw}, uv_Y));

          vec3 influDirecttion = groupIDX1.xyz;
          float force = influMeta.x;

          velocity += vec3(influDirecttion) * force;

        }

        void computeAllInfluence (inout vec3 position, inout vec3 velocity) {
          for (int ii = 0; ii < ${influencerCount.toFixed(0)}; ii++) {
            float index = float(ii);

            float uv_Y = index / ${influencerCount.toFixed(1)};
            vec4 typeInfo = texture2D(${textureName}, vec2((0.5) / ${lw}, uv_Y));
            float influenceType = typeInfo.x;

            if (influenceType == 1.0) {
              computeSphere(index, position, velocity);
            }
            if (influenceType == 2.0) {
              computeGravity(index, position, velocity);
            }
            if (influenceType == 3.0) {
              computeAttract(index, position, velocity);
            }
          }
        }
      `;

    for (let idx = 0; idx < influencerCount; idx++) {
      let data = array[idx];
      if (data) {
        setCommandBuffer({ idx, data });
      }
    }

    this.destroy = () => {
      this.diposed = true;
      texture.dispose();
    };

    this.mini.onLoop(() => {
      if (this.diposed) {
        return;
      }
      for (let idx = 0; idx < influencerCount; idx++) {
        let data = array[idx];
        if (data && data.needsUpdate) {
          data.needsUpdate = false;
          setCommandBuffer({ idx, data });
        }
      }
    });

    this.textureName = textureName;
    this.texture = texture;
    this.headerCode = headerCode;
    this.callerCode = callerCode;
  }

  // example() {
  //   // velocity += vec3(  0.0 , -1.0 ,0. );
  //   let influences = [
  //     {
  //       type: "gravity",
  //       direction: { x: 0, y: -1, z: 0 },
  //       force: 1,
  //     },
  //     {
  //       type: `sphere-static`,
  //       position: { x: 0, y: 0, z: 0 },
  //       force: 1,
  //       radius: 1,
  //     },
  //   ];

  //   let influ = new PhysicsInfluences({ array: influences });

  //   console.log(influ);
  // }
}

export let DefaultInfluence = [
  {
    type: `sphere-static`,
    position: { x: 0, y: 0, z: 0 },
    radius: 1,
    force: 1,
  },
  {
    type: `gravity`,
    direction: { x: 0, y: -1, z: 0 },
    force: 1,
  },
];

export class PositionSimulation {
  constructor({
    mini,
    howManyTracker,
    influences = DefaultInfluence,
    renderer,
    cursorPointer,
  }) {
    this.influences = influences;
    this.mini = mini;
    this.width = 1;
    this.howManyTracker = howManyTracker;
    this.height = howManyTracker;
    this.renderer = renderer;
    this.clock = new Clock();
    this.tick = 0;

    this.influ = new PhysicsInfluences({ array: this.influences, mini });
    let lastLengthInflu = this.influences.length;

    this.mini.onLoop(() => {
      if (this.influences.length !== lastLengthInflu) {
        this.influ.destroy();
        this.influ = new PhysicsInfluences({ array: this.influences, mini });
      }
      lastLengthInflu = this.influences.length;
    });

    this.cursorPointer = cursorPointer || new Vector3();
    this.setup();
  }

  setup() {
    // let renderer = await this.mini.ready.gl;
    this.gpu = new GPUComputationRenderer(
      this.width,
      this.height,
      this.renderer
    );

    let gpu = this.gpu;

    gpu.setDataType(HalfFloatType);

    this.commonProvision = `
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec4 tmpPos = texture2D( texturePosition, uv );
      vec4 tmpVel = texture2D( textureVelocity, uv );

      vec3 position = tmpPos.xyz;
      vec3 velocity = tmpVel.xyz;

      float phasePos = tmpPos.w;
      float phaseVel = tmpVel.w;
    `;

    this.commonHeaders = () => {
      return `
        uniform float time;
        uniform float delta;
        uniform vec3 cursorPointer;
        #include <common>

        bool detectReset (vec3 position) {
          return length(position) >= 30.0;

          // return mod(time, 20.0) < 0.01;
        }
      `;
    };

    this.markToReset = (type) => {
      if (type === "velocity") {
        return `
          if (detectReset(position)) {
            phaseVel = 0.0;
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
      if (type === "velocity") {
        return `
        if (phaseVel == 0.0) {
          velocity = vec3(0.0);
          phaseVel = 1.0;
        }
        `;
      } else if (type === "position") {
        return `
          if (phasePos == 0.0) {
            position = 10.0 * vec3(
              -0.5 + rand(uv + 0.1 + position.x),
              -0.5 + rand(uv + 0.2 + position.y),
              -0.5 + rand(uv + 0.3 + position.z)
            );

            position.y += 2.0;
            phasePos = 1.0;
          }
          `;
      }
    };

    this.finalOutput = (type) => {
      if (type === "velocity") {
        return `
          ${this.birthPlace("velocity")}

          // velocity = getDiff(position + velocity, cursorPointer) * 3.0;

          ${this.markToReset("velocity")}
          gl_FragColor = vec4(velocity.xyz, phaseVel);
        `;
      } else if (type === "position") {
        return `
          ${this.birthPlace("position")}

          ${this.influ.callerCode}

          ${this.markToReset("position")}
          gl_FragColor = vec4(position + velocity * delta, phasePos);
        `;
      }
    };

    this.fragmentShaderVel = () => `
      ${this.commonHeaders()}
      ${this.glslFunctions()}

      ${this.influ.headerCode}
      void main ()	{
        ${this.commonProvision}
        ${this.finalOutput("velocity")}
      }
    `;

    this.fragmentShaderPos = () => `
      ${this.commonHeaders()}
      ${this.glslFunctions()}

      ${this.influ.headerCode}

      void main ()	{
        ${this.commonProvision}
        ${this.finalOutput("position")}
      }

    `;

    // Create initial state float textures
    var pos0 = gpu.createTexture();
    var vel0 = gpu.createTexture();

    // and fill in here the texture data...
    // Add texture variables
    var velVar = gpu.addVariable(
      "textureVelocity",
      this.fragmentShaderVel(),
      pos0
    );

    var posVar = gpu.addVariable(
      "texturePosition",
      this.fragmentShaderPos(),
      vel0
    );

    // Add variable dependencies
    gpu.setVariableDependencies(velVar, [velVar, posVar]);
    gpu.setVariableDependencies(posVar, [velVar, posVar]);

    // Add custom uniforms
    velVar.material.uniforms.time = { value: 0.0 };
    posVar.material.uniforms.time = { value: 0.0 };

    velVar.material.uniforms.delta = { value: 1 / 60 };
    posVar.material.uniforms.delta = { value: 1 / 60 };

    let vm = this;
    posVar.material.uniforms[this.influ.textureName] = {
      get value() {
        return vm.influ.texture;
      },
    };
    velVar.material.uniforms[this.influ.textureName] = {
      get value() {
        return vm.influ.texture;
      },
    };

    velVar.material.uniforms.cursorPointer = { value: this.cursorPointer };
    posVar.material.uniforms.cursorPointer = { value: this.cursorPointer };
    // Check for completeness
    var error = gpu.init();
    if (error !== null) {
      console.error(error);
    }
    // In each frame...
    // Compute!

    this.position = posVar;
    this.velocity = velVar;

    setTimeout(() => {
      posVar.material = gpu.createShaderMaterial(
        `uniform sampler2D texturePosition;
        uniform sampler2D textureVelocity;
        ${this.fragmentShaderPos()}`,
        posVar.material.uniforms
      );
    }, 3000);

    this.sync = () => {
      if (this.cursorPointer) {
        posVar.material.uniforms.cursorPointer.value = this.cursorPointer;
        velVar.material.uniforms.cursorPointer.value = this.cursorPointer;
      }
      posVar.material.uniforms.time.value += 1 / 60;
      velVar.material.uniforms.time.value += 1 / 60;
    };
  }

  compute() {
    this.sync();
    this.gpu.compute();
  }

  getPosition() {
    return this.gpu.getAlternateRenderTarget(this.position).texture;
  }
  getVelocity() {
    return this.gpu.getCurrentRenderTarget(this.velocity).texture;
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
        v.y += p.x;

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
