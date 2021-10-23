import { GPUComputationRenderer } from "three-stdlib";
import { HalfFloatType, Vector3, Clock } from "three";
import { InteractionUI } from "./InteractionUI";
// import { Geometry } from "three/examples/jsm/deprecated/Geometry.js";

export class PositionSimulation {
  constructor({ mini, howManyTracker, renderer }) {
    this.mini = mini;
    this.width = 1;
    this.height = howManyTracker;
    this.renderer = renderer;
    this.clock = new Clock();
    this.tick = 0;
    //
    //

    this.setup();

    InteractionUI.hoverPlane({ mini }).then((v3) => {
      this.cursorPointer = v3;
    });
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

    let commonProvision = `
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec4 tmpPos = texture2D( texturePosition, uv );
      vec4 tmpVel = texture2D( textureVelocity, uv );

      vec3 position = tmpPos.xyz;
      vec3 velocity = tmpVel.xyz;

      float phasePos = tmpPos.w;
      float phaseVel = tmpVel.w;
    `;

    let commonHeaders = () => {
      return `
        bool detectReset (vec3 position) {
          // return length(position) >= 10.0;

          return mod(time, 15.0) < 0.1;
        }
      `;
    };

    let markToReset = (type) => {
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

    let birthPlace = (type) => {
      if (type === "velocity") {
        return `
        if (phaseVel == 0.0) {
          velocity = vec3(
            -0.5 + rand(uv + 0.0 + velocity.x),
            -0.5 + rand(uv + 0.2 + velocity.y),
            -0.5 + rand(uv + 0.3 + velocity.z)
          );
          phaseVel = 1.0;
        }
        `;
      } else if (type === "position") {
        return `
          if (phasePos == 0.0) {
            position = 0.1 * vec3(
              -0.5 + rand(uv + 0.1 + position.x),
              -0.5 + rand(uv + 0.2 + position.y),
              -0.5 + rand(uv + 0.3 + position.z)
            );
            phasePos = 1.0;
          }
          `;
      }
    };

    let finalOutput = (type) => {
      if (type === "velocity") {
        return `

          ${birthPlace("velocity")}
          ${markToReset("velocity")}

          gl_FragColor = vec4(velocity.xyz, phaseVel);
        `;
      } else if (type === "position") {
        return `
        velocity += galaxy(position + velocity);

          ${birthPlace("position")}
          ${markToReset("position")}
          gl_FragColor = vec4(position + velocity * delta, phasePos);
        `;
      }
    };

    let fragmentShaderVel = `
      uniform float time;
      uniform float delta;
      uniform vec3 cursorPointer;
      #include <common>
      ${this.glslFunctions()}
      ${commonHeaders()}
      void main ()	{
        ${commonProvision}
        ${finalOutput("velocity")}
      }
    `;

    let fragmentShaderPos = `
      uniform float time;
      uniform float delta;
      uniform vec3 cursorPointer;
      #include <common>
      ${this.glslFunctions()}
      ${commonHeaders()}
      void main ()	{
        ${commonProvision}
        ${finalOutput("position")}
      }

    `;

    // Create initial state float textures
    var pos0 = gpu.createTexture();
    var vel0 = gpu.createTexture();

    // let idx = 0;
    // let data = vel0.image.data;
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 0; x < this.width; x++) {
    //     data[idx * 4 + 0] = Math.random() - 0.5;
    //     data[idx * 4 + 1] = Math.random() - 0.5;
    //     data[idx * 4 + 2] = Math.random() - 0.5;
    //     data[idx * 4 + 3] = 0.0;
    //     idx++;
    //   }
    // }

    // and fill in here the texture data...
    // Add texture variables
    var velVar = gpu.addVariable("textureVelocity", fragmentShaderVel, pos0);
    var posVar = gpu.addVariable("texturePosition", fragmentShaderPos, vel0);
    // Add variable dependencies
    gpu.setVariableDependencies(velVar, [velVar, posVar]);
    gpu.setVariableDependencies(posVar, [velVar, posVar]);
    // Add custom uniforms
    velVar.material.uniforms.time = { value: 0.0 };
    posVar.material.uniforms.time = { value: 0.0 };

    velVar.material.uniforms.delta = { value: 1 / 60 };
    posVar.material.uniforms.delta = { value: 1 / 60 };

    velVar.material.uniforms.cursorPointer = { value: new Vector3() };
    posVar.material.uniforms.cursorPointer = { value: new Vector3() };
    // Check for completeness
    var error = gpu.init();
    if (error !== null) {
      console.error(error);
    }
    // In each frame...
    // Compute!

    this.position = posVar;
    this.velocity = velVar;

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


    `;
  }
}
