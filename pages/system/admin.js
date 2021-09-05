import { useRouter } from "next/dist/client/router";
import { AdminGate } from "../../vfx-cms/common/AdminGate";
import { logout } from "../../vfx-firebase/firelib.js";
export default function Admin() {
  let router = useRouter();
  return (
    <AdminGate>
      <div>Admin Page</div>
      <button
        onClick={() => {
          //
          logout().then(() => {
            router.push("/system/login?logout=successful");
          });
        }}
      >
        Logout
      </button>
      <div>Cards Info</div>
    </AdminGate>
  );
}

//

//

//
