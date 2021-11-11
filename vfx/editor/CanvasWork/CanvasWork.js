import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Loading from "../Loading/Loading";

export default function CanvasWork() {
  return (
    <Canvas>
      <Content></Content>
    </Canvas>
  );
}

function Content() {
  return (
    <group>
      <Suspense fallback={<Loading></Loading>}>
        <gridHelper args={[100, 100, "red", "red"]}></gridHelper>

        <Camdemo></Camdemo>
      </Suspense>
    </group>
  );
}

function Camdemo() {
  let { get } = useThree();

  useEffect(() => {
    get().camera.position.y = 5;
    get().camera.position.z = 5;
    get().camera.lookAt(0, 0, 0);
  }, []);
  return null;
}
