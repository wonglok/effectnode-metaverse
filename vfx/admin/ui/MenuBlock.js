export function MenuBlock() {
  return (
    <div className="">
      <CardManagement></CardManagement>
    </div>
  );
}

function CardManagement() {
  return (
    <ul className="menu py-4 shadow-lg  bg-base-100 rounded-box">
      <li className="menu-title ">
        <span>System Management</span>
      </li>

      <li className="hover-bordered">
        <a>
          <InfoIcon />
          Link 1
        </a>
      </li>
      <li className="hover-bordered ">
        <a>
          <InfoIcon />
          Link 2
        </a>
      </li>
      <li className="hover-bordered ">
        <a>
          <InfoIcon />
          Link 3
        </a>
      </li>
      <li className="hover-bordered">
        <a>
          <FolderIcon />
          Link 4
        </a>
      </li>
    </ul>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className="inline-block w-5 h-5 mr-2 stroke-current"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className="inline-block w-5 h-5 mr-2 stroke-current"
    >
      {/*  */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      ></path>
      {/*  */}
    </svg>
  );
}
