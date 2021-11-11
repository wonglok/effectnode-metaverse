import { useEffect, useRef, useState } from "react";
import LowBar from "../LowBar/LowBar";
import TopBar from "../TopBar/TopBar";
import CanvasWork from "../CanvasWork/CanvasWork";
import CanvasPreview from "../CanvasPreview/CanvasPreview";
import { useDrag } from "@use-gesture/react";
import { Vector2 } from "three";
import FloatingWindow from "../FloatingWindow/FloatingWindow";
import { Lab } from "../Lab/Lab";
import AssetWindow from "../AssetWindow/AssetWindow";

export default function GravityLab() {
  return (
    <OnlyDesktop>
      <TopMiddleBottom>
        <FloatingLayout></FloatingLayout>
      </TopMiddleBottom>
    </OnlyDesktop>
  );
}

function OnlyDesktop({ children }) {
  return (
    <div className="h-full w-full">
      <div className="block lg:hidden h-full w-full">
        <div className="h-full w-full flex items-center justify-center">
          Please use lab editor on a computer screen
        </div>
      </div>
      <div className="hidden lg:block w-full h-full">{children}</div>
    </div>
  );
}

function TopMiddleBottom({ children }) {
  return (
    <>
      <div className="w-full h-full">
        <div style={{ width: "100%", height: "35px" }}>
          <TopBar></TopBar>
        </div>
        <div style={{ width: "100%", height: "calc(100% - 35px * 2)" }}>
          {children}
          {/* <MajorMinorColums></MajorMinorColums> */}
        </div>
        <div style={{ width: "100%", height: "35px" }}>
          <LowBar></LowBar>
        </div>
      </div>
    </>
  );
}

function FloatingLayout() {
  Lab.makeKeyReactive("tabs");
  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full absolute bg-gray-50">
        <CanvasWork></CanvasWork>
      </div>
      <SelfSwitch self={"winPreview"}>
        <FloatingWindow
          title={`Preview`}
          config={() => {
            return {
              win: [window.innerWidth - 414 - 30, 30, 414, 896],
              onResetResize: true,
            };
          }}
        >
          <CanvasPreview></CanvasPreview>
        </FloatingWindow>
      </SelfSwitch>

      <SelfSwitch self={"winAsset"}>
        <FloatingWindow
          title={`Asset Window`}
          config={() => {
            return {
              win: [30, 30, 414, 896],
              onResetResize: false,
            };
          }}
        >
          <AssetWindow />
        </FloatingWindow>
      </SelfSwitch>
    </div>
  );
}

function SelfSwitch({ self, others = [], children }) {
  Lab.makeKeyReactive(self);

  useEffect(() => {
    //
    others = others.filter((ot) => self !== ot);
    if (others.length > 0) {
      if (Lab[self] === true) {
        others.forEach((kn) => {
          Lab[kn] = false;
        });
      }
    }
  }, [others]);

  return (Lab[self] && children) || null;
}
