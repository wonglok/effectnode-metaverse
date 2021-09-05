import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BackSide, Object3D, Vector3 } from "three";
import { onReady } from "../../vfx-firebase/firelib";
import { useEnvLight } from "../../vfx-content/Use/useEnvLight.js";
import { Actions } from "../Actions/Actions";
import router, { useRouter } from "next/router";
import { LoadingAvatar, makePlayBack, MySelf } from "./MySelf";

export function TellStoryCanvas({ holder = "genesis-story-teller-1" }) {
  let PlaybackState = useMemo(() => {
    return makePlayBack();
  }, []);

  let scrollerRef = useRef();
  useEffect(() => {
    let scrollToBottom = () => {
      let div = scrollerRef.current;
      if (div) {
        div.scrollTop = div.scrollHeight;
      }
    };
    window.addEventListener("scroll-div-to-bottom", scrollToBottom);
    return () => {
      window.removeEventListener("scroll-div-to-bottom", scrollToBottom);
    };
  });

  return (
    <div className="h-full w-full relative block lg:flex lg:flex-row">
      <Canvas
        className=" lg:h-full  lg:order-3 lg:w-9/12"
        concurrent
        onCreated={(st) => {
          st.gl.physicallyCorrectLights = true;
        }}
        style={
          window.innerWidth < 1024
            ? {
                height: `calc(25%)`,
              }
            : {}
        }
        dpr={[1, 3]}
      >
        <Suspense fallback={<LoadingAvatar></LoadingAvatar>}>
          <Content PlaybackState={PlaybackState} holder={holder}></Content>
        </Suspense>
        <MyCamera></MyCamera>
      </Canvas>
      <div
        ref={scrollerRef}
        style={
          window.innerWidth < 1024
            ? {
                height: `calc(75%)`,
              }
            : {
                minWidth: "255px",
              }
        }
        className=" order-2 lg:h-full overflow-scroll"
      >
        <SentencesList
          PlaybackState={PlaybackState}
          holder={holder}
        ></SentencesList>
        {/*  */}
      </div>
    </div>
  );
}

// card-stroy-draft

function Content({ holder, PlaybackState }) {
  let { envMap } = useEnvLight({});

  return (
    <group>
      <pointLight intensity={30} position={[-10, 10, 10]}></pointLight>

      <directionalLight
        intensity={1}
        position={[10, 10, 10]}
      ></directionalLight>

      <directionalLight
        intensity={2}
        position={[-10, 10, -10]}
      ></directionalLight>

      <mesh position={[0, 0, 0]}>
        <sphereBufferGeometry args={[8, 32, 32]}></sphereBufferGeometry>
        <meshBasicMaterial
          envMap={envMap}
          side={BackSide}
          color={"#fff"}
        ></meshBasicMaterial>
      </mesh>

      <MySelf
        envMap={envMap}
        holder={holder}
        PlaybackState={PlaybackState}
      ></MySelf>
    </group>
  );
}

let addSentence = ({ router, holder, PlaybackState }) => {
  onReady().then(async ({ db, user }) => {
    //
    let draft = db
      .ref(`/card-stroy-draft`)
      .child(router.query.cardID)
      .child(holder)
      .child("sentences");
    let newObj = draft.push();

    let snap = await draft.get();
    let num = snap.numChildren();

    newObj.set({
      order: num + 1,
      signature: Actions[1].signature,
      sentence: "I'm excited!!!",
      repeat: 1,
      addons: [],
    });

    PlaybackState.cursor = num + 1;
    PlaybackState.reload = Math.random();
    window.dispatchEvent(new Event("scroll-div-to-bottom"));
  });
};

function SentencesList({ holder, PlaybackState }) {
  let router = useRouter();

  let [actions, setActions] = useState([]);
  useEffect(() => {
    let clean = [];
    onReady().then(async ({ db, user }) => {
      //
      let sentences = db
        .ref(`/card-stroy-draft`)
        .child(router.query.cardID)
        .child(holder)
        .child("sentences");

      let snap = await sentences.get();
      let num = snap.numChildren();

      // console.log(num);

      if (num === 0) {
        addSentence({ router, holder, PlaybackState });
      }

      let cleanup = sentences.on("value", (snapshot) => {
        if (snapshot) {
          let arr = [];
          snapshot.forEach((sub) => {
            if (sub) {
              arr.push({
                firekey: sub.key,
                fireval: sub.val(),
              });
            }
          });
          setActions(arr);
        }
      });

      clean.push(cleanup);
    });

    return () => {
      clean.forEach((e) => e());
    };
  }, []);

  return (
    <div>
      <CreateSentence
        holder={holder}
        PlaybackState={PlaybackState}
      ></CreateSentence>
      <PlaybackControls PlaybackState={PlaybackState}></PlaybackControls>
      {actions.map((a, idx) => {
        return (
          <Sentence
            idx={idx}
            key={a.firekey}
            firekey={a.firekey}
            data={a.fireval}
            holder={holder}
            PlaybackState={PlaybackState}
          ></Sentence>
        );
      })}
    </div>
  );
}

function CreateSentence({ holder, PlaybackState }) {
  let router = useRouter();
  return (
    <div
      className="p-3 py-4 lg:py-$ text-center boder bg-blue-400 text-white cursor-pointer"
      onClick={() => {
        addSentence({ router, holder, PlaybackState });
      }}
    >
      + Add Sentence
    </div>
  );
}

function PlaybackControls({ PlaybackState }) {
  PlaybackState.makeKeyReactive("autoPlayNext");
  return (
    <div
      className={`p-3 text-center ${
        PlaybackState.autoPlayNext ? "bg-green-500" : "bg-purple-500"
      }`}
    >
      <div className={`inline-block p-3 mr-3 text-white`}>
        Playback: {PlaybackState.autoPlayNext ? "AutoPlay" : "Looping"}
      </div>
      <div
        className="inline-block py-1 p-3 border cursor-pointer bg-white  rounded-md mr-3"
        onClick={() => {
          PlaybackState.cursor = 0;
          PlaybackState.forceLoopActions = false;
          PlaybackState.autoPlayNext = true;
          PlaybackState.reload = Math.random();
        }}
      >
        Play from beginning
      </div>
    </div>
  );
}

function Sentence({ data, holder, firekey, idx, PlaybackState }) {
  let refTextArea = useRef();
  PlaybackState.makeKeyReactive("cursor");
  PlaybackState.makeKeyReactive("actionKey");
  PlaybackState.makeKeyReactive("autoPlayNext");

  let saveText = (text = "") => {
    onReady().then(({ db, user }) => {
      db.ref(`/card-stroy-draft`)
        .child(router.query.cardID)
        .child(holder)
        .child("sentences")
        .child(firekey)
        .child("sentence")
        .set(text);
    });
  };

  let remove = ({ firekey }) => {
    onReady().then(({ db }) => {
      db.ref(`/card-stroy-draft`)
        .child(router.query.cardID)
        .child(holder)
        .child("sentences")
        .child(firekey)
        .remove();
    });
  };

  useEffect(() => {
    let last = false;
    let tt = setInterval(() => {
      if (last && refTextArea.current) {
        if (last !== refTextArea.current.value) {
          saveText(refTextArea.current.value);
          last = refTextArea.current.value;
        }
      }
    }, 1000);

    return () => {
      last = false;
      clearInterval(tt);
    };
  }, []);

  let [confirm, setConfrim] = useState("Remove");
  return (
    <div
      onClick={() => {
        PlaybackState.autoPlayNext = false;
        PlaybackState.cursor = idx;
        PlaybackState.forceLoopActions = Infinity;
        PlaybackState.reload = Math.random();
      }}
      className={
        (PlaybackState.actionKey === firekey
          ? PlaybackState.autoPlayNext
            ? "bg-green-200"
            : "bg-purple-200"
          : "bg-gray-200") + ` px-2 py-3`
      }
    >
      <select
        className="mb-3"
        defaultValue={data.signature}
        onChange={(ev) => {
          onReady().then(({ db, user }) => {
            db.ref(`/card-stroy-draft`)
              .child(router.query.cardID)
              .child(holder)
              .child("sentences")
              .child(firekey)
              .child("signature")
              .set(ev.target.value);
          });
        }}
      >
        {Actions.map((act) => {
          return (
            <option key={act.signature} value={act.signature}>
              {act.name}
            </option>
          );
        })}
      </select>
      <button
        className="inline-block px-2 ml-3 bg-white text-black"
        onClick={() => {
          saveText(refTextArea.current.value);
        }}
      >
        Save
      </button>

      <button
        className="inline-block px-2 ml-3 bg-white text-black"
        onClick={() => {
          if (confirm === "Remove") {
            setConfrim("Confirm");
          } else if (confirm === "Confirm") {
            remove({ firekey });
            //
            PlaybackState.cursor = 0;
            PlaybackState.forceLoopActions = false;
            PlaybackState.autoPlayNext = true;
            PlaybackState.reload = Math.random();
            setConfrim("Remove");
          }
        }}
      >
        {confirm}
      </button>

      {confirm === "Confirm" && (
        <button
          className="inline-block px-2 ml-3 bg-white text-black"
          onClick={() => {
            setConfrim("Remove");
          }}
        >
          Cancel
        </button>
      )}

      <textarea
        ref={refTextArea}
        className="w-full h-24 p-3"
        defaultValue={data.sentence}
        onBlur={() => {
          saveText(refTextArea.current.value);
        }}
        onKeyDown={(ev) => {
          if (ev.key.toLowerCase() === "s" && ev.metaKey) {
            ev.preventDefault();
            saveText(ev.target.value);
          }
          if (ev.key.toLowerCase() === "enter" && ev.metaKey) {
            ev.preventDefault();
            saveText(ev.target.value);
          }
        }}
      ></textarea>

      {/* <pre>{JSON.stringify(data)}</pre> */}
    </div>
  );
}

function MyCamera({}) {
  let { camera } = useThree();
  useEffect(() => {
    camera.near = 0.1;
    camera.far = 5000;
    camera.fov = 35;
    camera.updateProjectionMatrix();
  }, [camera]);

  let lookAt = new Vector3(0, 0, 0);
  let lookAtlerp = new Vector3(0, 0, 0);
  let lookAtInfluence = new Object3D();
  let lookAtInfluenceNow = new Object3D();
  let corePos = new Vector3();

  useFrame(({ get }) => {
    let { camera, scene, mouse } = get();

    camera.rotation.set(0, 0, 0);
    camera.position.x = 0;
    camera.position.y = 1.5;
    camera.position.z = 5;
    camera.lookAt(0, 1.25, 0);

    let avatar = scene.getObjectByName("avatar");
    if (avatar) {
      let coreTarget = avatar.getObjectByName("Head");
      if (coreTarget) {
        coreTarget.getWorldPosition(corePos);

        //
        lookAt.set(mouse.x * 30, mouse.y * 30 + corePos.y, 40);
        lookAtlerp.lerp(lookAt, 0.5);
        lookAtInfluence.lookAt(lookAtlerp);

        lookAtInfluenceNow.quaternion.slerp(lookAtInfluence.quaternion, 0.5);
        coreTarget.quaternion.slerp(lookAtInfluenceNow.quaternion, 0.5);
      }
    }
  });
  return <group>{/* <OrbitControls></OrbitControls> */}</group>;
}
