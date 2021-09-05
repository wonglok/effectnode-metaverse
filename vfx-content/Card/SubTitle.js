import { Text } from "@react-three/drei";
import { Card } from "../CardOOBE/Card";

export function Subtitle() {
  Card.makeKeyReactive("bottomText");
  return (
    <group>
      <Text
        font={`/font/trivial/Trivial-Regular.otf`}
        // rotation={[Math.PI * -0.25, 0, 0]}
        maxWidth={1.6}
        position={[0, -0.9, 0.15]}
        fontSize={0.09}
        color={"white"}
        outlineBlur={0.005}
        outlineWidth={0.005}
        outlineColor={"black"}
        textAlign={"center"}
      >
        {Card.bottomText}
      </Text>
    </group>
  );
}
