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
// import { createPortal } from "react-dom";
export function SongFlyControls({
  floor,
  overallSpeed = 2,
  cameraHeight = 1.5,
  loop = true,
}) {
  let { get } = useThree();
  //

  let progressSong = useRef(0);
  useEffect(() => {
    let { camera, gl } = get();
    const listener = new AudioListener();
    camera.add(listener);

    //
    let ui = document.createElement("div");
    document.body.appendChild(ui);
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
    `;
    ui.innerText = "Start Worship Experience";

    let tt = 0;
    let cleanAudio = () => {};
    let startWorship = () => {
      // create a global audio source
      const audio = new Audio(listener);

      // load a audio and set it as the Audio object's buffer
      const audioLoader = new AudioLoader();
      audio.duration = 1;
      audioLoader.load("/song/hallelujah.mp3", (buffer) => {
        audio.duration = buffer.duration;
        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.setVolume(0.5);
        audio.play();
      });

      cleanAudio = () => {
        audio.pause();
      };

      var audioCurrentTime = 0;
      tt = setInterval(() => {
        if (audio.isPlaying) {
          audioCurrentTime = audio.context.currentTime;
        }

        console.log(audioCurrentTime / audio.duration);

        progressSong.current = audioCurrentTime / audio.duration;
      }, 1 / 60);

      ui.remove();
    };
    ui.addEventListener("click", startWorship);
    ui.addEventListener("touchstart", startWorship);

    return () => {
      cleanAudio();
      clearInterval(tt);
      ui.remove();
    };
  }, []);

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
    return new CatmullRomCurve3(pts, loop, "catmullrom", 0.8);
  }, [pts, loop]);

  console.log(pts);

  let progress = useRef(0);

  get().gl.domElement.style.touchAction = "none";

  let speed = 0.003;
  //
  // useDrag(
  //   (state) => {
  //     state.event.preventDefault();

  //     let change = state.movement[1] || 0;
  //     let delta = change / -100;

  //     if (delta >= speed) {
  //       delta = speed;
  //     }
  //     if (delta <= -speed) {
  //       delta = -speed;
  //     }

  //     progress.current += delta * overallSpeed;
  //   },
  //   {
  //     target: get().gl.domElement,
  //     eventOptions: {
  //       passive: false,
  //     },
  //   }
  // );

  // useWheel(
  //   (state) => {
  //     state.event.preventDefault();

  //     let change = state.delta[1] || 0;
  //     let delta = change / -300;

  //     if (delta >= speed) {
  //       delta = speed;
  //     }

  //     if (delta <= -speed) {
  //       delta = -speed;
  //     }

  //     progress.current += delta * overallSpeed * 0.3;
  //   },
  //   {
  //     target: get().gl.domElement,
  //     eventOptions: {
  //       passive: false,
  //     },
  //   }
  // );

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
    if (progressSong.current) {
      progress.current = progressSong.current;
    } else if (loop) {
    } else {
      progress.current = progress.current % 1;
      progress.current = Math.abs(progress.current);
    }

    lv = MathUtils.lerp(lv, progress.current, 0.1);
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
