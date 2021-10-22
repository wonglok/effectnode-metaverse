import { GPUComputationRenderer } from "three-stdlib";
import {
  HalfFloatType,
  Vector3,
  BufferAttribute,
  CylinderBufferGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Vector2,
  RepeatWrapping,
  ShaderMaterial,
  Mesh,
  DataTexture,
  DataUtils,
  RGBFormat,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  TextureLoader,
  Object3D,
  AdditiveBlending,
  MathUtils,
  Clock,
} from "three";
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
    //

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

    let fragmentShaderVel = `
      uniform float time;
      uniform float delta;


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

        float distance = constrain(length(diff), 30.0, 50.0);

        // v is extra speed
        float strength = 3.0 * 1.0 / pow(distance, 2.0);

        diff = normalize(diff);
        diff = diff * pow(strength, 1.0) * -2.0;

        // extra strength
        diff *= 10.0;

        return diff;
      }

      void main()	{
        vec2 uv = gl_FragCoord.xy / resolution.xy;

        vec4 lastVel = texture2D(textureVelocity, uv);
        vec4 lastPos = texture2D(texturePosition, uv);

        vec3 diff = getDiff( lastPos.xyz, vec3(0.0) );
        lastVel.xyz += diff;


        gl_FragColor = vec4(lastVel.xyz, 1.0);
      }

    `;

    let fragmentShaderPos = `
      uniform float time;
      uniform float delta;

      #include <common>
      void main()	{
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 tmpPos = texture2D( texturePosition, uv );

        vec3 position = tmpPos.xyz;
        vec3 velocity = texture2D( textureVelocity, uv ).xyz;

        float phase = tmpPos.w;

        if (phase == 0.0) {
          position = vec3(
            0.5 - rand(uv + 0.1),
            0.5 - rand(uv + 0.2),
            0.5 - rand(uv + 0.3)
          );
          phase += 1.0;
        }

        gl_FragColor = vec4( position + velocity * delta, phase );

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
    // Check for completeness
    var error = gpu.init();
    if (error !== null) {
      console.error(error);
    }
    // In each frame...
    // Compute!

    this.position = posVar;

    this.sync = () => {
      posVar.material.uniforms.time.value += 1 / 60;
      velVar.material.uniforms.time.value += 1 / 60;
    };
  }

  compute() {
    this.gpu.compute();
    this.sync();
  }

  postComputeGetData() {
    return this.gpu.getCurrentRenderTarget(this.position).texture;
  }
}
