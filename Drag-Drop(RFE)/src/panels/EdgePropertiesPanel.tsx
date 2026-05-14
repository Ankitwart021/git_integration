import { useEffect, useState } from "react";
import { Panel } from "./Panel";
import { Plus, Trash2, X } from "lucide-react";
import { useStore } from "../store/useStore";
import { useSelectedStore } from "../store/useSelectedStore";

export function EdgePropertiesPanel() {
  const { edges, nodes, updateEdgeData, deleteEdge } = useStore();
  const { idSelected, clearSelection } = useSelectedStore();

  const [label, setLabel] = useState("");
  const [conditionalNodes, setConditionalNodes] = useState<
    { id: string; field: string; operator: string; value: string }[]
  >([]);

  const edge = edges.find((e: any) => e.id === idSelected);

  const fromNode = nodes.find((n: any) => n.id === edge?.source);
  // const toNode = nodes.find((n: any) => n.id === edge?.target); // Unused

  // --- helper to make a safe key from field name: "Decision" -> "decision"
  const makeSafeKey = (name: string) =>
    name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || "";

  /**
   * Build outputFields list:
   * For each dynamicProperty, find outputs whose schemaKey matches the property.key.
   * Then for each field in dynamicProperty.value, create: "<outputKey>.<fieldKey>"
   *
   * Example:
   * dynamicProperties: [{ key: "formFields", value: [{ name: "Decision" }] }]
   * outputs: { form: { schemaKey: "formFields", ... } }
   * => "form.decision"
   */
  // console.log("fromNode", fromNode);
  const dynamicProps = (fromNode?.data?.dynamicProperties || []) as any[];
  const outputs = (fromNode?.data?.outputs || {}) as Record<string, any>;
  // console.log("dynamicProps", dynamicProps);
  // console.log("outputs", outputs);

  const outputFields: string[] = [];

  dynamicProps.forEach((dp) => {
    if (!dp?.key) return;

    // find outputs whose schemaKey matches this dynamic property's key
    Object.entries(outputs).forEach(([outKey, outVal]) => {
      if ((outVal as any)?.schemaKey !== dp.key) return;


      // dp.value is expected to be an array of form fields
      if (Array.isArray(dp.value)) {
        dp.value.forEach((field: any) => {
          const safeFieldKey = makeSafeKey(field?.name);
          if (!safeFieldKey) return;
          // e.g. "form.decision"
          outputFields.push(`${outKey}.${safeFieldKey}`);
        });
      }
    });
  });

  outputFields.push(...Object.keys(outputs)); // also add raw output keys for flexibility

  // If no dynamic outputs are found, you *could* optionally fall back to raw outputs:
  // const fallbackOutputFields =
  //   outputFields.length === 0 ? Object.keys(outputs) : outputFields;
  // For now we stick strictly to dynamic ones:
  const fieldsForDropdown = outputFields;

  //
  // Operators (supports Python-style)
  //
  const operators = [
    "==",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "is",
    "is not",
    "not", // unary
    "is False",
    "is True",
  ];

  //
  // Load existing edge data
  //
  useEffect(() => {
    if (edge) {
      setLabel(edge.data?.label || "");

      const existingConds = edge.data?.conditional_nodes || [];

      const parsed = existingConds.map((cond: any) => {
        return {
          id: `cond-${Date.now()}-${Math.random()}`,
          field: cond.field || "",
          operator: cond.operator || "==",
          value: cond.value || "",
        };
      });

      setConditionalNodes(parsed);
    }
  }, [edge]);

  if (!edge) return null;

  //
  // APPLY — Convert UI → Proper condition strings
  //
  const handleApply = () => {
    const formattedConditions = conditionalNodes.map((cond) => {
      let conditionStr = "";

      // Unary operator: "not"
      if (cond.operator === "not") {
        conditionStr = `not $${edge.source}.${cond.field}`;
      }

      // Python identity ops: "is" / "is not"
      else if (cond.operator === "is" || cond.operator === "is not") {
        conditionStr = `$${edge.source}.${cond.field} ${cond.operator} ${cond.value}`;
      }

      // Standard ops with quoted value
      else {
        conditionStr = `$${edge.source}.${cond.field} ${cond.operator} '${cond.value}'`;
      }

      return {
        condition: conditionStr,
        node: edge.target,
        field: cond.field,
        operator: cond.operator,
        value: cond.value,
      };
    });

    updateEdgeData(edge.id, {
      label,
      conditional_nodes:
        formattedConditions.length > 0 ? formattedConditions : undefined,
    });
  };

  const handleReset = () => {
    setLabel(edge.data?.label || "");
    setConditionalNodes([]);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this edge?")) {
      deleteEdge(edge.id);
      clearSelection();
    }
  };

  //
  // Add a new empty condition block
  //
  const addConditionalNode = () => {
    setConditionalNodes([
      ...conditionalNodes,
      {
        id: `cond-${Date.now()}`,
        field: fieldsForDropdown[0] || "",
        operator: "==",
        value: "",
      },
    ]);
  };

  const removeConditionalNode = (id: string) => {
    setConditionalNodes(conditionalNodes.filter((c) => c.id !== id));
  };

  const updateConditionalNode = (
    id: string,
    updates: Partial<{ field: string; operator: string; value: string }>
  ) => {
    setConditionalNodes(
      conditionalNodes.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  //
  // RENDER
  //
  return (
    <Panel
      title="Edge Properties"
      onClose={clearSelection}
      footer={
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary flex-fill"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="btn btn-primary flex-fill"
            onClick={handleApply}
          >
            Apply
          </button>
          <button
            className="btn btn-danger flex-fill"
            style={{ maxWidth: "50px" }}
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="vstack gap-3">
        {/* Edge ID */}
        <div>
          <label className="form-label text-muted small fw-bold mb-1">
            Edge ID
          </label>
          <div className="bg-light p-2 rounded small text-muted text-break font-monospace">
            {edge.id}
          </div>
        </div>

        {/* Connection */}
        <div>
          <label className="form-label text-muted small fw-bold mb-1">
            Connection
          </label>
          <div className="bg-light p-2 rounded small text-muted">
            {edge.source} → {edge.target}
          </div>
        </div>

        <hr className="my-2" />

        {/* Label */}
        <div>
          <label className="form-label">Label</label>
          <input
            type="text"
            className="form-control"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Optional label"
          />
        </div>

        <hr className="my-2" />

        {/* Conditional Nodes */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-bold mb-0">Conditions</label>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center"
              onClick={addConditionalNode}
            >
              <Plus className="w-3 h-3 me-1" /> Add
            </button>
          </div>

          {conditionalNodes.length === 0 && (
            <div className="alert alert-secondary text-center py-3 mb-0 text-muted small">
              No conditions
            </div>
          )}

          <div className="vstack gap-2">
            {conditionalNodes.map((cond, index) => (
              <div
                key={cond.id}
                className="card bg-light border-0"
              >
                <div className="card-body p-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold">Condition {index + 1}</span>
                    <button
                      className="btn btn-sm btn-link text-secondary p-0"
                      onClick={() => removeConditionalNode(cond.id)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="d-flex gap-2">
                    {/* Field */}
                    <div className="flex-fill">
                      <select
                        className="form-select form-select-sm"
                        value={cond.field}
                        onChange={(e) =>
                          updateConditionalNode(cond.id, { field: e.target.value })
                        }
                      >
                        <option value="" disabled>Field</option>
                        {fieldsForDropdown.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div style={{ width: "80px" }}>
                      <select
                        className="form-select form-select-sm"
                        value={cond.operator}
                        onChange={(e) =>
                          updateConditionalNode(cond.id, { operator: e.target.value })
                        }
                      >
                        {operators.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value */}
                    <div className="flex-fill">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={cond.value}
                        disabled={cond.operator === "not"}
                        onChange={(e) =>
                          updateConditionalNode(cond.id, { value: e.target.value })
                        }
                        placeholder="Value"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-2" />
      </div>
    </Panel>
  );
}
