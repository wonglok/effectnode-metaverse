import { TellStoryCanvas } from "../TellStoryCanvas/TellStoryCanvas";

export function TabTellStory() {
  return (
    <div className="w-full bg-gray-100 h-full">
      <h1
        className="text-xl px-5 bg-gray-900 text-white flex items-center justify-between w-full"
        style={{ height: ` 0rem` }}
      >
        <span className="text-xs">Tell Story</span>

        {/* <span
          onClick={() => {}}
          className=" text-sm cursor-pointer rounded-full px-3 py-1 border border-green-300 text-white bg-green-300 shadow-lg "
        >
          Submit
        </span> */}
      </h1>

      <div className="bg-white" style={{ height: `calc(100% -  0rem)` }}>
        <TellStoryCanvas></TellStoryCanvas>
      </div>
    </div>
  );
}

//
