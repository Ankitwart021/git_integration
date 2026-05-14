import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowDefinition } from "../types/types";
import { useStartWorkflow, useWorkflowInbox } from "../backend/backend";
import { useWorkflowStore } from "../useStore/workflowStore";
import { useUserStore } from "../useStore/userStore";
import apiConfig from "../../config/apiConfig";

/* ---------------------------------------------
   Helpers
---------------------------------------------- */

function decodeJWT(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

/* ---------------------------------------------
   Component
---------------------------------------------- */

const WorkflowList: React.FC = () => {
  const navigate = useNavigate();

  const { setSelectedWorkflow } = useWorkflowStore();
  const { setCurrentUser, currentUser } = useUserStore();

  const [clientId, setClientId] = useState<string>("");

  const token = getCookie("access_token") || "";
  const decodedToken = decodeJWT(token);

  const workflowIds = Array.isArray(apiConfig.WORKFLOW_IDS)
    ? apiConfig.WORKFLOW_IDS
    : [];

  const roles: string[] =
    decodedToken?.resource_access?.[decodedToken?.azp]?.roles || [];

  const startWorkflow = useStartWorkflow();

  const { data, isLoading } = useWorkflowInbox(workflowIds, roles);

  const [workflowDefinitions, setWorkflowDefinitions] = useState<
    WorkflowDefinition[]
  >([]);

  /* ---------------------------------------------
     Initialize User
  ---------------------------------------------- */

  useEffect(() => {
    if (!currentUser && decodedToken) {
      setCurrentUser(decodedToken);
      setClientId(decodedToken.azp);
    }
  }, [currentUser, decodedToken, setCurrentUser]);

  /* ---------------------------------------------
     Load workflows from backend inbox
  ---------------------------------------------- */

useEffect(() => {
  if (!data?.data) return;

  const workflows = data.data.map((item: any) => item.workflow);
  setWorkflowDefinitions(workflows);
}, [data]);


  /* ---------------------------------------------
     Handlers
  ---------------------------------------------- */

  const handleWorkflowSelect = (def: WorkflowDefinition) => {
    setSelectedWorkflow(def);
    navigate("/workflow/workflow_list_executions");
  };

  const handleInvokeWorkflow = (def: WorkflowDefinition) => {
    if (!currentUser) {
      alert("User information missing");
      return;
    }

    startWorkflow.mutate(
      {
        workflowDefId: def.id,
        userId: currentUser.sub,
        role: roles,
        initialData: {},
      },
      {
        onSuccess: () => alert("Workflow started successfully"),
        onError: () => alert("Failed to start workflow"),
      }
    );
  };

  const getGradientForIndex = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];
    return gradients[index % gradients.length];
  };

  /* ---------------------------------------------
     Loading
  ---------------------------------------------- */

  if (isLoading) {
    return (
      <div 
        className="min-vh-100 d-flex flex-column align-items-center justify-content-center" 
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="text-center">
          <div 
            className="spinner-border text-white mb-4" 
            style={{ width: '4rem', height: '4rem', borderWidth: '0.3rem' }} 
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-white fw-bold mb-2">Loading Workflows</h3>
          <p className="text-white opacity-75">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------
     Render
  ---------------------------------------------- */

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Modern Header with Glass Effect */}
      <div 
        className="position-relative" 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-4">
            {/* Title Section */}
            <div className="col-lg-6">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  className="rounded-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-white fw-bold mb-1 display-6">Workflows</h1>
                  <p className="text-white mb-0 opacity-75">Manage and execute your workflows seamlessly</p>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="col-lg-6">
              <div 
                className="card border-0 rounded-4 overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                              width: '52px',
                              height: '52px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '1.25rem'
                            }}
                          >
                            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div 
                            className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white"
                            style={{
                              width: '14px',
                              height: '14px',
                              background: '#10b981'
                            }}
                          />
                        </div>
                        <div>
                          <div className="fw-bold text-dark mb-1">{currentUser?.name || "User"}</div>
                          <div className="text-muted small">Active Now</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        {workflowDefinitions.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div 
                className="card border-0 rounded-4 text-center py-5 shadow-sm" 
                style={{ background: 'white' }}
              >
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div 
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                      style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
                      }}
                    >
                      <svg width="50" height="50" fill="#f59e0b" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-3">No Workflows Available</h3>
                  <p className="text-muted mb-4 lead">
                    You don't have access to any workflows with your current role.
                  </p>
                  <div 
                    className="alert alert-light border-0 rounded-3 text-start"
                    style={{ background: '#f3f4f6' }}
                  >
                    <div className="d-flex gap-3">
                      <div className="flex-shrink-0">
                        <svg width="20" height="20" fill="#3b82f6" viewBox="0 0 16 16">
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-dark">Tip:</strong>
                        <span className="text-muted"> Contact your administrator to get access to workflows.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div 
                  className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm"
                  style={{
                    background: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3z" />
                          <path d="M9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="fw-bold mb-0 display-6">{workflowDefinitions.length}</h2>
                        <p className="text-muted mb-0 fw-medium">Available Workflows</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div 
                  className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm"
                  style={{
                    background: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        }}
                      >
                        <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="fw-bold mb-0 text-capitalize" style={{ fontSize: '1.75rem' }}>
                          {roles.join(", ") || "N/A"}
                        </h2>
                        <p className="text-muted mb-0 fw-medium">Your Roles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                      {/* Premium Workflow Cards Grid */}
            <div className="row g-4">
              {workflowDefinitions.map((def, index) => (
                <div key={def.id} className="col-lg-4 col-md-6">
                  <div
                    className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm position-relative"
                    style={{
                      background: "white",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-8px) scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    {/* Gradient Top Bar */}
                    <div
                      className="position-absolute top-0 start-0 w-100"
                      style={{
                        height: "5px",
                        background: getGradientForIndex(index),
                      }}
                    />

                    <div className="card-body p-4 d-flex flex-column">
                      {/* Icon */}
                      <div className="mb-4">
                        <div
                          className="rounded-4 d-inline-flex align-items-center justify-content-center p-3"
                          style={{
                            background: getGradientForIndex(index),
                            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                          }}
                        >
                          <svg
                            width="32"
                            height="32"
                            fill="white"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 3a.5.5 0 0 1 .5.5V5a.5.5 0 0 1-1 0V3.5A.5.5 0 0 1 8 3z" />
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                          </svg>
                        </div>
                      </div>

                      {/* Title */}
                      <h5
                        className="fw-bold text-dark mb-3"
                        style={{ fontSize: "1.25rem" }}
                      >
                        {def.name}
                      </h5>

                      {/* Description */}
                      <p className="text-muted flex-grow-1 mb-4">
                        {def.description ||
                          "No description available for this workflow."}
                      </p>

                      {/* Meta */}
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            background: "rgba(102,126,234,0.1)",
                            color: "#667eea",
                          }}
                        >
                          Invoker:{" "}
                          <strong>
                            {def.workflow_spec.invoker || "N/A"}
                          </strong>
                        </span>

                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            color: "#10b981",
                          }}
                        >
                          {def.workflow_spec.nodes?.length || 0} Nodes
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          className="btn flex-grow-1 rounded-3 fw-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                          }}
                          onClick={() => handleWorkflowSelect(def)}
                        >
                          View Details
                        </button>

                        {roles.includes(def.workflow_spec.invoker) && (
                          <button
                            className="btn rounded-3"
                            style={{
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              width: "48px",
                              height: "48px",
                            }}
                            title="Start Workflow"
                            onClick={() => handleInvokeWorkflow(def)}
                          >
                            ▶
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkflowList;
