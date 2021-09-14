import { useFBX, useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimationMixer, Object3D, Vector3 } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { getFirebase } from "../../firebase/firelib";
import { AQ } from "../../places/church/Assets";

export function PlayerDisplay({
  Now,
  envMap,
  isSwim = false,
  lookBack = false,
  children = null,
}) {
  let [show, setShow] = useState(false);
  let [url, setURL] = useState(false);
  useEffect(() => {
    setURL(
      `https://d1a370nemizbjq.cloudfront.net/9a9da86c-f9dc-421c-94c8-728fce2ad129.glb`
    );
    setShow(true);
  }, []);
  return (
    <group position={[0, -2.315 * 0.0, 0]}>
      <Suspense fallback={null}>
        {show && (
          <group>
            <PlayerInternal
              lookBack={lookBack}
              envMap={envMap}
              url={url}
              Now={Now}
              isSwim={isSwim}
            ></PlayerInternal>
            {children}
          </group>
        )}
      </Suspense>
    </group>
  );
}

function PlayerInternal({
  envMap,
  Now,
  url,
  lookBack = false,
  isSwim = false,
}) {
  let gltf = useGLTF(url);

  let avatar = useMemo(() => {
    let cloned = SkeletonUtils.clone(gltf.scene);
    cloned.traverse((it) => {
      //cloned
      it.frustumCulled = false;
      if (
        //
        it.material &&
        (it.material.name == "Wolf3D_Teeth" ||
          it.material.name == "Wolf3D_Skin" ||
          it.material.name == "Wolf3D_Eye" ||
          it.material.name == "Wolf3D_Body")
      ) {
      } else {
        if (it.material) {
          it.material = it.material.clone();
          it.material.envMap = envMap;
          it.material.envMapIntensity = 2;
          it.material.metalnessMapIntensity = 2;
          it.material.roughness = 0.1;
          it.material.metalness = 1;
        }
      }
    });
    return cloned;
  }, [gltf]);

  let o3d = new Object3D();

  return (
    <group>
      {/*  */}
      {/*  */}
      {/*  */}
      {createPortal(<primitive object={avatar}></primitive>, o3d)}

      <group>
        <primitive object={o3d}></primitive>
      </group>
      <Pose
        isSwim={isSwim}
        lookBack={lookBack}
        avatar={avatar}
        Now={Now}
      ></Pose>
    </group>
  );
}

function Pose({ avatar, Now, isSwim = false, lookBack = false }) {
  let wp = new Vector3();
  let dir = new Vector3();
  let dir2 = new Vector3();
  let forward = new Vector3();
  let lastWP = new Vector3();

  useFrame(({ camera }) => {
    Now.avatarSpeed = isSwim ? 0.35 : 0.45;

    let gp = avatar;
    let ava = avatar;
    if (gp && ava) {
      gp.position.set(
        //
        Now.avatarAt.x,
        Now.avatarAt.y,
        Now.avatarAt.z
      );

      if (lookBack) {
        if (Now.avatarMode === "standing") {
          ava.getWorldPosition(wp);
          dir.set(camera.position.x, wp.y, camera.position.z);
          dir2.lerp(dir, 0.01);
          ava.lookAt(dir2);
        } else {
          ava.getWorldPosition(wp);
          dir.fromArray([Now.goingTo.x, wp.y, Now.goingTo.z]);
          dir2.lerp(dir, 0.1);
          ava.lookAt(dir2);
        }
      } else {
        Now.avatarAtDelta.copy(lastWP);
        ava.getWorldPosition(wp);
        Now.avatarAtDelta.sub(wp);
      }

      dir.fromArray([Now.goingTo.x, wp.y, Now.goingTo.z]);
      dir2.lerp(dir, 0.2);
      ava.lookAt(dir2);

      Now.avatarRot.x = ava.rotation.x;
      Now.avatarRot.y = ava.rotation.y;
      Now.avatarRot.z = ava.rotation.z;
    }
  });

  let mixer = useMemo(() => {
    return new AnimationMixer(avatar);
  }, [avatar]);

  let fbx = isSwim
    ? {
        // running: useFBX(`/rpm/rpm-actions-locomotion/running.fbx`),
        // standing: useFBX(`/rpm/rpm-actions-locomotion/standing.fbx`),
        running: useFBX(AQ.swimming.url),
        standing: useFBX(AQ.floating.url),
      }
    : {
        running: useFBX(AQ.running.url),
        standing: useFBX(AQ.standing.url),
        // running: useFBX(`/rpm/rpm-actions-locomotion/swim-forward.fbx`),
        // standing: useFBX(`/rpm/rpm-actions-locomotion/swim-float.fbx`),
      };

  let actions = useMemo(() => {
    let obj = {};
    for (let kn in fbx) {
      obj[kn] = mixer.clipAction(fbx[kn].animations[0]);
    }
    return obj;
  }, [fbx]);

  useEffect(() => {
    let last = false;
    setTimeout(() => {
      Now.avatarMode = "running";
    });
    Now.avatarMode = "standing";

    return Now.onEvent("avatarMode", () => {
      let current = actions[Now.avatarMode];
      if (last && last !== current) {
        last.fadeOut(0.2);
      }
      last = current;

      if (Now.avatarMode) {
      }

      current.reset();
      current.play();
      current.fadeIn(0.2);
    });
  }, [avatar]);

  useFrame((st, dt) => {
    if (dt <= 1 / 60) {
      dt = 1 / 60;
    }
    mixer.update(dt);
  });

  return <group></group>;
}
