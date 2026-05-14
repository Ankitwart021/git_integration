import DragDrop from "./components/DragDrop";
import { Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./components/Login";

import AppResourceComponent from "./components/AppResourceComponent";
import "./App.css";
import "./shared-styles.css";
import Codellama from "./components/Codellama";
import Dashboard1 from "./components/Dashboard1";
import { useContext } from "react";
import UserInfoContext from "./context/userContext";
import WorkflowDashboardComponent from "./components/WorkflowDashboardComponent";
import WorkflowDesigner from "./components/WorkflowDesigner";
import ResourceEdit from "./livePreview/components/ResourceEdit";
// import Role from "./components/Role";

function getCookieValue(name: string) {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find(row => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
}
function App() {
  const { userInfo } = useContext(UserInfoContext);
  const jwt = getCookieValue("jwt");
  let userId = null;
  let userName = null;

  if (jwt) {
    try {
      const decodedToken: any = jwtDecode(jwt);
      console.log("decoded token", decodedToken);
      userId = decodedToken.sub;
      userName = decodedToken.name;
      userInfo.setUserId(userId);
      userInfo.setUserName(userName);

    } catch (error) {
      console.error("Failed to decode JWT:", error);

    }
  } else {
    console.error("JWT not found in cookies");
  }
  console.log("userId:", userId);


  return (
    <div className="App">

      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard1 />} />
        <Route path='/:appId/DragDrop' element={<DragDrop />} />
        <Route path="/:appId/resources" element={<AppResourceComponent />} />
        <Route path='/:appId/workflow' element={<WorkflowDashboardComponent/>} />
        <Route path='/:appId/workflow/:workflowId' element={<WorkflowDesigner/>} />
        {/* <Route path="/role" element={<Role/>}/> */}
        <Route path="/codellama" element={<Codellama />} />
        <Route path="/:appId/edit/:id" element={<ResourceEdit />} />
      </Routes>
    </div>
  );
}

export default App;