import { CMSOnePage } from "effectnode-cms";
import { getCodes, firebaseConfig } from "../vfx-effectnode";

export default function OnePageDemo() {
  return <CMSOnePage firebaseConfig={firebaseConfig} codes={getCodes()} />;
}
