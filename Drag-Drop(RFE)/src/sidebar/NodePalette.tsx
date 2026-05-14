import { useState } from 'react';
import { nodeDefinitions } from '../shared/schema';
import * as Icons from 'lucide-react';




export default function NodePalette() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(nodeDefinitions.map(n => n.category)));

  const filteredNodes = nodeDefinitions.filter(node =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="d-flex flex-column h-100 border-end bg-light" style={{ width: '280px' }}>
      <div className="p-3 border-bottom bg-white">
        <div className="position-relative">
          <Icons.Search
            className="position-absolute text-muted"
            style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px' }}
          />
          <input
            type="search"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control ps-5"
            data-testid="input-search-nodes"
          />
        </div>
      </div>

      <div className="flex-fill overflow-auto">
        <div className="p-3">
          {categories.map(category => {
            const categoryNodes = filteredNodes.filter(n => n.category === category);
            if (categoryNodes.length === 0) return null;

            return (
              <div key={category} className="mb-4">
                <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {category}
                </h6>
                <div className="d-flex flex-column gap-2">
                  {categoryNodes.map((node) => {
                    const Icon = (Icons as any)[node.icon] || Icons.Circle;

                    return (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        className="card border shadow-sm p-3"
                        style={{
                          cursor: 'grab',
                          transition: 'all 0.2s'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                        data-testid={`draggable-node-${node.type}`}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div className="flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                            <Icon className="text-primary" style={{ width: '20px', height: '20px' }} />
                          </div>
                          <div className="flex-fill" style={{ minWidth: 0 }}>
                            <div className="fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                              {node.label}
                            </div>
                            <div className="text-muted" style={{
                              fontSize: '0.75rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {node.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}