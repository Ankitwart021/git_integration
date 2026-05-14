import React, { useContext, useEffect, useState } from 'react'
import { getCookieValue } from '../utils/utils';
import Profile from './profile';
import { useNavigate } from 'react-router-dom';
import "../dashboard.css";
import { useApplicationContext } from '../context/applicationContext';
import UserInfoContext from '../context/userContext';
import apiConfig from '../config/apiConfig';

import { fetchApplications, createApplication, deleteApplication, shareApplication, inviteCollaborator } from "../api/applications";
import { fetchPagesByAppId, createPage } from "../api/pages";
import { useAppMetaDataStore } from "../store/useAppMetaDataStore"
import { userAppMetaData } from '../hooks/useAppMetaData';
import SelectedNavbar from '../models/SelectedNavbar';
import { useNavSideBarStore } from '../store/useNavSideBar';
import SelectedSidebar from '../models/SelectedSidebar';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import ShareAppModal from './ShareAppModal';
export interface Application {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    isShared?: boolean;
    remoteAppId?: string;
}

export interface DashboardProps {
    userId?: string;
    userName?: string;
}

const Dashboard1 = () => {
    const {
        allApplications,
        setAllApplications,
        selectedAppData,
        setSelectedAppData,
        appName,
        setAppName,
        appDescription,
        setAppDescription,
        selectedAppName,
        setSelectedAppName,
        selectedAppDescription,
        setSelectedAppDescription,
        // setResourcesValues,

    } = useApplicationContext();

    const { userInfo, deserlisation } = useContext(UserInfoContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const clearMetaDataFromStore = useAppMetaDataStore(
        (state) => state.clearMetaData
    )
    const setAppIdInStore = useAppMetaDataStore((state) => state.setAppIdInStore)
    const [importFile, setImportFile] = useState<File | null>(null);


    const setNavbarObj = useNavSideBarStore((state) => state.setNavbarObj);
    const getNavbarObj = useNavSideBarStore((state) => state.getNavbarObj);

    const setSidebarObj = useNavSideBarStore((state) => state.setSidebarObj);
    const getSidebarObj = useNavSideBarStore((state) => state.getSidebarObj);
    const clearNavSidebarData = useNavSideBarStore((state) => state.clearNavSidebarData);
    const [showImportModal, setShowImportModal] = useState(false);
    const [inviteModalApp, setInviteModalApp] = useState<{ id: string, name: string } | null>(null);
    const [shareModalApp, setShareModalApp] = useState<{ id: string, name: string } | null>(null);

    // fetch all applications 
    // useEffect(() => {
    //     const fetchApplications = async () => {
    //         const token = getCookieValue("jwt");
    //         if (!token) {
    //             alert('No JWT found in cookies!');
    //             return;
    //         }
    //         try {
    //             const res = await fetch(`${apiConfig.API_BASE_URL}/applications`, {
    //                 method: "GET",
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`, // send JWT in header
    //                 },
    //                 credentials: "include",
    //             });
    //             const data = await res.json();
    //             setAllApplications(data.data);
    //             console.log("All applications:", data.data);
    //             // deserlisation(data.data,data.data.id ); // deserialize and set first app as current
    //         } catch (err) {
    //             console.error("Error fetching applications:", err);
    //         }
    //     };

    //     fetchApplications();
    // }, []);

    // const setAppMetaData = useAppMetaDataStore(
    //     (state) => state.setAppMetaData
    // )
    // useEffect(()=>{
    //     setAppMetaData("","hello")
    // },[])
    // Fetch all apps
    useEffect(() => {
        (async () => {
            try {
                const apps = await fetchApplications();
                setAllApplications(apps);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    useEffect(() => {
        clearMetaDataFromStore();
    }, [])



    // Handle app selection
    const handleSelectApp = async (appId: string, appName: string, appDescription: string) => {
        try {
            // console.log("selected navbar in the navbar dashboard", getNavbarObj(appId),appId);
            //    const navObj =  getNavbarObj(appId);
            //    if(Object.keys(navObj).length === 0){

            //        setNavbarObj(appId,new SelectedNavbar())
            //    }
            // setResourcesValues({}); // Clear previous resources values
            const pages = await fetchPagesByAppId(appId);
            console.log("new user object after updateUserInfo in dashboard", pages);
            setSelectedAppName(appName);
            setSelectedAppDescription(appDescription);
            setSelectedAppData(pages);
            setAppIdInStore(appId);
            deserlisation(pages, appId, appName, appDescription);

            navigate(`/${appId}/resources`);

        } catch (err) {
            console.error(err);
        }
    };
    function handleTryAI() {
        navigate('/codellama')
    }



    //  Create new app + default page
    const handleCreateApp = async () => {
        if (!appName) return;
        try {
            const createdApp = await createApplication(appName, appDescription);
            setAllApplications([...allApplications, createdApp]);
            const createdPage = await createPage(createdApp.id);
            setSelectedAppName(createdApp.name);
            setSelectedAppData([createdPage]);
            deserlisation([createdPage], createdApp.id, createdApp.name, createdApp.description);
            setNavbarObj(createdApp.id, new SelectedNavbar())
            setSidebarObj(createdApp.id, new SelectedSidebar())
            // updateNavModelInStore(createdApp.id);
            navigate(`/${createdApp.id}/DragDrop`);
            setAppName("");
            setAppDescription("");
        } catch (err) {
            console.error(err);
        }
    };

    // delete application
    const handleDeleteApp = async (app: Application) => {
        const isShared = app.isShared;
        const confirmMessage = isShared
            ? `Application "${app.name}" is shared. Deleting it will also remove it from the central collaboration server. Are you sure?`
            : `Are you sure you want to delete the application "${app.name}"?`;

        if (window.confirm(confirmMessage)) {
            try {
                await deleteApplication(app.id);
                setAllApplications(allApplications.filter(a => a.id !== app.id));
            } catch (err) {
                console.error(err);
                alert(`Failed to delete application: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    }

    const filteredApplications = allApplications.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportApp = async (appId: any, appName: any) => {
        const token = getCookieValue("jwt");
        console.log("appID selected for export", appId, appName);
        try {
            const response = await fetch(`${apiConfig.API_BASE_URL}/export/${appId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to export application");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // ✅ Read filename from backend header
            const disposition = response.headers.get("Content-Disposition");
            let filename = "application.zip";

            if (disposition && disposition.includes("filename=")) {
                filename = disposition.split("filename=")[1].replace(/"/g, "");
            }

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;   // ✅ no override anymore
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        }
    }

    const handleShareApp = async (appId: any, appName: any) => {
        try {
            const result = await shareApplication(appId);
            console.log("Application shared successfully:", result);
            alert(`Application "${appName}" shared successfully!`);
            // Refresh applications to show updated share status
            const apps = await fetchApplications();
            setAllApplications(apps);
        } catch (err: any) {
            console.error("Error sharing application:", err);
            alert(`Failed to share application: ${err.message}`);
        }
    }

    const doInviteCollaborator = async (appId: string, userId: string, role: string) => {
        try {
            const result = await inviteCollaborator(appId, userId, role);
            console.log("Invitation sent successfully:", result);
            alert(`Invitation sent to user successfully!`);
        } catch (err: any) {
            console.error("Error inviting collaborator:", err);
            alert(`Failed to invite collaborator: ${err.message}`);
            throw err; // Re-throw to allow modal to handle error state if needed
        }
    }
    useEffect(() => {
        clearNavSidebarData()
    }, []);
    const handleImportApp = async () => {
        if (!importFile) return;

        const formData = new FormData();
        formData.append("file", importFile);
        formData.append("name", appName);
        formData.append("description", appDescription);

        try {
            const res = await fetch(`${apiConfig.API_BASE_URL}/import`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getCookieValue("jwt")}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Import failed:", text);
                throw new Error("Import failed");
            }

            const data = await res.json();
            console.log("IMPORT RESPONSE", data);

            const newAppID = data?.newApplicationId;
            const oldAppID = data?.oldApplicationId;

            console.log("old and new id ", oldAppID, newAppID);

            if (!newAppID || !oldAppID) {
                throw new Error("IDs missing in response");
            }

            setNavbarObj(newAppID, getNavbarObj(oldAppID));
            setSidebarObj(newAppID, getSidebarObj(oldAppID));

            alert("Application imported successfully!");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to import application");
        }
    };



    return (
        <div className="dashboard-root">
            <nav className="dashboard-nav">
                <div className="d-flex align-items-center gap-3">
                    <Profile userName={userInfo.getUserName()} />
                </div>
                <div className="dashboard-nav__brand" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    RASP DESIGNER
                </div>
                <div className="search-wrapper d-flex gap-1 align-items-center">
                    <input
                        type="text"
                        placeholder="Search by app name or description..."
                        className="search-input"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* <button
                        className="secondary-btn"
                        onClick={() => setShowImportModal(true)}
                        title="Import Application"
                    >
                        <i className="fa fa-cloud-upload" /> Import
                    </button> */}
                </div>
            </nav>

            <main className="dashboard-container">
                <div className='d-flex justify-content-end align-items-center'>
                    <button
                        className="secondary-btn"
                        onClick={() => setShowImportModal(true)}
                        title="Import Application"
                    >
                        <i className="fa fa-cloud-upload" /> Import Application
                    </button>
                </div>
                <div className="create-app-wrapper">
                    <div className="app-create-card">
                        <div>
                            <h2>Create New App</h2>
                            <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--dash-text-dim)', letterSpacing: '.02em' }}>Start a new project instantly.</p>
                        </div>

                        <div className="d-flex flex-column justify-content-between align-items-center w-100">
                            <div className="inline-field m-2">
                                <input
                                    type="text"
                                    placeholder="Enter application name"
                                    onChange={(e) => setAppName(e.target.value)}
                                />
                                <textarea
                                    value={appDescription}
                                    onChange={(e) => setAppDescription(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter application description" />
                            </div>
                            <div>
                                <button
                                    className="primary-btn w-100"
                                    disabled={!appName}
                                    // onClick={() => handleCreateAppClick(allApps.length)}
                                    onClick={() => handleCreateApp()}
                                >
                                    <i className="fa fa-plus-circle" /> Create Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="apps-grid-wrapper">
                    <section className="apps-grid ">
                        {filteredApplications.length === 0 && (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <strong>No applications found.</strong>
                                <span>Try a different search term.</span>
                            </div>
                        )}

                        {filteredApplications?.map((app) => (
                            <div key={app.id} className="app-card">
                                <div className='d-flex justify-content-between align-items-center w-100'>
                                    <h3 className="app-card__title">{app.name}</h3>
                                    <div className='d-flex gap-2'>
                                        <button
                                            className="app-card__export-btn"
                                            title="Export Application"
                                            onClick={() => handleExportApp(app.id, app.name)}
                                        >
                                            <i className="fa fa-upload" />
                                        </button>
                                        <button
                                            className="app-card__export-btn"
                                            title={app.isShared ? "Application Shared" : "Share Application"}
                                            disabled={app.isShared}
                                            onClick={() => setShareModalApp({ id: app.id, name: app.name })}
                                            style={app.isShared ? { color: '#28a745', cursor: 'default' } : {}}
                                        >
                                            <i className={app.isShared ? "fa fa-check-circle" : "fa fa-share"} />
                                        </button>
                                        {app.isShared && (
                                            <button
                                                className="app-card__export-btn"
                                                title="Invite Collaborator"
                                                onClick={() => setInviteModalApp({ id: app.id, name: app.name })}
                                                style={{ color: '#007bff' }}
                                            >
                                                <i className="fa fa-user-plus" />
                                            </button>
                                        )}
                                    </div>

                                </div>
                                <div>

                                    <div className="app-card__meta">
                                        <span>{app.description}</span>
                                    </div>
                                </div>
                                <div className="app-card__actions">
                                    <button
                                        className="primary-btn app-card__edit-btn"
                                        onClick={() => {
                                            console.log("Selected app iddddddddddd:", app.id, "app name:", app.name); // <-- log here

                                            handleSelectApp(app.id, app.name, app.description);
                                        }}
                                    >
                                        <i className="fa fa-edit" /> Edit App
                                    </button>
                                    <button
                                        className="primary-btn app-card__edit-btn"
                                        onClick={() => {
                                            console.log("Selected app iddddddddddd:", app.id, "app name:", app.name); // <-- log here
                                            handleDeleteApp(app);
                                        }}
                                    >
                                        <i className="fa fa-trash" /> Delete App
                                    </button>
                                </div>
                            </div>
                        ))}

                    </section>
                </div>
            </main>
            {showImportModal && (
                <div className="import-modal-backdrop">
                    <div className="import-modal">
                        <div className="import-modal-header">
                            <h3>Import Application</h3>
                            <i
                                className="fa fa-times close-btn"
                                onClick={() => setShowImportModal(false)}
                            />
                        </div>

                        <div className="import-modal-body">
                            <input
                                type="text"
                                placeholder="Enter application name"
                                onChange={(e) => setAppName(e.target.value)}
                            />

                            <textarea
                                placeholder="Enter application description"
                                value={appDescription}
                                onChange={(e) => setAppDescription(e.target.value)}
                            />

                            <div className="file-upload-box">
                                <input
                                    type="file"
                                    id="importZip"
                                    accept=".zip"
                                    hidden
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                />

                                <label htmlFor="importZip" className="file-upload-label">
                                    <i className="fa fa-file-archive-o" />
                                    <span>
                                        {importFile ? importFile.name : "Click to upload ZIP file"}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="import-modal-footer">
                            <button
                                className="secondary-btn"
                                onClick={() => setShowImportModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-btn"
                                disabled={!appName || !importFile}
                                onClick={() => {
                                    handleImportApp();
                                    setShowImportModal(false);
                                }}
                            >
                                <i className="fa fa-cloud-upload" /> Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {inviteModalApp && (
                <InviteCollaboratorModal
                    appId={inviteModalApp.id}
                    appName={inviteModalApp.name}
                    onClose={() => setInviteModalApp(null)}
                    onInvite={doInviteCollaborator}
                />
            )}
            {shareModalApp && (
                <ShareAppModal
                    appName={shareModalApp.name}
                    onCancel={() => setShareModalApp(null)}
                    onConfirm={() => handleShareApp(shareModalApp.id, shareModalApp.name)}
                />
            )}
        </div >
    );
}

export default Dashboard1