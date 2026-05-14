/**
 * EditPage Component
 * ------------------
 *
 * What it does:
 *  - Provides a UI for renaming the current page in the application.
 *  - Allows the user to input a new page name and save it.
 *  - Handles updating the page name in the user context and triggers a save operation.
 *  - Deletes the old page entry after renaming.
 *
 * Where it is used:
 *  - Used in the right sidebar of the `DragDrop` page (`src/components/DragDrop.tsx`), shown when editing a page.
 *
 * @param {string} selectedPage - The currently selected page name.
 * @param {function} setSelectedPage - Callback to update the selected page name after renaming.
 *
 * @return {JSX.Element} The rendered UI for renaming and saving the page name.
 */

import { useContext, useEffect, useState } from 'react'
import UserInfoContext from "../context/userContext";
import { handleDownload } from "../utils/utils";
import apiConfig from '../config/apiConfig';
import "../resources.css";

const EditPage = ({ pageToEdit, setPageToEdit , setSelectedPage, handleClose}: any) => {
    const { userInfo } = useContext(UserInfoContext);
    const [newPageName, setNewPageName] = useState<string>("");
    const [newPage, setNewPage] = useState("");

    // Delete Page
    // const handlePageDelete = async (applicationName: any, pageName: any) => {
    //     console.log("pageName", pageName);
    //     try {
    //         const response = await fetch(
    //             `http://localhost:8000/api/deletePage/${applicationName}/${pageName}`,
    //             {
    //                 method: "DELETE",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 credentials: "include",
    //             }
    //         );
    //         if (response.status === 401) {
    //             window.location.href = apiConfig.LOGIN_URL;
    //         }
    //         if (response.ok) {
    //             console.log("Pages updated successfully");
    //             // save App with new page name
    //             handleDownload(userInfo, "save", userInfo.getCurrentApplication()?.getId() ?? "");
    //         } else {
    //             console.error("Failed to delete page:", response.statusText);

    //         }
    //     } catch (error) {
    //         console.error("Error during deletion:", error);
    //     }
    // };
    // set new page name
    // const handleSetName = () => {
    //     const newPage = newPageName;
    //     const oldPageName: any = userInfo.getCurrentPage()?.getName();
    //     const currApp: any = userInfo.getCurrentApplication()?.getName();
    //     console.log("new page name", newPage);
    //     setNewPage(newPage)
    //     setSelectedPage(newPage);
    //     userInfo.getCurrentPage()?.setName(newPage)

    //     handleDownload(userInfo, "save", userInfo.getCurrentApplication()?.getId() ?? "");
    //     // handlePageDelete(currApp, oldPageName)

    // }
    useEffect(() => {
        setNewPageName(pageToEdit || "");
    }, [pageToEdit]);
    const handleSetName = () => {
        const currentPageObj = userInfo.getPageByName(pageToEdit);
        if (!currentPageObj) return;

        // Update name in the page object
        currentPageObj.setName(newPageName);

        // Optionally save the app
        handleDownload(userInfo, "save", userInfo.getCurrentApplication()?.getId() ?? "");
       setSelectedPage((prev: string) => (prev === pageToEdit ? newPageName : prev));
        // Update UI
        handleClose(); // close editor
    };


    return (
        <>
            <div className="modal fade show rasp-modal modern-modal-overlay" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered modern-modal-dialog" style={{maxWidth: '500px'}}>
                    <div className="modal-content modern-modal-content">
                        <div className="modal-header modern-modal-header">
                            <div className="modal-header-content">
                                <i className="fa fa-pencil-square-o modal-header-icon" />
                                <div>
                                    <h5 className="modal-title">Rename Page</h5>
                                    <div className="modal-subtitle">Enter a new name for this page</div>
                                </div>
                            </div>
                            <button type="button" className="btn-close  text-white" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body modern-modal-body">
                            <div className="form-group">
                                <label className="form-label">Page Name</label>
                                <input
                                    type="text"
                                    className="form-control modern-form-input"
                                    value={newPageName}
                                    onChange={(e) => setNewPageName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSetName();
                                        if (e.key === "Escape") handleClose();
                                    }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer modern-modal-footer">
                            <div className="footer-info">
                                <i className="fa fa-info-circle" />
                                <span>Changes are saved automatically</span>
                            </div>
                            <div className="footer-actions">
                                <button type="button" className="subtle-btn" onClick={handleClose}>
                                    <i className="fa fa-times" /> Cancel
                                </button>
                                <button type="button" className="primary-btn" onClick={handleSetName}>
                                    <i className="fa fa-check" /> Rename
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* backdrop */}
            {/* <div className="modal-backdrop fade show"></div> */}
        </>
    )
}
export default EditPage