import { MyPreviewCanvas } from "../MyPreviewCanvas/MyPreviewCanvas";

export function TabPreview() {
  return (
    <div className="w-full bg-gray-100 h-full">
      {/* <h1
        className="text-xl px-5 bg-gray-900 text-white flex items-center justify-between w-full"
        style={{ height: `4rem` }}
      >
        <span className="text-xl">My Avatar</span>
      </h1> */}

      <div className="bg-white" style={{ height: `calc(100% - 0.0 * 4rem)` }}>
        <MyPreviewCanvas></MyPreviewCanvas>
      </div>
    </div>
  );
}

//

//
