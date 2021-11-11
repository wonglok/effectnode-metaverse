import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Loading from "../Loading/Loading";

export default function CanvasPreview() {
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
        <gridHelper args={[100, 100, "blue", "blue"]}></gridHelper>
      </Suspense>

      <Camdemo></Camdemo>
    </group>
  );
}

function Camdemo() {
  let { get } = useThree();

  useEffect(() => {
    let py = 1.56;
    let pz = 3;
    get().camera.position.y = py;
    get().camera.position.z = pz;
    get().camera.lookAt(0, py, pz);

    //
    //
  }, []);

  useFrame(({ camera }) => {
    //
    //
  });

  //
  return null;
}
