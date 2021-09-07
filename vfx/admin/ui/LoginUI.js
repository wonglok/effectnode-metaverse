import { loginGoogle } from "../../firebase/firelib";

export function LoginUI({ onDone, onFail }) {
  //
  return (
    <div>
      <div className="text-center py-3">Please Login...</div>
      <button
        className=" p-3 px-6 bg-blue-600 text-white border border-white"
        onClick={() => {
          //
          loginGoogle().then(onDone, onFail);
        }}
      >
        Login with Google
      </button>
    </div>
  );
}
