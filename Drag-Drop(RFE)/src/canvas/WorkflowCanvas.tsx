import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  ConnectionMode,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { useStore } from '../store/useStore';
import { useSelectedStore } from '../store/useSelectedStore';
import { useParams } from 'react-router-dom';
import { fetchWorkflowInstance } from '../api/workflows';
import { useWorkflowStore } from '../store/useWorkflowStore';
const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges,setNodes } = useStore();
  const {selectedWorkflowId,workflows} = useWorkflowStore();
  const { setSelected, clearSelection } = useSelectedStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { rfInstance,setRfInstance } = useStore();
  
    useEffect(() => {
    if (!selectedWorkflowId) return;

    async function loadWorkflow() {
      const saved = workflows.find(w => w.id === selectedWorkflowId);
      console.log("saved workflow",saved)
      if (!saved) return;

       const flow = typeof saved.workflowData === "string"
      ? JSON.parse(saved.workflowData)
      : saved.workflowData;
      console.log("flow",flow)

      // restore nodes + edges
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);

    }

    loadWorkflow();
  }, [selectedWorkflowId,workflows]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const uuid = crypto.randomUUID();

      const newEdge: Edge = {
        ...connection,
        source: connection.source,
        target: connection.target,
        id: uuid,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#212529', // Bootstrap "foreground"
          width: 50,
          markerUnits: 'userSpaceOnUse',
          strokeWidth: 2,
        },
        data: {
          label: '',
          conditions: [],
        },
        interactionWidth: 40,
      };
      setEdges([...edges, newEdge]);
    },
    [edges, setEdges]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelected('edge', edge.id);
    },
    [setSelected]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div
      ref={reactFlowWrapper}
      className="w-100 h-100"
      style={{ width: '100%', height: '100%' }}
      data-testid="workflow-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        onInit={setRfInstance}
        fitView
        snapToGrid
        snapGrid={[12, 12]}
        defaultEdgeOptions={{
          type: 'custom',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#212529',
          },
        }}
      >
        {/* Background grid */}
        <Background
          gap={24}
          size={2}
          color="#dee2e6" // Bootstrap border color
          className="bg-light"
        />

        {/* Controls (zoom, fit view, etc.) */}
        <Controls
          className="bg-white border rounded shadow-sm p-1"
          style={{
            borderColor: '#dee2e6',
          }}
          data-testid="canvas-controls"
        />

        {/* Minimap */}
        <MiniMap
          className="bg-white border rounded shadow-sm"
          nodeColor="#0d6efd" // Bootstrap primary color
          maskColor="rgba(108,117,125,0.4)" // Bootstrap muted
          style={{
            borderColor: '#dee2e6',
          }}
          data-testid="canvas-minimap"
        />
      </ReactFlow>
    </div>
  );
}
