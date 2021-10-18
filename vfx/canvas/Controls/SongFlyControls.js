import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Audio,
  AudioListener,
  AudioLoader,
  CatmullRomCurve3,
  MathUtils,
  Object3D,
  Vector3,
} from "three";
import { useDrag, useWheel } from "@use-gesture/react";
// import { Now } from "../../store/Now";
import { useAutoEvent } from "../../utils/use-auto-event";
import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";
import { useMiniEngine } from "../../utils/use-mini-engine";
// import { createPortal } from "react-dom";
export function SongFlyControls({
  floor,
  overallSpeed = 2,
  cameraHeight = 1.5,
  loop = true,
}) {
  let { mini } = useMiniEngine();
  let { get, camera } = useThree();
  //
  let fcamera = useMemo(() => {
    let cam = camera.clone();
    return cam;
  }, [camera]);

  let progressSong = useRef(0);

  useEffect(() => {
    let { camera, gl } = get();
    const listener = new AudioListener();
    camera.add(listener);

    //
    let ui = document.createElement("div");
    ui.style.cssText = `
      position:absolute;
      top: calc(50% - 100px / 2);
      left: calc(50% - 100px / 2);
      background: white;
      width: 100px;
      height: 100px;
      padding: 10px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
    `;
    ui.innerText = "Loading...";
    ui.id = "startgame";
    document.body.appendChild(ui);

    const audio = new Audio(listener);

    const audioLoader = new AudioLoader();
    audio.duration = 1;
    audioLoader.load("/song/hallelujah.mp3", (buffer) => {
      audio.duration = buffer.duration;
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.setVolume(0.5);
      // audio.play();
      ui.innerText = "Start Worship Experience";

      ui.addEventListener("click", startWorship);
      ui.addEventListener("touchstart", startWorship);
    });

    let tt = 0;
    let cleanAudio = () => {};
    let startWorship = () => {
      // create a global audio source

      // load a audio and set it as the Audio object's buffer

      cleanAudio = () => {
        audio.pause();
      };

      audio.play();

      pause.style.display = "flex";

      var audioCurrentTime = 0;
      mini.onLoop(() => {
        if (audio.isPlaying) {
          audioCurrentTime = audio.context.currentTime;
        }
        progressSong.current = (audioCurrentTime / audio.duration) * 3.0;
      });

      ui.remove();
    };

    //---- Pause

    let pause = document.createElement("div");
    pause.style.cssText = `
      position:absolute;
      top: 10px;
      left: 10px;
      background: white;
      width: 100px;
      height: 100px;
      padding: 10px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;

    `;
    pause.innerText = "Play / Pause";
    document.body.appendChild(pause);

    pause.style.display = "none";

    let onToggle = () => {
      if (audio.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //
    pause.addEventListener("click", onToggle);
    pause.addEventListener("touchstart", onToggle);

    return () => {
      cleanAudio();
      clearInterval(tt);
      ui.remove();
      pause.remove();
    };
  }, []);

  useEffect(() => {
    //

    //
    //
    //   let divAR = document.createElement("div");
    //   divAR.style.cssText = `
    //   position:absolute;
    //   top: 10px;
    //   right: 10px;
    //   background: white;
    //   width: 100px;
    //   height: 100px;
    //   padding: 10px;
    //   text-align: center;
    //   display: flex;
    //   justify-content: center;
    //   align-items: center;
    //   border-radius: 10px;

    // `;
    //   divAR.id = "arDIV";
    //   divAR.innerText = "AR";
    //   if ("ontouchstart" in window) {
    //     document.body.appendChild(divAR);
    //   }

    let setup = (divAR) => {
      let handleDoc = () => {
        let doc = new DeviceOrientationControls(fcamera);
        doc.enabled = true;
        mini.onLoop(() => {
          doc.update();
        });
        mini.onClean(() => {
          doc.dispose();
        });
        doc.addEventListener("change", () => {
          console.log(123);
        });
      };
      let onClick = () => {
        // feature detect
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission()
            .then((permissionState) => {
              if (permissionState === "granted") {
                handleDoc();
              }
            })
            .catch(console.error);
        } else {
          handleDoc();
          // handle regular non iOS 13+ devices
        }
      };
      divAR.addEventListener("click", onClick);
      divAR.addEventListener("touchstart", onClick);
      divAR.addEventListener("touchend", onClick);
    };

    let tt = setInterval(() => {
      let div = document.querySelector("#startgame");
      if (div) {
        clearInterval(tt);
        setup(div);
      }
    }, 0);

    return () => {};
  }, [fcamera]);

  let nameList = [];
  floor.traverse((it) => {
    if (it.name.indexOf("walk") === 0) {
      nameList.push(it.name);
    }
  });

  let pts = nameList.map((e) => {
    let obj = floor.getObjectByName(e) || new Object3D();
    return obj.position;
  });

  let roll = useMemo(() => {
    if (pts.length === 0) {
      return false;
    }
    return new CatmullRomCurve3(pts, loop, "catmullrom", 1);
  }, [pts, loop]);

  console.log(pts);

  let progress = useRef(0);

  get().gl.domElement.style.touchAction = "none";

  let speed = 0.003;
  //
  useDrag(
    (state) => {
      state.event.preventDefault();

      let change = state.movement[1] || 0;
      let delta = change / -100;

      if (delta >= speed) {
        delta = speed;
      }
      if (delta <= -speed) {
        delta = -speed;
      }

      progress.current += delta * overallSpeed;
    },
    {
      target: get().gl.domElement,
      eventOptions: {
        passive: false,
      },
    }
  );

  useWheel(
    (state) => {
      state.event.preventDefault();

      let change = state.delta[1] || 0;
      let delta = change / -300;

      if (delta >= speed) {
        delta = speed;
      }

      if (delta <= -speed) {
        delta = -speed;
      }

      progress.current += delta * overallSpeed * 0.8;
    },
    {
      target: get().gl.domElement,
      eventOptions: {
        passive: false,
      },
    }
  );

  useAutoEvent("touchstart", (ev) => {
    ev.preventDefault();
  });
  useAutoEvent("touchmove", (ev) => {
    ev.preventDefault();
  });
  useAutoEvent("touchend", (ev) => {
    ev.preventDefault();
  });

  // let lv = progress.current;
  let at = new Vector3();
  let at2 = new Vector3();

  //
  let lv = 0;
  useFrame(({ camera, scene }) => {
    // if (progressSong.current) {
    //   progress.current = progressSong.current;
    // } else if (loop) {
    // } else {
    //   progress.current = progress.current % 1;
    //   progress.current = Math.abs(progress.current);
    // }

    progressSong.current += progress.current;

    lv = MathUtils.lerp(lv, progressSong.current, 0.1);

    progress.current *= 0.9;

    // lv = MathUtils.lerp(lv, progress.current, 0.18);
    if (!roll) {
      return;
    }

    // if (lv <= 0) {
    //   lv = 0;
    // }

    roll.getPoint(lv, at);
    roll.getPoint(lv + 0.03, at2);

    camera.position.copy(at);
    camera.lookAt(at2.x, at2.y, at2.z);
    camera.rotation.y += fcamera.rotation.y;
  });

  useEffect(() => {
    get().scene.add(get().camera);
    return () => {
      get().scene.remove(get().camera);
    };
  }, []);

  return (
    <group>
      {createPortal(
        <group>
          {/* <pointLight intensity={2}></pointLight> */}
          {/* <directionalLight
            intensity={1}
            position={[0, 0, 1]}
          ></directionalLight> */}
        </group>,
        get().camera
      )}

      {/*  */}
      {/*  */}
    </group>
  );
}
