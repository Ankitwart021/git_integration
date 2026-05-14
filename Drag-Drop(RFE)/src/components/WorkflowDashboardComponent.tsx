import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useApplicationContext } from '../context/applicationContext';
import UserInfoContext from '../context/userContext';
import { fetchWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from "../api/workflows";
import { useWorkflowStore } from '../store/useWorkflowStore';
import Navbar2 from './Navbar2';
import "../dashboard.css";

export interface Workflow {
    id: string;
    workflowName: string;
    workflowData: any;
    createdAt: string;
}


const workflowDashboardComponent = () => {
    const { workflows, setWorkflows, selectedWorkflowId, selectedWorkflowName, setSelectedWorkflowId, setSelectedWorkflowName } = useWorkflowStore();
    const { selectedAppData, setSelectedAppData, allApplications, selectedAppName, setSelectedAppName } = useApplicationContext();
    const { userInfo, deserlisation } = useContext(UserInfoContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const { appId }: any = useParams();
    const [workflowName, setWorkflowName] = useState("");

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

    // Fetch all apps
    useEffect(() => {
        (async () => {
            try {
                const workflows = await fetchWorkflows(appId);
                setWorkflows(workflows);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);



    // Handle app selection
    const handleSelectWorkflow = async (workflowId: string, workflowName: string) => {
        try {
            // setResourcesValues({}); // Clear previous resources values
            setSelectedWorkflowId(workflowId);
            setSelectedWorkflowName(workflowName);
            navigate(`/${appId}/workflow/${workflowId}`);
        } catch (err) {
            console.error(err);
        }
    };



    //  Create new app + default page
    const handleCreateWorkflow = async () => {
        if (!workflowName) return;
        try {
            const workflowData = JSON.stringify({});
            const createdWorkflow = await createWorkflow(appId, workflowName, workflowData);
            setWorkflows([...workflows, createdWorkflow]);
            setSelectedWorkflowName(createdWorkflow.workflowName);
            setSelectedWorkflowId(createdWorkflow.id);
            navigate(`/${appId}/workflow/${createdWorkflow.id}`);
            setWorkflowName("");
        } catch (err) {
            console.error(err);
        }
    };

    // delete application
    const handleDeleteWorkflow = async (id: string) => {
        try {
            await deleteWorkflow(appId, id);
            setWorkflows(workflows.filter(workflow => workflow.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    const filteredWorkflows = workflows.filter(workflow =>
        workflow.workflowName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-root">
            <Navbar2
                AppData={allApplications}
                appIdx={0}  // default index, same as Resource component
                appName={selectedAppName}
                setAppName={setSelectedAppName}
                getAllGridData={() => { }} // pass empty fn because Workflow page doesn’t use grid
            />


            <main className="dashboard-container">

                <div className="create-app-wrapper">
                    <div className="app-create-card">
                        <div className="create-app-header">
                            <h2>Create New Workflow</h2>
                            <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--dash-text-dim)', letterSpacing: '.02em' }}>Start a new project instantly.</p>
                        </div>
                        <div className="inline-field">
                            <input
                                type="text"
                                placeholder="Enter workflow name"
                                onChange={(e) => setWorkflowName(e.target.value)}
                            />

                        </div>
                        <div className="create-app-footer">
                            <button
                                className="primary-btn w-100"
                                disabled={!workflowName}
                                // onClick={() => handleCreateAppClick(allApps.length)}
                                onClick={() => handleCreateWorkflow()}
                            >
                                <i className="fa fa-plus-circle" /> Create Workflow
                            </button>
                        </div>
                    </div>
                </div>

                <div className="apps-grid-wrapper">
                    <section className="apps-grid ">
                        {filteredWorkflows.length === 0 && (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <strong>No workflows found.</strong>
                                {/* <span>Try a different search term.</span> */}
                            </div>
                        )}

                        {filteredWorkflows?.map((workflow) => (
                            <div key={workflow.id} className="app-card">
                                <div>
                                    <h3 className="app-card__title">{workflow.workflowName}</h3>
                                </div>
                                <div className="app-card__actions">
                                    <button
                                        className="primary-btn app-card__edit-btn"
                                        onClick={() => {
                                            console.log("Selected workflow iddddddddddd:", workflow.id, "workflow name:", workflow.workflowName); // <-- log here

                                            handleSelectWorkflow(workflow.id, workflow.workflowName);
                                        }}
                                    >
                                        <i className="fa fa-edit" /> Edit workflow
                                    </button>
                                    <button
                                        className="primary-btn app-card__edit-btn"
                                        onClick={() => {
                                            console.log("Selected workflow iddddddddddd:", workflow.id, "workflow name:", workflow.workflowName); // <-- log here
                                            handleDeleteWorkflow(workflow.id);
                                        }}
                                    >
                                        <i className="fa fa-trash" /> Delete workflow
                                    </button>
                                </div>
                            </div>
                        ))}

                    </section>
                </div>
            </main>
        </div >
    );
}

export default workflowDashboardComponent