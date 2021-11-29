import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, Object3D } from "three";

export function CameraFlow({ prog }) {
  let gltf = useGLTF(`/map/blockout/cam/blockout_cam.glb`);

  let { get } = useThree();

  let duration = Math.max(...gltf.animations.map((e) => e.duration));

  // console.log(duration);

  useFrame(() => {
    let max = duration - 0.00025;
    if (prog.current >= max) {
      prog.current = max;
    }

    if (prog.current <= 0.00025) {
      prog.current = 0.00025;
    }

    mixer.setTime(prog.current);
  });

  let mixer = useMemo(() => {
    return new AnimationMixer(gltf.scene);
  }, [gltf]);

  useEffect(() => {
    get().gl.autoClear = false;
    get().camera.name = "SceneControls";
    get().camera.near = 0.5;
    get().camera.far = 2000;
    get().camera.fov = 35;
    if (window.innerWidth <= 500) {
      get().camera.fov = 60;
    }
    get().camera.updateProjectionMatrix();
    gltf.animations.forEach((c) => {
      let action = mixer.clipAction(c);
      action.reset();
      // action.repetitions = 1;
      // action.setLoop(LoopOnce);
      // action.clampWhenFinished = true;
      action.play();
    });
  }, []);

  let sync = useRef(() => {});
  useFrame(() => {
    sync.current();
  });
  useEffect(() => {
    let o3d = new Object3D();
    gltf.scene.traverse(console.log);

    let yas = gltf.scene.getObjectByName(`ORIGINAL_COPY_CameraLetsGo`);
    yas.add(o3d);

    let cam = get().camera;
    cam.rotation.set(0, 0, 0, "XYZ");
    cam.position.set(0, 0, 0);
    o3d.add(cam);
    o3d.rotation.x = -0.5 * Math.PI;

    // let wQ = new Quaternion();
    // let wP = new Vector3();
    // sync.current = () => {
    //   o3d.updateMatrixWorld();
    //   o3d.getWorldPosition(wP);
    //   o3d.getWorldQuaternion(wQ);

    //   get().camera.position.lerp(wP, 0.5);
    //   get().camera.quaternion.slerp(wQ, 0.5);
    // };

    // let ptl = new PointLight(0xffffff, 0.3, 50, 2);
    // get().camera.add(ptl);

    return () => {
      sync.current = () => {};
      // get().camera.remove(ptl);
    };
  }, []);

  useEffect(() => {
    get().gl.domElement.style.touchAction = "none";
    get().gl.domElement.parentElement.style.touchAction = "none";
  }, []);

  return (
    <group>
      <primitive object={gltf.scene}></primitive>
    </group>
  );
}
