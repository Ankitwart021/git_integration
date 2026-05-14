import { create } from 'zustand';
import { Workflow } from '../components/WorkflowDashboardComponent';

interface WorkflowStoreState {
  // Workflow metadata
  name: string;
  description: string;
  workflowId: string | null;
  isDirty: boolean;
  isSaving: boolean;

  // Workflow list + selections
  workflows: Workflow[];
  selectedWorkflowId: string;
  selectedWorkflowName: string;

  // Metadata setters
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setWorkflowId: (id: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Workflow list setters
  setWorkflows: (workflows: Workflow[]) => void;
  setSelectedWorkflowId: (workflowId: string) => void;
  setSelectedWorkflowName: (workflowName: string) => void;

  // Getters
  getName: () => string;
  getDescription: () => string;
  getWorkflowId: () => string | null;
  getIsDirty: () => boolean;
  getIsSaving: () => boolean;

  // Reset
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  // Workflow metadata defaults
  name: 'Untitled Workflow',
  description: '',
  workflowId: null,
  isDirty: false,
  isSaving: false,

  // Workflow list + selected workflow defaults
  workflows: [],
  selectedWorkflowId: "",
  selectedWorkflowName: "",

  // ----------- Metadata Setters -----------
  setName: (name) => set({ name, isDirty: true }),
  setDescription: (description) => set({ description, isDirty: true }),
  setWorkflowId: (id) => set({ workflowId: id }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  // ----------- Workflow List Setters -----------
  setWorkflows: (workflows) => set({ workflows }),
  setSelectedWorkflowId: (workflowId) => set({ selectedWorkflowId: workflowId }),
  setSelectedWorkflowName: (workflowName) => set({ selectedWorkflowName: workflowName }),

  // ----------- Getters -----------
  getName: () => get().name,
  getDescription: () => get().description,
  getWorkflowId: () => get().workflowId,
  getIsDirty: () => get().isDirty,
  getIsSaving: () => get().isSaving,

  // ----------- Reset -----------
  reset: () => {
    set({
      name: 'Untitled Workflow',
      description: '',
      workflowId: null,
      isDirty: false,
      isSaving: false,
      workflows: [],
      selectedWorkflowId: "",
      selectedWorkflowName: "",
    });
  },
}));
