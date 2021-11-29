import {
  ShaderMaterial,
  Color,
  DoubleSide,
  TextureLoader,
  FrontSide,
} from "three";
export class ForceShield {
  constructor() {
    var uniforms = {
      remixColor: { value: new Color("#ffffff") },
      uWozzy: { value: 1 },
      mRefractionRatio: { value: 1.02 },
      mFresnelBias: { value: 0.1 },
      mFresnelPower: { value: 0.7 },
      mFresnelScale: { value: 0.6 },
      tCube: { value: null },
      time: { value: 0 },
      tDudv: { value: null },
      useDudv: { value: 1 },
      opacity: { value: 1.0 },
    };
    this.uniforms = uniforms;
    this.dudvURL = `/texture/waterdudv.jpg`;
    new TextureLoader().load(this.dudvURL, (tex) => {
      this.tDudv = tex;
      this.uniforms.useDudv.value = 1;
    });

    let shield = new ShaderMaterial({
      uniforms,
      side: DoubleSide,
      transparent: true,
      vertexShader: /* glsl */ `
    // Classic Perlin 2D Noise
    // by Stefan Gustavson
    //
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

    float cnoise(vec2 P){
      vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
      Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x,gy.x);
      vec2 g10 = vec2(gx.y,gy.y);
      vec2 g01 = vec2(gx.z,gy.z);
      vec2 g11 = vec2(gx.w,gy.w);
      vec4 norm = 1.79284291400159 - 0.85373472095314 *
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
      g00 *= norm.x;
      g01 *= norm.y;
      g10 *= norm.z;
      g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
      return 2.3 * n_xy;
    }

    uniform float mRefractionRatio;
    uniform float mFresnelBias;
    uniform float mFresnelScale;
    uniform float mFresnelPower;

    uniform float uWozzy;

    uniform float time;

    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 funPos = position;

      // float cx = cnoise(normal.x + vec2(position.x * 0.11) + time) * 0.1 * uWozzy;
      // float cy = cnoise(normal.y + vec2(position.y * 0.12) + time) * 0.1 * uWozzy;
      // float cz = cnoise(normal.z + vec2(position.z * 0.13) + time) * 0.1 * uWozzy;
      funPos.x += normal.x * 0.01 * abs(sin(time * 0.3));
      funPos.y += normal.y * 0.01 * abs(sin(time * 0.3));
      funPos.z += normal.z * 0.01 * abs(sin(time * 0.3));

      vec4 mvPosition = modelViewMatrix * vec4( funPos, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( funPos, 1.0 );

      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

      vec3 I = worldPosition.xyz - cameraPosition;

      vReflect = reflect( I, worldNormal );
      vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
      vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
      vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
      vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );

      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = 10.0;
    }
  `,
      fragmentShader: /* glsl */ `
    uniform samplerCube tCube;
    uniform sampler2D tDudv;
    uniform float time;
    uniform float opacity;

    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;
    varying vec2 vUv;

    uniform float useDudv;
    uniform vec3 remixColor;

    void main() {
      vec3 tRefract0 = vRefract[0];
      vec3 tRefract1 = vRefract[1];
      vec3 tRefract2 = vRefract[2];

      if (useDudv == 1.0) {
        float waveStrength = 0.1053333;
        // simple distortion (ripple) via dudv map (see )
        // https://www.youtube.com/watch?v=6B7IF6GOu7s
        vec2 distortedUv = texture2D( tDudv, vec2( vUv.x, vUv.y ) ).rg * waveStrength;
        distortedUv = vUv.xy + sin(time * 0.067) * 0.5 + vec2( distortedUv.x, distortedUv.y );
        vec2 distortion = ( texture2D( tDudv, distortedUv * 0.25 ).rg * 2.0 - 1.0 ) * waveStrength;

        tRefract0.xy += distortion;
        tRefract1.xy += distortion;
        tRefract2.xy += distortion;
      }

      // vec4 reflectedColor = textureCube( tCube, vec3( vReflect.x, vReflect.y, vReflect.z ) );

      vec4 reflectedColor = textureCube( tCube, vec3( vReflect.x, vReflect.y, vReflect.z ) );
      vec4 refractedColor = vec4(1.0);

      refractedColor.r = textureCube( tCube, vec3( tRefract0.x, tRefract0.yz ) ).r;
      refractedColor.g = textureCube( tCube, vec3( tRefract1.x, tRefract1.yz ) ).g;
      refractedColor.b = textureCube( tCube, vec3( tRefract2.x, tRefract2.yz ) ).b;

      // refractedColor.r = textureCube( tCube, vec3( -tRefract0.x, tRefract0.yz ) ).r;
      // refractedColor.g = textureCube( tCube, vec3( -tRefract1.x, tRefract1.yz ) ).g;
      // refractedColor.b = textureCube( tCube, vec3( -tRefract2.x, tRefract2.yz ) ).b;

      // vec2 coord = gl_PointCoord.xy - vec2(0.5);
      // if (length(coord) > 0.5) {
      //   discard;
      // } else {
      //   gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
      // }

      gl_FragColor = mix( reflectedColor, refractedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
      gl_FragColor.rgb = remixColor.rgb * gl_FragColor.rgb;
      gl_FragColor.a = opacity;
    }
  `,
    });

    this.shield = shield;
  }
  set tDudv(v) {
    this.uniforms.tDudv.value = v;
  }
  get tDudv() {
    return this.uniforms.tDudv.value;
  }
  set woozy(v) {
    this.uniforms.useDudv.value = v;
  }
  get woozy() {
    return this.uniforms.useDudv.value;
  }
  set tCube(v) {
    this.uniforms.tCube.value = v;
  }
  get tCube() {
    return this.uniforms.tCube.value;
  }
  set envMap(v) {
    this.uniforms.tCube.value = v;
  }
  get envMap() {
    return this.uniforms.tCube.value;
  }

  set uWoozy(v) {
    this.uniforms.uWoozy.value = v;
  }
  get uWoozy() {
    return this.uniforms.uWoozy.value;
  }

  get time() {
    return this.uniforms.time.value;
  }
  set time(v) {
    this.uniforms.time.value = v;
  }
}
