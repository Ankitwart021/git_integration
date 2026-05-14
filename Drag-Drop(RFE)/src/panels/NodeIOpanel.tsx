import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useSelectedStore } from "../store/useSelectedStore";

const Panel = ({ title, onClose, footer, children }: any) => (
  <div 
    className="bg-white border h-100 d-flex flex-column shadow-sm"
    style={{
      width: '400px',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 1000
    }}
  >
    <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
      <h5 className="m-0">{title}</h5>
      <button className="btn btn-light btn-sm" onClick={onClose}>
        <X size={16} />
      </button>
    </div>

    <div className="flex-grow-1 overflow-auto p-3">{children}</div>

    {footer && (
      <div className="p-3 border-top">
        {footer}
      </div>
    )}
  </div>
);

export default function NodeIOPanel() {
  const { nodes, edges, deleteNode, updateNodeData } = useStore();
  const { idSelected, clearSelection, panelMode } = useSelectedStore();
  const node = nodes.find((n: any) => n.id === idSelected);

  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [outputs, setOutputs] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node?.data?.inputs)
      setInputs(JSON.parse(JSON.stringify(node.data.inputs)));
    if (node?.data?.outputs)
      setOutputs(JSON.parse(JSON.stringify(node.data.outputs)));
  }, [node?.id]);

  // Only show this panel if panelMode is 'io' or undefined (backward compatibility)
  if (!node || (panelMode && panelMode !== 'io')) return null;

  const isBusinessNode = node?.type === "business";

  const getAllPreviousNodes = () => {
    const visited = new Set<string>();
    const list: any[] = [];

    const traverse = (id: string) => {
      edges
        .filter((edge: any) => edge.target === id)
        .forEach((edge: any) => {
          if (!visited.has(edge.source)) {
            visited.add(edge.source);
            const n = nodes.find((x: any) => x.id === edge.source);
            if (n) {
              list.push(n);
              traverse(edge.source);
            }
          }
        });
    };

    if (idSelected) traverse(idSelected);
    return list;
  };

  const previousNodes = getAllPreviousNodes();

  const getAllPreviousOutputs = () => {
    const list: any[] = [];

    previousNodes.forEach((p) => {
      const nodeLabel = p.data.label;
      const nodeId = p.id;

      Object.entries(p.data.outputs || {}).forEach(([okey]) => {
        list.push({
          label: `${nodeLabel} → ${okey}`,
          value: `${nodeId}.${okey}`,
        });
      });
    });

    if (node?.data?.outputs) {
      Object.entries(node.data.outputs).forEach(([okey]) => {
        list.push({
          label: `This Node → ${okey}`,
          value: `${node.id}.${okey}`,
        });
      });
    }

    return list;
  };

  const allPreviousOutputs = getAllPreviousOutputs();

  const updateInput = (key: string, updates: any) => {
    setInputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  };

  const updateOutput = (key: string, updates: any) => {
    setOutputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  };

  const handleAddFormField = (inputKey: string) => {
    setInputs((prev) => ({
      ...prev,
      [inputKey]: {
        ...prev[inputKey],
        formFields: [
          ...(prev[inputKey].formFields || []),
          { name: "", type: "string", access: "write", options: [] },
        ],
      },
    }));
  };

  const handleRemoveFormField = (inputKey: string, idx: number) => {
    setInputs((prev) => {
      const ff = [...(prev[inputKey].formFields || [])];
      ff.splice(idx, 1);
      return {
        ...prev,
        [inputKey]: { ...prev[inputKey], formFields: ff },
      };
    });
  };

  const handleFormFieldChange = (inputKey: string, idx: number, key: string, val: any) => {
    setInputs((prev) => {
      const ff = [...(prev[inputKey].formFields || [])];
      ff[idx] = { ...ff[idx], [key]: val };
      return {
        ...prev,
        [inputKey]: { ...prev[inputKey], formFields: ff },
      };
    });
  };

  const handleApply = () => updateNodeData(node.id, { inputs, outputs });

  const handleReset = () => {
    if (node?.data?.inputs)
      setInputs(JSON.parse(JSON.stringify(node.data.inputs)));
    if (node?.data?.outputs)
      setOutputs(JSON.parse(JSON.stringify(node.data.outputs)));
  };

  const handleDelete = () => {
    if (confirm("Delete this node?")) {
      deleteNode(node.id);
      clearSelection();
    }
  };

  const inputEntries = Object.entries(inputs || {});
  const outputEntries = Object.entries(outputs || {});

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
          zIndex: 999
        }}
        onClick={clearSelection}
      />
      
      {/* Panel */}
      <Panel
        title="Node I/O Configuration"
        onClose={clearSelection}
        footer={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary w-100" onClick={handleReset}>
              Reset
            </button>
            <button className="btn btn-primary w-100" onClick={handleApply}>
              Apply
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} />
            </button>
          </div>
        }
      >
        <div className="mb-3">
          <label className="fw-bold small">Node Type</label>
          <div className="p-2 bg-light border rounded fw-semibold">{node.data.label}</div>
        </div>

        <div className="mb-3">
          <label className="fw-bold small">Node ID</label>
          <div className="p-2 bg-light border rounded small">{node.id}</div>
        </div>

        <hr />

        <h6 className="text-uppercase small fw-bold">Inputs</h6>

        {inputEntries.length === 0 && (
          <div className="text-center small text-muted p-2 border rounded bg-light">
            No inputs defined
          </div>
        )}

        {/* ================= INPUT RENDER SECTION ================= */}
        {inputEntries.map(([key, input], idx) => {
          const isCondition = input?.isConditionInput;

          if (isCondition) {
            return (
              <div key={key} className="border rounded p-3 bg-warning-subtle mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <strong>{key} (Condition)</strong>
                  <span className="badge bg-warning text-dark">Condition</span>
                </div>

                {/* FIELD */}
                <label className="small">Field</label>
                <select
                  className="form-select form-select-sm"
                  value={input.leftField || ""}
                  onChange={(e) =>
                    updateInput(key, {
                      leftField: e.target.value,
                      value: `$${e.target.value} ${input.operator || "=="} ${input.rightValue ?? ""}`,
                    })
                  }
                >
                  <option value="">Select...</option>
                  {allPreviousOutputs.map((o) => (
                    <option value={o.value} key={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {/* ATTRIBUTE */}
                <div className="mt-2">
                  <label className="small">Attribute</label>
                  <input
                    className="form-control form-control-sm"
                    value={input.jsonAttribute || ""}
                    disabled={!input.leftField}
                    onChange={(e) => {
                      const attr = e.target.value;
                      updateInput(key, {
                        jsonAttribute: attr,
                        value: `$${input.leftField}.${attr} ${input.operator} ${input.rightValue ?? ""}`,
                      });
                    }}
                  />
                </div>

                {/* OPERATOR */}
                <div className="mt-2">
                  <label className="small">Operator</label>
                  <select
                    className="form-select form-select-sm"
                    value={input.operator || "=="}
                    onChange={(e) =>
                      updateInput(key, {
                        operator: e.target.value,
                        value: `$${input.leftField} ${e.target.value} ${input.rightValue ?? ""}`,
                      })
                    }
                  >
                    {["==", "!=", ">", "<", ">=", "<=", "is", "is not"].map((op) => (
                      <option key={op}>{op}</option>
                    ))}
                  </select>
                </div>

                {/* VALUE */}
                <div className="mt-2">
                  <label className="small">Value</label>
                  <input
                    className="form-control form-control-sm"
                    value={input.rightValue ?? ""}
                    onChange={(e) =>
                      updateInput(key, {
                        rightValue: e.target.value,
                        value: `$${input.leftField} ${input.operator} ${e.target.value}`,
                      })
                    }
                  />
                </div>

                <div className="mt-2 p-2 bg-warning bg-opacity-25 border rounded small font-monospace">
                  {input.leftField
                    ? `$${input.leftField}.${input.jsonAttribute} ${input.operator} ${input.rightValue}`
                    : "Expression preview"}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="border rounded p-3 bg-primary-subtle mb-3">
              <div className="d-flex justify-content-between mb-2">
                <strong>{key}</strong>
                <span className="badge bg-primary">Input {idx + 1}</span>
              </div>

              {!input.isFixed && (
                <>
                  {!isBusinessNode && (
                    <>
                      <label className="small fw-bold">Input Mode</label>
                      <select
                        className="form-select form-select-sm"
                        value={input.inputMode || "source"}
                        onChange={(e) =>
                          updateInput(key, {
                            inputMode: e.target.value,
                            source: e.target.value === "direct" ? "" : input.source,
                          })
                        }
                      >
                        <option value="source">From Previous Node</option>
                        <option value="direct">Direct Input</option>
                      </select>

                      {input.inputMode !== "direct" && (
                        <>
                          <label className="small mt-2">Source Output</label>
                          <select
                            className="form-select form-select-sm"
                            value={input.source || ""}
                            onChange={(e) =>
                              updateInput(key, { source: e.target.value })
                            }
                          >
                            <option value="">None</option>
                            {allPreviousOutputs.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      {input.inputMode === "direct" && (
                        <div className="mt-2">
                          <label className="small">Direct Value</label>
                          <input
                            className="form-control form-control-sm"
                            value={input.directValue || ""}
                            onChange={(e) =>
                              updateInput(key, { directValue: e.target.value })
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* TYPE */}
              <div className="mt-2">
                <label className="small fw-bold">Type</label>
                <div className="border rounded p-2 bg-light small">
                  {input.dataType}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-2">
                <label className="small fw-bold">Description</label>
                <div className="border rounded p-2 bg-light small">
                  {input.description || "No description"}
                </div>
              </div>

              {/* FORM FIELDS */}
              {input.formFields && (
                <div className="border rounded p-3 bg-white mt-3">
                  <div className="d-flex justify-content-between">
                    <strong className="small">Form Fields</strong>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddFormField(key)}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {input.formFields.map((field: any, i: number) => (
                    <div className="border rounded p-2 mt-2 bg-primary-subtle position-relative" key={i}>
                      <button
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                        onClick={() => handleRemoveFormField(key, i)}
                      >
                        <X size={14} />
                      </button>

                      <label className="small">Name</label>
                      <input
                        className="form-control form-control-sm"
                        value={field.name}
                        onChange={(e) =>
                          handleFormFieldChange(key, i, "name", e.target.value)
                        }
                      />

                      <label className="small mt-2">Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={field.type}
                        onChange={(e) =>
                          handleFormFieldChange(key, i, "type", e.target.value)
                        }
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="boolean">Boolean</option>
                        <option value="file">Document</option>
                      </select>

                      {field.type === "dropdown" && (
                        <>
                          <label className="small mt-2">Options</label>
                          <textarea
                            className="form-control form-control-sm"
                            value={field.options?.join(", ") || ""}
                            onChange={(e) =>
                              handleFormFieldChange(
                                key,
                                i,
                                "options",
                                e.target.value.split(",").map((x) => x.trim())
                              )
                            }
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <hr />

        <h6 className="fw-bold text-uppercase small">Outputs</h6>

        {outputEntries.length === 0 && (
          <div className="text-center text-muted small p-2 border rounded bg-light">
            No outputs
          </div>
        )}

        {outputEntries.map(([key, output], idx) => (
          <div key={key} className="border rounded p-3 bg-success-subtle mb-3">
            <div className="d-flex justify-content-between mb-2">
              <strong>{key}</strong>
              <span className="badge bg-success">Output {idx + 1}</span>
            </div>

            <label className="small">Type</label>
            <div className="border rounded p-2 bg-light small">{output.dataType}</div>

            <label className="small mt-2">Description</label>
            <div className="border rounded p-2 bg-light small">{output.description}</div>
          </div>
        ))}
      </Panel>
    </>
  );
}