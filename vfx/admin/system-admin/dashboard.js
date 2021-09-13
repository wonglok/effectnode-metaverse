import { MenuBlock } from "../ui/MenuBlock";
import { NavBar } from "../ui/Navbar";
import { GlassBlock } from "../ui/GlassBlock";

export function Dashboard() {
  return (
    <div className="p-3 lg:p-5 bg-base-100">
      <NavBar />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-2 lg:col-span-1">
          {/* <WelcomeBack></WelcomeBack> */}
          <MenuBlock></MenuBlock>
        </div>

        <div className="col-span-2">
          <GlassBlock></GlassBlock>
        </div>
      </div>
    </div>
  );
}
