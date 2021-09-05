import { Text } from "@react-three/drei";
import { Card } from "../CardOOBE/Card";

//
export function HeroText() {
  Card.makeKeyReactive("centerText");
  return (
    <group>
      <Text
        font={`/font/trivial/Trivial-Regular.otf`}
        // rotation={[Math.PI * -0.25, 0, 0]}
        maxWidth={1.3}
        position={[0, 0.5, 0.14]}
        fontSize={0.12}
        color={"white"}
        outlineBlur={0.005}
        outlineWidth={0.005}
        outlineColor={"black"}
        textAlign={"center"}
      >
        {Card.centerText}
      </Text>
    </group>
  );
}
