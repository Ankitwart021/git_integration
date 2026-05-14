// import "../navbar.css";
import { generateFullAppZip } from "../api/generateAppzip";
import UserInfoContext from "../context/userContext";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const DownloadSave = ({ handleDownload, duplicatePage }: any) => {
  const { userInfo } = useContext(UserInfoContext);
  const {appId} = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateApp = async () => {
    if (!appId) {
      toast.error("Application ID not found.");
      return;
    }
    setIsLoading(true);
    try {
      const blob = await generateFullAppZip(appId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application-${appId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Backend app generated and downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to generate backend app: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex gap-1 col-4 justify-content-end ">
      <div className="dropdown">
        <button
          className="primary-btn dropdown-toggle me-2"
          type="button"
          id="actionsDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa fa-cogs me-2" aria-hidden="true"></i>
          Actions
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="actionsDropdown">
          {/* <li>
            <button className="dropdown-item" onClick={duplicatePage}>
              <i className="fa fa-copy me-2" aria-hidden="true"></i>
              Duplicate Page
            </button>
          </li> */}
          <li>
            <button className="dropdown-item" onClick={() => handleDownload(userInfo, "save",appId)}>
              <i className="fa fa-floppy-o me-2" aria-hidden="true"></i>
              Save
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => handleDownload(userInfo, "download",appId)}>
              <i className="fa fa-download me-2" aria-hidden="true"></i>
              Download
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => handleDownload(userInfo, "save&download",appId)}>
              <i className="fa fa-download me-2" aria-hidden="true"></i>
              Save & Download
            </button>
          </li>
           <li>
            <button className="dropdown-item" onClick={handleGenerateApp} disabled={isLoading}>
              <i className="fa fa-cogs me-2" aria-hidden="true"></i>
              {isLoading ? 'Generating...' : 'Download Full App'}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadSave;
