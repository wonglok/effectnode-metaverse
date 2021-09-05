import { Text, useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimationMixer,
  CanvasTexture,
  DoubleSide,
  Object3D,
  Vector3,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { getFirebase, onReady } from "../../vfx-firebase/firelib";

import { makeShallowStore } from "../../vfx-utils/make-shallow-store";

// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { useEnvLight } from "../../vfx-content/Use/useEnvLight.js";
import { Actions } from "../Actions/Actions";
import router from "next/router";

export const makePlayBack = () => {
  return makeShallowStore({
    reload: false,
    autoPlayNext: true,
    actionKey: false,
    cursor: 0,
  });
};

export function MySelf({ envMap, holder, PlaybackState }) {
  let [url, setURL] = useState(false);
  let [sentences, setActions] = useState([]);
  let [progressText, setProgressText] = useState("");

  let cache = useMemo(() => {
    return new Map();
  }, [holder]);

  useEffect(async () => {
    let snap = await getFirebase()
      .database()
      .ref(`/card-avatar-info/${router.query.cardID}`)
      .get();
    let val = snap.val();
    if (val && val.avatarURL) {
      setURL(`${val.avatarURL}?avatarSignature=${val.avatarSignature}`);
    } else {
    }
  }, []);

  useEffect(() => {
    if (router?.query?.cardID) {
      let ended = false;
      let clean = [];
      Promise.resolve({ db: getFirebase().database() }).then(async ({ db }) => {
        //
        let sentences = db
          .ref(`/card-stroy-draft`)
          .child(router.query.cardID)
          .child(holder)
          .child("sentences");

        let cleanup = sentences.on("value", async (snapshot) => {
          setActions([]);

          if (snapshot) {
            let arr = [];
            let getURL = (fireval) => {
              let obj = Actions.find((a) => a.signature === fireval.signature);

              if (obj) {
                return obj.url;
              } else {
                return false;
              }
            };

            snapshot.forEach((sub) => {
              if (sub) {
                let val = sub.val();

                arr.push({
                  fbx: false,
                  url: getURL(val),
                  firekey: sub.key,
                  fireval: val,
                });
              }
            });

            let n = arr.length;
            arr = arr.map((item, i) => {
              return new Promise((resolve) => {
                if (cache.has(item.url)) {
                  item.fbx = cache.get(item.url);

                  setProgressText(
                    `Downloading Avatar ${((i / n) * 100).toFixed(1)}%`
                  );
                  resolve(item);
                } else {
                  new FBXLoader().load(
                    item.url,
                    (v) => {
                      item.fbx = v;
                      cache.set(item.url, v);
                      setProgressText(
                        `Downloading Avatar ${((i / n) * 100).toFixed(1)}%`
                      );
                      resolve(item);
                    },
                    (prg) => {
                      setProgressText(
                        `Downloading Avatar ${(
                          ((i / n) * 0.9 + (0.1 * prg.loaded) / prg.total) *
                          100
                        ).toFixed(1)}%`
                      );
                    },
                    () => {}
                  );
                }
              });
            });

            Promise.all(arr).then((withFBX) => {
              if (ended) {
                return;
              }
              setProgressText("");
              setActions(withFBX);
            });
          }
        });

        clean.push(cleanup);
      });

      return () => {
        ended = true;
        clean.forEach((e) => e());
      };
    }
  }, []);

  return (
    <group>
      <LoadingActions>{progressText}</LoadingActions>
      {url && sentences.length > 0 && (
        <Suspense fallback={<LoadingAvatar></LoadingAvatar>}>
          <AvatarItem
            holder={holder}
            envMap={envMap}
            url={url}
            sentences={sentences}
            PlaybackState={PlaybackState}
          ></AvatarItem>
        </Suspense>
      )}
    </group>
  );
}

export function LoadingActions({ children }) {
  let { camera } = useThree();

  return (
    <Text
      position={[0, 1.5, 0]}
      textAlign={"center"}
      anchorX={"center"}
      anchorY={"bottom"}
      maxWidth={0.7}
      fontSize={0.12}
      font={`/font/Cronos-Pro-Light_12448.ttf`}
      frustumCulled={false}
      color={"white"}
      outlineColor={"black"}
      outlineWidth={0.005}
      userData={{ enableBloom: true }}
      lookAt={[camera.position.x, camera.position.y, camera.position.z]}
    >
      {children}
    </Text>
  );
}

export function LoadingAvatar() {
  let { camera } = useThree();

  return (
    <Text
      position={[0, 1.5, 0]}
      textAlign={"center"}
      anchorX={"center"}
      anchorY={"bottom"}
      maxWidth={0.7}
      fontSize={0.12}
      font={`/font/Cronos-Pro-Light_12448.ttf`}
      frustumCulled={false}
      color={"white"}
      outlineColor={"black"}
      outlineWidth={0.005}
      userData={{ enableBloom: true }}
      lookAt={[camera.position.x, camera.position.y, camera.position.z]}
    >
      Loading....
    </Text>
  );
}

function AvatarItem({ url, sentences, PlaybackState, envMap }) {
  let o3d = new Object3D();
  o3d.name = "avatar";

  let gltf = useGLTF(`${url}`);
  let avatar = useMemo(() => {
    let cloned = SkeletonUtils.clone(gltf.scene);
    return cloned;
  }, []);

  let { update } = useHeadTracker({ avatar });

  avatar.rotation.set(0, 0, 0);
  avatar.position.set(0, 0, 0);

  let mixer = useMemo(() => {
    return new AnimationMixer(avatar);
  }, [avatar]);

  useFrame((st, dt) => {
    if (dt <= 1 / 60) {
      dt = 1 / 60;
    }
    mixer.update(dt);
    update();
  });

  return (
    <group>
      {createPortal(<primitive object={avatar}></primitive>, o3d)}
      <primitive position={[0, 0, 0]} object={o3d}></primitive>

      <Decorate avatar={avatar}></Decorate>

      {createPortal(
        <DisplaySentence
          sentences={sentences}
          PlaybackState={PlaybackState}
          envMap={envMap}
        ></DisplaySentence>,
        avatar
      )}

      <ActionsApply
        mixer={mixer}
        PlaybackState={PlaybackState}
        sentences={sentences}
        avatar={avatar}
      ></ActionsApply>
    </group>
  );
}

function useHeadTracker({ avatar }) {
  let { get } = useThree();
  let lookAt = new Vector3(0, 0, 0);
  let lookAtlerp = new Vector3(0, 0, 0);
  let lookAtInfluence = new Object3D();
  let lookAtInfluenceNow = new Object3D();

  let onEye = ({ mouse, avatar, bone = LeftEye }) => {
    //
    let leftEye = avatar.getObjectByName(bone);
    lookAt.set(mouse.x * 15, mouse.y * 15, 15);
    lookAtlerp.lerp(lookAt, 0.1);
    lookAtInfluence.lookAt(lookAtlerp);
    lookAtInfluenceNow.quaternion.slerp(lookAtInfluence.quaternion, 0.1);
    leftEye.quaternion.slerp(lookAtInfluenceNow.quaternion, 0.1);

    if (leftEye.rotation.x >= 0.1) {
      leftEye.rotation.x = 0.1;
    }
    if (leftEye.rotation.x <= -0.1) {
      leftEye.rotation.x = -0.1;
    }
    if (leftEye.rotation.y >= 0.1) {
      leftEye.rotation.y = 0.1;
    }
    if (leftEye.rotation.y <= -0.1) {
      leftEye.rotation.y = -0.1;
    }
    if (leftEye.rotation.z >= 0.1) {
      leftEye.rotation.z = 0.1;
    }
    if (leftEye.rotation.z <= -0.1) {
      leftEye.rotation.z = -0.1;
    }
  };

  let onHead = ({ mouse, avatar, bone = "Head" }) => {
    let object = avatar.getObjectByName(bone);
    lookAt.set(mouse.x * 35, mouse.y * 35, 35);
    lookAtlerp.lerp(lookAt, 0.4);
    lookAtInfluence.lookAt(lookAtlerp);
    lookAtInfluenceNow.quaternion.slerp(lookAtInfluence.quaternion, 0.4);

    object.quaternion.slerp(lookAtInfluenceNow.quaternion, 0.4);
  };

  let handler = () => {
    let { mouse } = get();

    if (avatar) {
      onHead({ mouse, bone: "Head", avatar });
      onEye({ mouse, bone: "LeftEye", avatar });
      onEye({ mouse, bone: "RightEye", avatar });
    }
  };

  return { update: handler };
}

function ActionsApply({ avatar, mixer, sentences, PlaybackState }) {
  PlaybackState.makeKeyReactive("cursor");
  PlaybackState.makeKeyReactive("autoPlayNext");

  let action = useMemo(() => {
    let sentence = sentences[PlaybackState.cursor];
    if (sentence) {
      return mixer.clipAction(sentence.fbx.animations[0], avatar);
    }
  }, [sentences, PlaybackState.cursor]);

  useEffect(() => {
    if (!action) {
      return;
    }

    let stopped = false;

    action.reset();

    if (PlaybackState.autoPlayNext) {
      action.repetitions = 1;
    } else {
      action.repetitions = Infinity;
    }

    // override
    if (sentences.length === 1) {
      action.repetitions = Infinity;
    }

    action.clampWhenFinished = true;
    action.play();

    let sentence = sentences[PlaybackState.cursor];
    PlaybackState.actionKey = sentence.firekey;

    let end = () => {
      if (stopped) {
        return;
      }
      //
      if (PlaybackState.autoPlayNext) {
        PlaybackState.cursor = PlaybackState.cursor + 1;
        PlaybackState.cursor %= sentences.length;
      }
    };

    mixer.addEventListener("finished", end);
    return () => {
      stopped = true;
      mixer.removeEventListener("finished", end);
      action.fadeOut(0.1);
    };
  }, [action, PlaybackState.autoPlayNext, PlaybackState.cursor]);

  return null;
}

function Decorate({ avatar }) {
  useEffect(() => {
    avatar.traverse((it) => {
      it.frustumCulled = false;
    });

    avatar.traverse((it) => {
      if (it.material) {
        it.material.envMapIntensity = 2;
      }
    });
  }, [avatar]);

  return null;
}

function DisplaySentence({ sentences, PlaybackState, envMap = null }) {
  PlaybackState.makeKeyReactive("cursor");
  let text = sentences[PlaybackState.cursor]?.fireval?.sentence;

  return (
    //
    <group position={[0, 1.9, 0]}>
      {text && (
        <Text
          position={[0, 0, 0.5]}
          textAlign={"center"}
          anchorX={"center"}
          anchorY={"bottom"}
          maxWidth={1.333}
          fontSize={0.12}
          font={`/font/Cronos-Pro-Light_12448.ttf`}
          frustumCulled={false}
          color={"white"}
          outlineColor={"black"}
          outlineWidth={0.005}
          userData={{ enableBloom: true }}
        >
          {text}
          <meshBasicMaterial
            attach="material"
            side={DoubleSide}
            envMap={envMap}
            transparent={true}
            opacity={1}
          />
        </Text>

        // <TextInPic text={text}></TextInPic>
      )}
    </group>
  );
}

function TextInPic({ text = "😎" }) {
  const ref = useRef();

  let { ww, hh, canvas } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 300;

    let ww = canvas.width / 300;
    let hh = canvas.height / 300;

    return { ww, hh, canvas };
  }, [text]);

  useEffect(() => {
    if (ref.current) {
      var font = new window.FontFace(
        "Cronos",
        "url(/font/Cronos-Pro-Light_12448.ttf)"
      );
      font.load().then(() => {
        const ctx = canvas.getContext("2d");
        const canvasTxt = require("canvas-txt").default;

        let mm = canvas.height * 0.05;
        let x = 0;
        let y = -mm;
        let width = canvas.width;
        let height = canvas.height;

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#ffffff";

        canvasTxt.font = "Cronos Pro, Arial";
        canvasTxt.align = "center";
        canvasTxt.vAlign = "bottom"; // middle / top / bottom
        canvasTxt.fontSize = 40;
        canvasTxt.fontWeight = 100;
        canvasTxt.lineHeight = null;
        canvasTxt.debug = false; //shows debug info
        canvasTxt.justify = false;

        canvasTxt.drawText(ctx, text, x, y, width, height);
        ctx.strokeText(ctx, text, x, y, width, height);

        let mat = ref.current?.material;
        if (mat) {
          mat.map = new CanvasTexture(canvas);
          mat.map.generateMipmaps = true;
        }
      });
    }
  }, [canvas, text]);

  return (
    <group>
      <mesh ref={ref} position={[0, hh / 2, 0]}>
        <planeBufferGeometry args={[ww, hh, 2, 2]}></planeBufferGeometry>
        <meshStandardMaterial transparent={true}></meshStandardMaterial>
      </mesh>
    </group>
  );
}
