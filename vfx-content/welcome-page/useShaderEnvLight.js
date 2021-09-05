import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useComputeEnvMap } from "../../vfx-metaverse";

export function useShaderEnvLight() {
  let { get } = useThree();

  let envMap = useComputeEnvMap(
    /* glsl */ `

    const float PI = 3.14159265;
    const float SCALE = 1.0;
    const mat3 m = mat3(
      cos(PI * SCALE), -sin(PI * SCALE), 0.0,
      sin(PI * SCALE),  cos(PI * SCALE), 0.0,
      0.0,  0.0, 1.0
    );

    float noise( in vec3 p ) {
      return cos(p.x) * sin(p.y) * cos(p.z);
    }

    float fbm4( vec3 p ) {
        float f = 0.0;
        f += 0.5000 * noise( p ); p = m * p * 2.02;
        f += 0.2500 * noise( p ); p = m * p * 2.03;
        f += 0.1250 * noise( p ); p = m * p * 2.01;
        f += 0.0625 * noise( p );
        return f / 0.9375;
    }

    float fbm6( vec3 p ) {
        float f = 0.0;
        f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
        f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
        f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
        f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
        f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
        f += 0.015625*(0.5 + 0.5 * noise( p ));
        return f/0.96875;
    }

    float pattern (vec3 p) {
      float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
      return abs(vout);
    }

    vec4 mainImage (vec2 uv, vec3 direction, vec3 pos) {
      return vec4(vec3(
        -0.2 + 1.0 - 1.0 * pow(pattern(direction.xyz + -0.15 * cos(time * 0.1)), 1.25),
        -0.2 + 1.0 - 1.0 * pow(pattern(direction.xyz +   0.0 * cos(time * 0.1)), 1.25),
        -0.2 + 1.0 - 1.0 * pow(pattern(direction.xyz +  0.15 * cos(time * 0.1)), 1.25)
      ), 1.0);
    }
  `.trim(),
    {
      // textureBG: { value: tex },
    },
    32
  );

  useEffect(() => {
    let { scene } = get();
    scene.environment = envMap;
    return () => {
      scene.environment = null;
    };
  }, [envMap]);

  return { envMap };
}
