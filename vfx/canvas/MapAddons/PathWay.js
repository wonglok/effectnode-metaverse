import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Color, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { useFrame, useThree } from "@react-three/fiber";
export function PathWay({ floor, loop = true }) {
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

  const lineMat = useMemo(() => {
    const material = new LineMaterial({
      transparent: true,
      color: new Color("#00ffff"),
      linewidth: 0.0015 * 3,
      opacity: 0.8,
      dashed: true,
      vertexColors: true,
    });

    return material;
  }, []);

  let works = useRef({});

  let mesh = useMemo(() => {
    let lineGeo = getGeo({ roll });

    const mesh = new Line2(lineGeo, lineMat);
    mesh.computeLineDistances();

    mesh.userData.enableBloom = true;

    return mesh;
  }, []);

  useEffect(() => {
    let lineGeo = getGeo({ roll });
    mesh.geometry = lineGeo;

    //
  }, [roll]);

  useFrame(() => {
    Object.values(works.current).forEach((w) => w());
  });

  return (
    <group>
      <primitive object={mesh}></primitive>
    </group>
  );
}

export const getGeo = ({ roll, dotted = false }) => {
  const curvePts = roll;

  let lineGeo = new LineGeometry();
  if (dotted) {
    lineGeo = new LineSegmentsGeometry();
  }
  let colors = [];
  let pos = [];
  let count = 500;
  let temp = new Vector3();

  let colorA = new Color();
  let colorB = new Color("#0000ff");

  // color1: { value: new Color("#01187C") },
  //   color2: { value: new Color("#BE56FF") },

  for (let i = 0; i < count; i++) {
    curvePts.getPoint((i / count) % 1, temp);
    if (isNaN(temp.x)) {
      temp.x = 0.0;
    }
    if (isNaN(temp.y)) {
      temp.y = 0.0;
    }
    if (isNaN(temp.z)) {
      temp.z = 0.0;
    }

    // pos.push(temp.x, temp.y, temp.z);
    pos.push(temp.x, 0.15, temp.z);
    colorA.setStyle("#ffffff");
    colorA.lerp(colorB, i / count);

    //
    colorA.offsetHSL(0, 0.5, 0.0);
    colors.push(colorA.r, colorA.g, colorA.b);
  }

  lineGeo.setColors(colors);

  lineGeo.setPositions(pos);
  return lineGeo;
};
