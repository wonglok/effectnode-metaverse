import { Text, useProgress } from "@react-three/drei";
import { createPortal, useThree } from "@react-three/fiber";
export function LoadingInCam() {
  let { get } = useThree();
  let { total, active, loaded } = useProgress();
  return (
    <group>
      {createPortal(
        <group visible={active} position={[0, 0, -3]}>
          {
            <Text
              font={`/font/trivial/Trivial-Heavy.otf`}
              color="red"
              fontSize={0.13}
            >
              {loaded} / {total} Loaded
            </Text>
          }
        </group>,
        get().camera
      )}
    </group>
  );
}
