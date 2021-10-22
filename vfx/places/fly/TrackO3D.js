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
} from "three";
import { Geometry } from "three/examples/jsm/deprecated/Geometry.js";

export class LokLokWiggleSimulation {
  constructor({ node, howManyTracker = 10, howLongTail = 32 }) {
    this.node = node;
    this.WIDTH = howLongTail;
    this.HEIGHT = howManyTracker; // number of trackers
    this.COUNT = this.WIDTH * this.HEIGHT;
    this.wait = this.setup({ node });
    this.v3v000 = new Vector3(0, 0, 0);
  }
  async setup({ node }) {
    let renderer = await node.ready.gl;

    let gpu = (this.gpu = new GPUComputationRenderer(
      this.WIDTH,
      this.HEIGHT,
      renderer
    ));

    gpu.setDataType(HalfFloatType);

    let makeHeadListTex = () => {
      let howManyTracker = this.HEIGHT;
      let howLongTail = this.WIDTH;
      let size = howLongTail * howManyTracker;
      //

      const textureArray = new Uint16Array(3 * size);
      const handTexture = new DataTexture(
        textureArray,
        1,
        howManyTracker,
        RGBFormat,
        HalfFloatType
      );
      handTexture.needsUpdate = true;

      return {
        texture: handTexture,
        update: ({ trackers, lerp = 1 }) => {
          for (let i = 0; i < trackers.length; i++) {
            let tracker = trackers[i];

            if (tracker) {
              tracker.userData.px = tracker.userData.px || 0;
              tracker.userData.py = tracker.userData.py || 0;
              tracker.userData.pz = tracker.userData.pz || 0;

              //
              tracker.userData.px = MathUtils.damp(
                tracker.userData.px,
                tracker.position.x,
                lerp,
                1 / 60
              );
              tracker.userData.py = MathUtils.damp(
                tracker.userData.py,
                tracker.position.y,
                lerp,
                1 / 60
              );
              tracker.userData.pz = MathUtils.damp(
                tracker.userData.pz,
                tracker.position.z,
                lerp,
                1 / 60
              );

              handTexture.image.data[i * 3 + 0] = DataUtils.toHalfFloat(
                tracker.userData.px
              );
              handTexture.image.data[i * 3 + 1] = DataUtils.toHalfFloat(
                tracker.userData.py
              );
              handTexture.image.data[i * 3 + 2] = DataUtils.toHalfFloat(
                tracker.userData.pz
              );
            }
          }
          handTexture.needsUpdate = true;
        },
      };
    };
    this.headList = makeHeadListTex();

    const dtPosition = this.gpu.createTexture();
    const lookUpTexture = this.gpu.createTexture();
    this.fillPositionTexture(dtPosition);
    this.fillLookupTexture(lookUpTexture);

    this.positionVariable = this.gpu.addVariable(
      "texturePosition",
      this.positionShader(),
      dtPosition
    );

    this.gpu.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
    ]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.positionUniforms["lookup"] = { value: lookUpTexture };
    this.positionUniforms["headList"] = { value: this.headList.texture };

    let h = this.HEIGHT;
    // for (let ii = 0; ii < h; ii++) {
    //   this.positionUniforms["mouse" + ii] = { value: new Vector3(0, 0, 0) };
    // }

    this.positionUniforms["time"] = { value: 0 };
    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;

    //
    const error = this.gpu.init();
    if (error !== null) {
      console.error(error);
    }
  }

  track({ trackers = [], lerp = 0.3 }) {
    if (this.headList) {
      this.headList.update({ trackers, lerp });
    }
  }

  positionShader() {
    let mouseUniforms = () => {
      let str = ``;
      let h = this.HEIGHT;
      for (let ii = 0; ii < h; ii++) {
        str += `
          // uniform vec3 mouse${ii.toFixed(0)};
        `;
      }

      return str;
    };

    let lookupRightLine = () => {
      let str = `

      vec4 texColor = texture2D(headList, vec2(0.0, currentLine / ${this.HEIGHT.toFixed(
        1
      )}));


      texColor.rgb = lerp(positionHead.rgb, texColor.rgb, 0.1);

      gl_FragColor = vec4(texColor.rgb, 1.0);

      // if (false) {}`;
      // let h = this.HEIGHT;
      // for (let ii = 0; ii < h; ii++) {
      //   str += `
      //     else if (currentLine == ${ii.toFixed(0)}.0) {
      //       vec4 texColor = texture2D(headList, vec2(0.0, currentLine / ${this.HEIGHT.toFixed(
      //         1
      //       )}));

      //       texColor.rgb = lerp(positionHead.rgb, texColor.rgb, 0.1);

      //       gl_FragColor = vec4(texColor.rgb, 1.0);

      //       // gl_FragColor = vec4(mouse${ii.toFixed(0)}, 1.0);
      //     }
      //   `;
      // }
      return str;
    };

    return /* glsl */ `
      uniform sampler2D headList;
      ${mouseUniforms()}

      uniform sampler2D lookup;
      uniform float time;

      vec3 lerp(vec3 a, vec3 b, float w)
      {
        return a + w*(b-a);
      }

			void main()	{
        // const float width = resolution.x;
        // const float height = resolution.y;
        // float xID = floor(gl_FragCoord.x);
        // float yID = floor(gl_FragCoord.y);

        vec2 uvCursor = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;
        vec4 positionHead = texture2D( texturePosition, uvCursor );

        vec4 lookupData = texture2D(lookup, uvCursor);
        vec2 nextUV = lookupData.xy;
        float currentIDX = floor(gl_FragCoord.x);
        float currentLine = floor(gl_FragCoord.y);

        if (floor(currentIDX) == 0.0) {
          // currentIDX
          ${lookupRightLine()}
        } else {
          vec3 positionChain = texture2D( texturePosition,nextUV ).xyz;

          // positionChain.rgb = lerp(positionHead.rgb, positionChain.rgb, 0.3);

          gl_FragColor = vec4(positionChain, 1.0);
        }
			}
    `;
  }

  fillPositionTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
      }
    }
    texture.needsUpdate = true;
  }

  fillLookupTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;
    let items = [];

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        let lastOneInArray = items[items.length - 1] || [0, 0];
        theArray[i++] = lastOneInArray[0];
        theArray[i++] = lastOneInArray[1];
        theArray[i++] = this.WIDTH;
        theArray[i++] = this.HEIGHT;
        items.push([x / this.WIDTH, y / this.HEIGHT]);
      }
    }
    texture.needsUpdate = true;
  }

  render() {
    if (this.positionUniforms && this.gpu) {
      this.positionUniforms["time"].value = window.performance.now() / 1000;
      this.gpu.compute();
    }

    // trackers.forEach((track, idx) => {
    //   let uniform = this.positionUniforms["mouse" + idx];
    //   if (uniform && uniform.value) {
    //     uniform.value.copy(track);
    //     // console.log(idx, track.toArray().join("-"));
    //   }
    // });
  }

  getTextureAfterCompute() {
    return {
      posTexture: this.gpu.getCurrentRenderTarget(this.positionVariable)
        .texture,
    };
  }
}

export class LokLokWiggleDisplay {
  constructor({ node, sim }) {
    this.o3d = new Object3D();
    this.node = node;
    this.sim = sim;
    this.wait = this.setup({ node });
  }
  async setup({ node }) {
    // let camera = await node.ready.camera;
    // let renderer = await node.ready.gl;

    let { geometry, subdivisions, count } = new NoodleGeo({
      count: this.sim.HEIGHT,
      numSides: 4,
      subdivisions: this.sim.WIDTH,
      openEnded: false,
    });

    geometry.instanceCount = count;

    // let getPointAtByT = ({
    //   controlPointsResolution = 20,
    //   lineIdx = 0,
    //   lineCount = this.sim.HEIGHT,
    //   textureName = "CONTROL_POINTS",
    // }) => {
    //   controlPointsResolution = Math.floor(controlPointsResolution);

    //   let floatval = `${Number(controlPointsResolution).toFixed(1)}`;

    //   let res = `
    //   vec3 pointIDX_${textureName}_${lineIdx.toFixed(0)} (float index) {
    //     vec3 result = vec3(0.0);

    //     vec4 color = texture2D(${textureName},
    //       vec2(
    //         index / ${controlPointsResolution.toFixed(1)},
    //         ${lineIdx.toFixed(1)} / ${lineCount.toFixed(1)}
    //       )
    //     );

    //     result = color.rgb;

    //     return result;
    //   }

    //   vec3 catmullRom_${textureName}_${lineIdx} (vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
    //       vec3 v0 = (p2 - p0) * 0.5;
    //       vec3 v1 = (p3 - p1) * 0.5;
    //       float t2 = t * t;
    //       float t3 = t * t * t;

    //       return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
    //   }

    //   vec3 getPointAt_${lineIdx.toFixed(0)} (float t) {
    //     bool closed = false;
    //     float ll = ${floatval};
    //     float minusOne = 1.0;
    //     if (closed) {
    //       minusOne = 0.0;
    //     }

    //     float p = (ll - minusOne) * t;
    //     float intPoint = floor(p);
    //     float weight = p - intPoint;

    //     float idx0 = intPoint + -1.0;
    //     float idx1 = intPoint +  0.0;
    //     float idx2 = intPoint +  1.0;
    //     float idx3 = intPoint +  2.0;

    //     vec3 pt0 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx0);
    //     vec3 pt1 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx1);
    //     vec3 pt2 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx2);
    //     vec3 pt3 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx3);

    //     vec3 pointoutput = catmullRom_${textureName}_${lineIdx}(pt0, pt1, pt2, pt3, weight);

    //     return pointoutput;
    //   }
    //   `;

    //   // console.log(res);
    //   return res;
    // };

    // let getLinesPointAtT = () => {
    //   let str = `
    //       if (false) {}`;
    //   for (let i = 0; i < this.sim.HEIGHT; i++) {
    //     str += `
    //       else if (lineIDXER == ${i.toFixed(1)}) {
    //         pt += getPointAt_${i.toFixed(0)}(t);
    //       }
    //     `;
    //   }
    //   // console.log(str);

    //   return str;
    // };

    // let pointLineMaker = () => {
    //   let str = "";
    //   for (let i = 0; i < this.sim.HEIGHT; i++) {
    //     str +=
    //       getPointAtByT({
    //         lineIdx: i,
    //         lineCount: this.sim.HEIGHT,
    //         controlPointsResolution: subdivisions,
    //         textureName: "posTexture",
    //       }) + "\n";
    //   }
    //   return str;
    // };

    let matLine0 = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        matcap: {
          value: null,
          // value: new TextureLoader().load("/matcap/golden2.png"),
          // value: await node.ready.RainbowTexture,
        },
        posTexture: { value: null },
        // handTexture: { value: null },
      },
      vertexShader: /* glsl */ `
        // #include <common>
        #define lengthSegments ${subdivisions.toFixed(1)}

        attribute float angle;
        attribute float newPosition;
        attribute float tubeInfo;

        // varying vec2 vUv;
        varying vec3 vNormal;
        attribute vec4 offset;

        uniform sampler2D posTexture;
        // uniform sampler2D handTexture;

        uniform float time;

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

        // pointLineMaker


        vec3 catmullRom (vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
            vec3 v0 = (p2 - p0) * 0.5;
            vec3 v1 = (p3 - p1) * 0.5;
            float t2 = t * t;
            float t3 = t * t * t;

            return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
        }

        vec3 getP3OfTex (float t, float lineIDXER) {

          vec4 color = texture2D(posTexture,
            vec2(
              t,
              lineIDXER / ${this.sim.HEIGHT.toFixed(1)}
            )
          );

          return color.rgb;
        }
        vec3 getPointAt (float t, float lineIDXER) {
          bool closed = false;
          float ll = ${subdivisions.toFixed(1)};
          float minusOne = 1.0;
          if (closed) {
            minusOne = 0.0;
          }

          float p = (ll - minusOne) * t;
          float intPoint = floor(p);
          float weight = p - intPoint;

          float idx0 = intPoint + -1.0;
          float idx1 = intPoint +  0.0;
          float idx2 = intPoint +  1.0;
          float idx3 = intPoint +  2.0;

          vec3 pt0 = getP3OfTex(idx0, lineIDXER);
          vec3 pt1 = getP3OfTex(idx1, lineIDXER);
          vec3 pt2 = getP3OfTex(idx2, lineIDXER);
          vec3 pt3 = getP3OfTex(idx3, lineIDXER);

          vec3 pointoutput = catmullRom(pt0, pt1, pt2, pt3, weight);

          return pointoutput;
        }

        vec3 sampleFnc (float t) {
          vec3 pt = (offset.xyz + 0.5) * 0.0;

          // pt = vec4(vec4(pt, 1.0) * rotationY(t * 0.1 + time * 0.1)).xyz;
          // if (lineIDXER == 0.0) {
          //   pt += getPointAt_0(t);
          // }

          float lineIDXER = offset.w;

          pt += getP3OfTex(t, lineIDXER);
          // pt += getPointAt_0(t);

          // getLinesPointAtT

          // pt = getPointAt_2(t);

          return pt;
        }

        void createTube (float t, vec2 volume, out vec3 pos, out vec3 normal) {
          // find next sample along curve
          float nextT = t + (1.0 / lengthSegments);

          // sample the curve in two places
          vec3 cur = sampleFnc(t);
          vec3 next = sampleFnc(nextT);

          // compute the Frenet-Serret frame
          vec3 T = normalize(next - cur);
          vec3 B = normalize(cross(T, next + cur));
          vec3 N = -normalize(cross(B, T));

          // extrude outward to create a tube
          float tubeAngle = angle;
          float circX = cos(tubeAngle);
          float circY = sin(tubeAngle);

          // compute position and normal
          normal.xyz = normalize(B * circX + N * circY);
          pos.xyz = cur + B * volume.x * circX + N * volume.y * circY;
        }

        varying float vT;

        varying vec3 vViewPosition;

        varying vec3 vTColor;

        void main (void) {
          vec3 transformed;
          vec3 objectNormal;

          float t = tubeInfo + 0.5;

          vT = t;

          vTColor = abs(getP3OfTex(0.5, offset.w) - getP3OfTex(0.6, offset.w));

          vec2 volume = vec2(0.009, 0.009) * 20.0;
          createTube(t, volume, transformed, objectNormal);

          vec3 transformedNormal = normalMatrix * objectNormal;
          vNormal = normalize(transformedNormal);

          // vUv = uv.yx;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vViewPosition = -mvPosition.xyz;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vT;
        // varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform sampler2D matcap;
        varying vec3 vTColor;

        void main (void) {

          vec3 viewDir = normalize( vViewPosition );
          vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
          vec3 y = cross( viewDir, x );
          vec2 uv = vec2( dot( x, vNormal ), dot( y, vNormal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

          // vec4 matcapColor = texture2D( matcap, uv );

          gl_FragColor = vec4(vec3(vTColor), (1.0 - vT));
        }
      `,
      transparent: true,
      // blending: AdditiveBlending,
    });

    let line0 = new Mesh(geometry, matLine0);

    this.o3d.add(line0);
    node.onClean(() => {
      this.o3d.remove(line0);
    });

    // enableBloom(line0);

    // scene.add(line0);

    await this.sim.wait;
    node.onLoop(() => {
      let result = this.sim.getTextureAfterCompute();
      matLine0.uniforms.posTexture.value = result.posTexture;
      matLine0.uniforms.time.value = window.performance.now() / 1000;
    });
  }

  // async enableMousePlane() {
  //   let raycaster = await node.ready.raycaster;
  //   let mouse = await node.ready.mouse;
  //   let camera = await node.ready.camera;
  //   let viewport = await node.ready.viewport;

  //   let geoPlane = new PlaneBufferGeometry(
  //     2.0 * viewport.width,
  //     2.0 * viewport.height,
  //     2,
  //     2
  //   );

  //   let matPlane = new MeshBasicMaterial({
  //     transparent: true,
  //     opacity: 0.25,
  //     color: 0xff0000,
  //   });

  //   let planeMesh = new Mesh(geoPlane, matPlane);
  //   planeMesh.position.z = -camera.position.z / 2;

  //   scene.add(planeMesh);
  //   node.onClean(() => {
  //     scene.remove(planeMesh);
  //   });

  //   let temppos = new Vector3();
  //   node.onLoop(() => {
  //     planeMesh.lookAt(camera.position);
  //     raycaster.setFromCamera(mouse, camera);
  //     let res = raycaster.intersectObject(planeMesh);
  //     if (res && res[0]) {
  //       temppos.copy(res[0].point);
  //     }
  //   });
  // }

  // enableHandTexture() {
  //   const width = this.sim.WIDTH;
  //   const height = this.sim.HEIGHT;
  //   const size = width * height;

  //   let handMovement = [];
  //   let temppos = new Vector3();
  //   for (let i = 0; i < size; i++) {
  //     AvatarHead.getWorldPosition(temppos);

  //     let x = temppos.x || 0;
  //     let y = temppos.y || 0;
  //     let z = temppos.z || 0;
  //     //
  //     handMovement.unshift(x, y, z);
  //   }

  //   const textureArray = new Uint16Array(3 * size);
  //   const handTexture = new DataTexture(
  //     textureArray,
  //     width,
  //     height,
  //     RGBFormat,
  //     HalfFloatType
  //   );
  //   handTexture.needsUpdate = true;

  //   node.onLoop(() => {
  //     handMovement.push(DataUtils.toHalfFloat(temppos.x) || 0);
  //     handMovement.push(DataUtils.toHalfFloat(temppos.y) || 0);
  //     handMovement.push(DataUtils.toHalfFloat(temppos.z) || 0);

  //     handMovement.shift();
  //     handMovement.shift();
  //     handMovement.shift();

  //     textureArray.set(handMovement, 0);
  //     handTexture.needsUpdate = true;
  //     mat.uniforms.handTexture.value = handTexture;
  //   });
  // }
}

class NoodleGeo {
  constructor(props) {
    let {
      count = 20,
      numSides = 4,
      subdivisions = 50,
      openEnded = true,
    } = props;
    const radius = 1;
    const length = 1;

    const cylinderBufferGeo = new CylinderBufferGeometry(
      radius,
      radius,
      length,
      numSides,
      subdivisions,
      openEnded
    );

    let baseGeometry = new Geometry();
    baseGeometry = baseGeometry.fromBufferGeometry(cylinderBufferGeo);

    baseGeometry.rotateZ(Math.PI / 2);

    // compute the radial angle for each position for later extrusion
    const tmpVec = new Vector2();
    const xPositions = [];
    const angles = [];
    const uvs = [];
    const vertices = baseGeometry.vertices;
    const faceVertexUvs = baseGeometry.faceVertexUvs[0];
    const oPositions = [];

    // Now go through each face and un-index the geometry.
    baseGeometry.faces.forEach((face, i) => {
      const { a, b, c } = face;
      const v0 = vertices[a];
      const v1 = vertices[b];
      const v2 = vertices[c];
      const verts = [v0, v1, v2];
      const faceUvs = faceVertexUvs[i];

      // For each vertex in this face...
      verts.forEach((v, j) => {
        tmpVec.set(v.y, v.z).normalize();

        // the radial angle around the tube
        const angle = Math.atan2(tmpVec.y, tmpVec.x);
        angles.push(angle);

        // "arc length" in range [-0.5 .. 0.5]
        xPositions.push(v.x);
        oPositions.push(v.x, v.y, v.z);

        // copy over the UV for this vertex
        uvs.push(faceUvs[j].toArray());
      });
    });

    // build typed arrays for our attributes
    const posArray = new Float32Array(xPositions);
    const angleArray = new Float32Array(angles);
    const uvArray = new Float32Array(uvs.length * 2);

    const origPosArray = new Float32Array(oPositions);

    // unroll UVs
    for (let i = 0; i < posArray.length; i++) {
      const [u, v] = uvs[i];
      uvArray[i * 2 + 0] = u;
      uvArray[i * 2 + 1] = v;
    }

    const lineGeo = new InstancedBufferGeometry();
    lineGeo.instanceCount = count;

    lineGeo.setAttribute("position", new BufferAttribute(origPosArray, 3));
    lineGeo.setAttribute("tubeInfo", new BufferAttribute(posArray, 1));
    lineGeo.setAttribute("angle", new BufferAttribute(angleArray, 1));
    lineGeo.setAttribute("uv", new BufferAttribute(uvArray, 2));

    let offset = [];
    let ddxyz = Math.floor(Math.pow(count, 1 / 3));
    let iii = 0;
    for (let z = 0; z < ddxyz; z++) {
      for (let y = 0; y < ddxyz; y++) {
        for (let x = 0; x < ddxyz; x++) {
          offset.push(
            0.0, //  * (x / ddxyz) * 2.0 - 1.0,
            0.0, //  * (y / ddxyz) * 2.0 - 1.0,
            0.0, //  * (z / ddxyz) * 2.0 - 1.0,
            iii
          );
          iii++;
        }
      }
    }

    // let ddxyz = Math.floor(Math.pow(count, 1 / 2));
    // for (let y = 0; y < ddxyz; y++) {
    //   for (let x = 0; x < ddxyz; x++) {
    //     offset.push(0.0, (x / ddxyz) * 2.0 - 1.0, (y / ddxyz) * 2.0 - 1.0);
    //   }
    // }

    lineGeo.setAttribute(
      "offset",
      new InstancedBufferAttribute(new Float32Array(offset), 4)
    );

    let eachLineIdx = [];
    for (let c = 0; c < count; c++) {
      eachLineIdx.push(c);
    }

    // lineGeo.setAttribute(
    //   "lineIDXER",
    //   new InstancedBufferAttribute(new Float32Array(eachLineIdx), 1)
    // );

    return {
      ...props,
      dataLength: posArray.length,
      geometry: lineGeo,
    };
  }
}

export class TrackO3D {
  constructor({ node, howManyTrackers = 8, tailLength = 64 }) {
    this.o3d = new Object3D();
    this.node = node;
    this.howManyTrackers = howManyTrackers;
    this.tailLength = tailLength;
    this.setup({ node });
  }
  async setup({ node }) {
    //
    let sim = new LokLokWiggleSimulation({
      node,
      howManyTracker: this.howManyTrackers,
      howLongTail: this.tailLength,
    });

    let display = new LokLokWiggleDisplay({ node, sim });

    this.o3d.add(display.o3d);

    console.log(display.o3d);
    node.onClean(() => {
      this.o3d.remove(display.o3d);
    });

    this.track = ({ trackers = [], lerp = 1.0 }) => {
      sim.track({ trackers, lerp });
      sim.render({
        //
      });
    };
  }
}

// let makeOrbitor = (node, radius = 1, mounter) => {
//   let orbit = new Object3D();
//   mounter.add(orbit);
//   node.onClean(() => {
//     mounter.remove(orbit);
//   });

//   node.onLoop((dt) => {
//     orbit.rotation.y += 0.05;
//   });

//   let orbiting1 = new Object3D();
//   orbiting1.position.y = 0.15;
//   orbiting1.position.x = radius;
//   orbit.add(orbiting1);

//   let left = new Vector3();
//   let right = new Vector3();
//   let dist = 2.5700293285455326;
//   let v3 = new Vector3();
//   Promise.all([
//     //
//     node.ready.AvaLeftHand,
//     node.ready.AvaRightHand,
//   ]).then(
//     ([
//       //
//       AvaLeftHand,
//       AvaRightHand,
//     ]) => {
//       node.onLoop(() => {
//         AvaLeftHand.getWorldPosition(left);
//         AvaRightHand.getWorldPosition(right);

//         let dist2 = left.distanceTo(right);

//         let s = dist2 / dist;
//         v3.set(s * s * 10 + 0.5, 1, 1);
//         orbit.scale.lerp(v3, 1);
//       });
//     }
//   );

//   return orbiting1;
// };
