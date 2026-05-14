import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useSelectedStore } from "../store/useSelectedStore";
import { Trash2, Plus, X } from "lucide-react";
import { nodeDefinitions, type NodeProperty } from "../shared/schema";
import { getNodeConfig, getWorkflowSpec, getWorkflowStateData, updateNodeConfig, updateWorkflow, updateWorkflowStateData } from "../api/workflows";
import { useParams } from "react-router-dom";
import { useWorkflowStore } from "../store/useWorkflowStore";

/* ---------------------------------------
   Bootstrap Panel Wrapper
---------------------------------------- */
function BootstrapPanel({ title, onClose, footer, children }: any) {
  return (
    <>
      {/* Backdrop overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 1999
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="position-fixed end-0 top-0 bg-white border-start border-secondary shadow-lg"
        style={{ width: "400px", height: "100vh", zIndex: 2000 }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="m-0">{title}</h5>
          <button className="btn btn-light btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-3 overflow-auto" style={{ height: "calc(100vh - 120px)" }}>
          {children}
        </div>

        {footer && (
          <div className="p-3 border-top bg-light">{footer}</div>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------
   MAIN COMPONENT
---------------------------------------- */
export function NodePropertiesPanel() {
  const { nodes, edges, updateNodeData, deleteNode, setNodes, setEdges, rfInstance } = useStore();
  const { idSelected, clearSelection, panelMode } = useSelectedStore();
  const [properties, setProperties] = useState<NodeProperty[]>([]);
  const [backendConfig, setBackendConfig] = useState<{ nodeId: string, config: any } | null>(null);
  // const [metaProps, setMetaProps] = useState<any>({});
  // const [metaProps, setMetaProps] = useState<any>({});
  const { appId } = useParams<any>();
  const { selectedWorkflowName, selectedWorkflowId } = useWorkflowStore();
  const node = nodes.find((n: any) => n.id === idSelected);
  // const [isBasePropsReady, setIsBasePropsReady] = useState(false);



  useEffect(() => {
    if (!node || !appId || !selectedWorkflowId) return;

    const loadConfig = async () => {
      try {
        const res = await getNodeConfig(appId, selectedWorkflowId, idSelected || "");
        if (res?.config) {
          setBackendConfig({
            nodeId: idSelected || "",
            config: res.config
          });
        }
      } catch (error) {
        console.error("Failed to load node config:", error);
      }
    };

    loadConfig();

  }, [idSelected, appId, selectedWorkflowId]);


  // useEffect(() => {
  //   if (!appId || !selectedWorkflowId) return;

  //   const syncState = async () => {
  //     const stateRes = await getWorkflowStateData(appId, selectedWorkflowId);
  //     console.log("Workflow state:", stateRes);

  //     if (!stateRes || !stateRes.nodes || !stateRes.edges) {
  //       console.warn("Workflow state is empty:", stateRes);
  //       return;
  //     }

  //     if (JSON.stringify(nodes) !== JSON.stringify(stateRes.nodes)) {
  //       setNodes(stateRes.nodes);
  //     }
  //     if (JSON.stringify(edges) !== JSON.stringify(stateRes.edges)) {
  //       setEdges(stateRes.edges);
  //     }

  //   };

  //   syncState();

  // }, [selectedWorkflowId, appId]);


  useEffect(() => {
    if (!node) return;

    const def = nodeDefinitions.find((d) => d.type === node.data.type);

    const baseProps = node.data?.properties ?? [];
    const dynProps = node.data?.dynamicProperties ?? [];

    const metadata: any = {};
    if (def?.inputs) {
      Object.entries(def.inputs).forEach(([key, config]: any) => {
        metadata[key] = {
          schemaKey: config.schemaKey || null,
          isEncrypted: config.isEncrypted || false,
          isConfigKey: config.isConfigKey || false,
        };
      });
    }

    // specific node config from backend
    const currentBackendConfig = (backendConfig?.nodeId === node.id) ? backendConfig.config : {};

    const merged = [...baseProps, ...dynProps].map((p) => {
      // 1. Merge from metadata (static definition)
      let pMerged = {
        ...p,
        schemaKey: metadata[p.key]?.schemaKey ?? p.schemaKey,
        isEncrypted: metadata[p.key]?.isEncrypted ?? p.isEncrypted,
        isConfigKey: metadata[p.key]?.isConfigKey ?? p.isConfigKey,
      };

      // 2. Merge from backend config (user saved overrides)
      if (currentBackendConfig[p.key]) {
        pMerged = {
          ...pMerged,
          value: currentBackendConfig[p.key]?.value ?? pMerged.value,
          schemaKey: currentBackendConfig[p.key]?.schemaKey ?? pMerged.schemaKey,
          isEncrypted: currentBackendConfig[p.key]?.isEncrypted ?? pMerged.isEncrypted,
          isConfigKey: currentBackendConfig[p.key]?.isConfigKey ?? pMerged.isConfigKey,
        };
      }

      return pMerged;
    });

    setProperties(merged);

  }, [node, backendConfig]);


  // Only show this panel if panelMode is 'properties' or undefined (backward compatibility)
  if (!node) return null;

  /* ---------------------------------------
     UPDATE LOCAL STATE
  ---------------------------------------- */
  const handlePropertyChange = (index: number, value: any) => {
    const updated = [...properties];
    updated[index].value = value;
    setProperties(updated);
  };

  /* ---------------------------------------
     APPLY
  ---------------------------------------- */
  const handleApply = async () => {
    const base: NodeProperty[] = [];
    const dyn: NodeProperty[] = [];
    const backendPayload: any[] = [];
    console.log("properties", properties);

    for (const p of properties) {
      if (p.type === "form_fields" || p.key === "invoker") dyn.push(p);
      else base.push(p);

      if (p.isConfigKey) {
        backendPayload.push({
          key: p.key,
          value: p.value,
          schemaKey: p.schemaKey,
          isEncrypted: p.isEncrypted,
          isConfigKey: p.isConfigKey,
        });
      }
    }

    updateNodeData(node.id, {
      properties: base,
      dynamicProperties: dyn,
    });

    // const updateWorkflowStateDataRes = await updateWorkflowStateData(appId || "", selectedWorkflowId || "", nodes, edges)
    // const updateWorkflowStateDataRes = await updateWorkflowStateData(appId || "", selectedWorkflowId || "", nodes, edges)
    if (backendPayload.length > 0) {
      try {
        const res = await updateNodeConfig(appId || "", selectedWorkflowId || "", node.id, backendPayload);
        console.log("res", res)
      }
      catch (e) {
        console.log(e)
      }
    }

   handleSaveWorkflow();
  };
  const handleSaveWorkflow = async () => {
    try {
      const data = await updateWorkflow(appId || '', selectedWorkflowId || '', selectedWorkflowName || '', rfInstance?.toObject() || {});
      if(data){
        alert("Workflow saved successfully");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate workflow");
    }
  };
  /* ---------------------------------------
     RESET
  ---------------------------------------- */
  const handleReset = () => {
    const base = node.data?.properties ?? [];
    const dyn = node.data?.dynamicProperties ?? [];
    setProperties([...base, ...dyn]);
  };

  /* ---------------------------------------
     DELETE
  ---------------------------------------- */
  const handleDelete = () => {
    if (confirm("Delete this node?")) {
      deleteNode(node.id);
      clearSelection();
    }
  };

  /* ---------------------------------------
     CONDITION EVALUATION
  ---------------------------------------- */
  function evaluateCondition(cond: any, props: NodeProperty[]) {
    const prop = props.find((p) => p.key === cond.key);
    return prop?.value === cond.value;
  }

  /* ---------------------------------------
     FORM FIELD ACTIONS
  ---------------------------------------- */
  const handleAddFormField = (index: number) => {
    const updated = [...properties];
    updated[index].value.push({
      name: "",
      type: "string",
      access: "write",
      options: [],
    });
    setProperties(updated);
  };

  const handleRemoveFormField = (index: number, fieldIndex: number) => {
    const updated = [...properties];
    updated[index].value.splice(fieldIndex, 1);
    setProperties(updated);
  };

  const handleFormFieldChange = (i: number, f: number, key: string, value: any) => {
    const updated = [...properties];
    updated[i].value[f][key] = value;
    setProperties(updated);
  };

  /* ---------------------------------------
     RENDER UI (BOOTSTRAP)
  ---------------------------------------- */
  return (
    <BootstrapPanel
      title="Node Properties"
      onClose={clearSelection}
      footer={
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary w-100" onClick={handleReset}>Reset</button>
          <button className="btn btn-primary w-100" onClick={handleApply}>Apply</button>
          <button className="btn btn-danger w-25" onClick={handleDelete}>
            <Trash2 size={16} className="me-1" />
          </button>
        </div>
      }
    >
      <div className="mb-3">
        <label className="fw-bold small text-muted">Node Type</label>
        <div className="border rounded p-2 bg-light fw-semibold">
          {node.data.label}
        </div>
      </div>

      <div className="mb-3">
        <label className="fw-bold small text-muted">Node ID</label>
        <div className="border rounded p-2 bg-light small text-break font-monospace">{node.id}</div>
      </div>

      <hr />

      <h6 className="text-uppercase small text-muted fw-bold">Properties</h6>

      {properties.map((prop, index) => {
        if (prop.conditions?.length) {
          const visible = prop.conditions.every((c: any) =>
            evaluateCondition(c, properties)
          );
          if (!visible) return null;
        }

        return (
          <div key={prop.key} className="mb-4">
            <label className="fw-semibold small">
              {prop.label}
              {prop.isConfigKey && (
                <span className="badge bg-primary ms-2">CONFIG</span>
              )}
              {prop.isEncrypted && (
                <span className="badge bg-danger ms-2">ENCRYPTED</span>
              )}
            </label>

            {/* Text */}
            {prop.type === "text" && (
              <input
                className="form-control"
                value={prop.value}
                onChange={(e) => handlePropertyChange(index, e.target.value)}
              />
            )}

            {/* Date Select */}
            {prop.type === "date" && (
              <select
                className="form-select"
                value={prop.value}
                onChange={(e) => handlePropertyChange(index, e.target.value)}
              >
                {[
                  "1 minute", "5 minutes", "10 minutes", "30 minutes",
                  "1 hour", "2 hours", "6 hours", "12 hours",
                  "1 day", "2 days", "5 days"
                ].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {/* Textarea */}
            {prop.type === "textarea" && (
              <textarea
                className="form-control"
                value={prop.value}
                onChange={(e) => handlePropertyChange(index, e.target.value)}
              />
            )}

            {/* Number */}
            {prop.type === "number" && (
              <input
                type="number"
                className="form-control"
                value={prop.value}
                onChange={(e) => handlePropertyChange(index, Number(e.target.value))}
              />
            )}

            {/* Dropdown */}
            {prop.type === "select" && (
              <select
                className="form-select"
                value={prop.value}
                onChange={(e) => handlePropertyChange(index, e.target.value)}
              >
                {prop.options?.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}

            {/* Switch */}
            {prop.type === "toggle" && (
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={prop.value}
                  onChange={(e) => handlePropertyChange(index, e.target.checked)}
                />
              </div>
            )}

            {/* Form Fields */}
            {prop.type === "form_fields" && (
              <div className="border rounded p-3 bg-light mt-2">
                <h6 className="small fw-semibold">Form Fields</h6>

                {prop.value.map((field: any, fieldIndex: number) => (
                  <div key={fieldIndex} className="border rounded p-2 bg-white position-relative mt-2">
                    <button
                      className="btn btn-sm btn-danger position-absolute end-0 top-0 m-1"
                      onClick={() => handleRemoveFormField(index, fieldIndex)}
                    >
                      <X size={14} />
                    </button>

                    <input
                      className="form-control mb-2"
                      placeholder="Field Name"
                      value={field.name}
                      onChange={(e) =>
                        handleFormFieldChange(index, fieldIndex, "name", e.target.value)
                      }
                    />

                    <select
                      className="form-select mb-2"
                      value={field.type}
                      onChange={(e) =>
                        handleFormFieldChange(index, fieldIndex, "type", e.target.value)
                      }
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="boolean">Boolean</option>
                      <option value="file">Document</option>
                    </select>

                    {field.type === "dropdown" && (
                      <textarea
                        className="form-control"
                        placeholder="Comma-separated options"
                        value={field.options?.join(", ") ?? ""}
                        onChange={(e) =>
                          handleFormFieldChange(
                            index,
                            fieldIndex,
                            "options",
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                      />
                    )}
                  </div>
                ))}

                <button
                  className="btn btn-outline-primary w-100 mt-3"
                  onClick={() => handleAddFormField(index)}
                >
                  <Plus size={16} className="me-2" />
                  Add Field
                </button>
              </div>
            )}
          </div>
        );
      })}

      <hr />
    </BootstrapPanel>
  );
}