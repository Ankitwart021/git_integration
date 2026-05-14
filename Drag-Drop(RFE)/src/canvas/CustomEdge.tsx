import { memo } from 'react';
import { type EdgeProps, getBezierPath } from 'reactflow';
import { useSelectedStore } from '../store/useSelectedStore';

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  interactionWidth = 40,
}: EdgeProps) => {
  const { setSelected } = useSelectedStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const hasConditions = data?.conditions && data.conditions.length > 0;

  return (
    <>
      <g className="react-flow__edge" style={{ pointerEvents: 'all' }}>

        {/* Clickable overlay path */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={interactionWidth}
          style={{
            cursor: 'pointer',
            pointerEvents: 'stroke',
          }}
          onClick={() => setSelected('edge', id)}
        />

        {/* Visible edge */}
        <path
          id={id}
          d={edgePath}
          className="react-flow__edge-path transition-all"
          strokeWidth={selected ? 3 : 2}
          strokeDasharray={hasConditions ? '5,5' : '0'}
          fill="none"
          markerEnd={markerEnd}
          data-testid={`edge-${id}`}
          style={{
            pointerEvents: 'none',
            stroke: selected ? '#0d6efd' : 'rgba(33, 37, 41, 0.4)', // primary or muted
            transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
          }}
        />
      </g>

      {(data?.label || hasConditions) && (
        <g
          transform={`translate(${labelX}, ${labelY})`}
          className="cursor-pointer"
          onClick={() => setSelected('edge', id)}
        >
          {/* Bootstrap-style pill background */}
          <rect
            x={-50}
            y={-12}
            width={100}
            height={24}
            rx={12}
            className="bg-light border rounded-pill"
            style={{
              fill: 'white',
              stroke: selected ? '#0d6efd' : '#dee2e6', // primary or border
              strokeWidth: selected ? 2 : 1,
              transition: 'stroke 0.2s ease',
            }}
          />

          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-muted fw-semibold"
            style={{ pointerEvents: 'none', fontSize: '0.75rem' }}
          >
            {data?.label || (hasConditions ? `${data.conditions.length} conditions` : '')}
          </text>
        </g>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
