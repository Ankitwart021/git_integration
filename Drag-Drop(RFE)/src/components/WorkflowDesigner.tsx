import { useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
// import { WorkflowHeader } from '../components/header/WorkflowHeader';

import { WorkflowCanvas } from '../canvas/WorkflowCanvas';
import { NodePropertiesPanel } from '../panels/NodePropertiesPanel';
import { useSelectedStore } from '../store/useSelectedStore';
import { useStore } from '../store/useStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { nodeDefinitions } from '../shared/schema';
import { EdgePropertiesPanel } from '../panels/EdgePropertiesPanel';
import NodeIOPanel from '../panels/NodeIOpanel';
import NodePalette from '../sidebar/NodePalette';
import Navbar2 from './Navbar2';
import { useApplicationContext } from '../context/applicationContext';


export default function WorkflowDesigner() {
  const { typeSelected, panelMode } = useSelectedStore();
  const { addNode, nodes, edges } = useStore();
  const { setIsDirty } = useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { selectedAppData, setSelectedAppData, allApplications, selectedAppName, setSelectedAppName } = useApplicationContext();

  useEffect(() => {
    setIsDirty(true);
  }, [nodes, edges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeDefinition = nodeDefinitions.find(n => n.type === type);

      if (!nodeDefinition) return;

      const Icon = nodeDefinition.icon;
      const UUID = crypto.randomUUID();

      const newNode = {
        id: UUID,
        type: 'custom',
        position: {
          x: event.clientX - reactFlowBounds.left - 100,
          y: event.clientY - reactFlowBounds.top - 50,
        },
        data: {
          label: nodeDefinition.label,
          icon: Icon,
          type: nodeDefinition.type,
          properties: JSON.parse(JSON.stringify(nodeDefinition.defaultProperties)),
          dynamicProperties: nodeDefinition.dynamicProperties ? JSON.parse(JSON.stringify(nodeDefinition.dynamicProperties)) : [],
          inputs: JSON.parse(JSON.stringify(nodeDefinition.inputs)),
          outputs: JSON.parse(JSON.stringify(nodeDefinition.outputs)),
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-100">
      <Navbar2
        AppData={allApplications}
        appIdx={0}  // default index, same as Resource component
        appName={selectedAppName}
        setAppName={setSelectedAppName}
        getAllGridData={() => { }} // pass empty fn because Workflow page doesn’t use grid
      />

      <div
        className="d-flex flex-column bg-light"
        style={{ height: '100vh' }}
      >
        <div className="flex-grow-1 d-flex overflow-hidden">

          <NodePalette />

          <div
            ref={reactFlowWrapper}
            className="flex-grow-1 position-relative"
            style={{ width: '100%', height: '100%' }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlowProvider>
              <WorkflowCanvas />
            </ReactFlowProvider>
          </div>

          {typeSelected === 'node' && panelMode === 'properties' && (
            <>
              <NodePropertiesPanel />
            </>
          )}
          {typeSelected === 'node' && panelMode === 'io' && (
            <>
              <NodeIOPanel />
            </>
          )}
          {typeSelected === 'edge' && <EdgePropertiesPanel />}
        </div>
      </div>
    </div>
  );
}