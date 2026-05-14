/**
 * Profile Component
 * -----------------
 *
 * What it does:
 *  - Renders a user profile dropdown menu with the user's name.
 *  - Provides a sign-out button that logs the user out of the application.
 *
 * Where it is used:
 *  - Used in the navigation bar (`Navbar2` component) at the top of the main editor UI.
 *  - Appears in pages like `DragDrop` and resource management routes.
 *
 * @param {string} userName - The current user's name to display in the profile dropdown.
 *
 * @return {JSX.Element} The rendered profile dropdown menu with sign-out option.
 */

import React from "react";
import { DashboardProps } from "./Dashboard1";
import "../dashboard.css";
import style from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark";

const Profile: React.FC<DashboardProps> = ({ userName }: any) => {
  const isDashboard = window.location.pathname === "/dashboard";


  const handleSignOut = () => {
    window.location.href = "http://localhost:8000/auth/signout";
  };

  return (
    <div className="dropdown">
      <button
        // className="btn btn-dark dropdown-toggle border rounded try-ai-btn"
        className={
          isDashboard
            ? "btn btn-dark dropdown-toggle border rounded try-ai-btn"
            : "btn btn-dark dropdown-toggle border rounded"
        }
        type="button"
        id="profileDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fa fa-user mx-1 "></i>{userName}
      </button>
      <ul className="dropdown-menu dropdown-menu-light "
        style={
          isDashboard
            ? { background: "var(--dash-accent-gradient)" }
            : {}
        }
        aria-labelledby="profileDropdown">
        <li>
          <button className="dropdown-item text-danger" onClick={handleSignOut}
          >
            <i className="fa fa-sign-out p-1" aria-hidden="true"></i>Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
};


export default Profile;
