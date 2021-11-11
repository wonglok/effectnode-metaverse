import { Lab } from "../Lab/Lab";

export default function LowBar() {
  Lab.makeKeyReactive("winPreview");
  Lab.makeKeyReactive("winAsset");
  //
  //

  //
  return (
    <div className="bg-gray-300 text-xs h-full w-full flex items-center justify-between">
      <div className="w-full h-full">
        <div
          className={`h-full inline-flex items-center px-3 select-none cursor-pointer ${
            Lab.winPreview ? "bg-green-300" : "bg-gray-200"
          }`}
          onClick={() => {
            Lab.winPreview = !Lab.winPreview;
          }}
        >
          Preview Window: {Lab.winPreview ? "ON" : "OFF"}
        </div>

        <div
          className={`h-full inline-flex items-center px-3 select-none cursor-pointer ${
            Lab.winAsset ? "bg-green-300" : "bg-gray-200"
          }`}
          onClick={() => {
            Lab.winAsset = !Lab.winAsset;
          }}
        >
          Asset Window: {Lab.winAsset ? "ON" : "OFF"}
        </div>
      </div>
      <div className=" w-72 text-right pr-3">Made at Than you Jesus Church</div>
    </div>
  );
}
