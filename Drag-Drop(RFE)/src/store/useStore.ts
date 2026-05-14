import { create } from 'zustand';

import { type Edge, type Node, applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange, ReactFlowInstance } from 'reactflow';

interface StoreState {
  nodes: Node[];
  edges: Edge[];
  rfInstance: any | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  updateEdgeData: (edgeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setRfInstance: (instance: any | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  rfInstance: null,
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  addNode: (node) => {
    console.log('Adding node:', node);
    set({ nodes: [...get().nodes, node] });
  },
  
  updateNodeData: (nodeId, newData) => {
  set({
    nodes: get().nodes.map((node) => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        data: {
          ...node.data,
          ...newData,

          // Merge inputs deeply
          inputs: newData.inputs
            ? {
                ...node.data.inputs,
                ...newData.inputs,
              }
            : node.data.inputs,

          // Merge outputs deeply
          outputs: newData.outputs
            ? {
                ...node.data.outputs,
                ...newData.outputs,
              }
            : node.data.outputs,
        }
      };
    }),
  });
},

  
  updateEdgeData: (edgeId, data) => {
      set({
      edges: get().edges.map(edge =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge
      ),
    });
  },
  
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      edges: get().edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
    });   
  },
  
  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter(edge => edge.id !== edgeId),
    });
  },
  setRfInstance: (instance) => set({ rfInstance: instance }),
}));
