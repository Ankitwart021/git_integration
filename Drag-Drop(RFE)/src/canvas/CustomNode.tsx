import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import * as Icons from 'lucide-react';
import { useSelectedStore } from '../store/useSelectedStore';
import { type NodeProperty } from '../shared/schema';

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const { setSelected } = useSelectedStore();
  const [showDialog, setShowDialog] = useState(false);
  const Icon = (Icons as any)[data.icon] || Icons.Circle;

  const openDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  const choosePanel = (panel: "properties" | "io") => {
    setSelected("node", id, panel);
    setShowDialog(false);
  };

  const displayProperties = data.properties?.slice(0, 3) || [];

  return (
    <>
      {/* NODE CARD */}
      <div
        onClick={openDialog}
        className={`
          position-relative bg-white border rounded shadow-sm 
          ${selected ? 'border-primary border-2 shadow' : 'border-light'}
          cursor-pointer
        `}
        style={{ width: '200px', transition: 'all 150ms ease' }}
        data-testid={`node-${id}`}
      >

        {/* Top handle */}
        <Handle
          type="target"
          position={Position.Top}
          className="rounded-circle"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#6c757d',
            border: '2px solid white',
          }}
        />

        {/* Header */}
        <div className="d-flex align-items-center gap-2 p-2 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
          <Icon size={18} style={{ color: '#0d6efd' }} />
          <span className="fw-semibold text-truncate" style={{ fontSize: '0.9rem', color: '#212529' }}>
            {data.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-3">
          {displayProperties.map((prop: NodeProperty, idx: number) => (
            <div key={idx} style={{ fontSize: '0.75rem' }}>
              <span className="text-muted">{prop.label}:</span>{' '}
              <span className="fw-semibold text-dark">
                {String(prop.value).substring(0, 20)}
                {String(prop.value).length > 20 ? '...' : ''}
              </span>
            </div>
          ))}

          {data.properties?.length > 3 && (
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              +{data.properties.length - 3} more
            </div>
          )}
        </div>

        {/* Bottom handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="rounded-circle"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#6c757d',
            border: '2px solid white',
          }}
        />
      </div>

      {/* SELECT PANEL DIALOG */}
      {showDialog && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 }}
          onClick={() => setShowDialog(false)}  // close when clicking outside
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: '280px' }}
            onClick={(e) => e.stopPropagation()} // prevent closing on child click
          >
            <h6 className="mb-3 fw-semibold">Open panel for this node</h6>

            <button
              className="btn btn-primary w-100 mb-2"
              onClick={() => choosePanel("properties")}
            >
              Open Properties
            </button>

            <button
              className="btn btn-secondary w-100"
              onClick={() => choosePanel("io")}
            >
              Open IO
            </button>
          </div>
        </div>
      )}
    </>
  );
});

CustomNode.displayName = 'CustomNode';
