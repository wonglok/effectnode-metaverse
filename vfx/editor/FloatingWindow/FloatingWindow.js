import { useEffect, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { applyAutoEvent } from "../../utils/use-auto-event";

export default function FloatingWindow(props) {
  let [init, setInit] = useState(false);

  useEffect(() => {
    setInit(props.config().win);

    let clean = applyAutoEvent(window, "resize", () => {
      let { win, onResetResize } = props.config();

      if (onResetResize) {
        setInit(win);
      }
    });
    return () => {
      clean();
    };
  }, [props.config]);

  return (
    (init && (
      <FloatingWindowInternal {...props} init={init}>
        {props.children}
      </FloatingWindowInternal>
    )) ||
    null
  );
}

function FloatingWindowInternal({ title = "win title", children, init = [] }) {
  let st = useRef({ ax: 0, ay: 0 });
  let ref = useRef();

  useEffect(() => {
    st.current.ax = init[0];
    st.current.ay = init[1];

    ref.current.style.transform = `translate3d(${st.current.ax}px, ${st.current.ay}px, 0px)`;
  }, [init]);
  // Set the drag hook and define component movement based on gesture data.
  const bind = useDrag(({ down, delta: [dx, dy], movement: [mx, my] }) => {
    st.current.ax += dx;
    st.current.ay += dy;
    ref.current.style.transform = `translate3d(${st.current.ax}px, ${st.current.ay}px, 0px)`;
  });

  // Bind it to a component.
  return (
    <div ref={ref} style={{ position: "absolute" }}>
      <div
        {...bind()}
        className={"bg-blue-300 py-1 text-xs pl-1"}
        style={{ touchAction: "none", userSelect: "none" }}
      >
        {title}
      </div>
      <div
        className="border bg-white"
        style={{
          width: `${init[2]}px`,
          height: `${init[3]}px`,
          maxHeight: `calc(100vh - 30px * 2 - 35px * 2 - 30px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
