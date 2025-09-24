import { useEffect, useRef, useState, useCallback } from 'react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: any;
  color: string;
  size: number;
  x?: number;
  y?: number;
  z?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  properties?: any;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface Interactive3DGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}

export function Interactive3DGraph({ 
  data, 
  width = 800, 
  height = 600, 
  onNodeClick, 
  onNodeHover 
}: Interactive3DGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const forceGraphRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ForceGraph3D, setForceGraph3D] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import the 3D force graph to avoid SSR issues
    import('react-force-graph-3d').then((module) => {
      setForceGraph3D(() => module.default);
      setIsLoading(false);
    });
  }, []);

  // Generate node color based on type
  const getNodeColor = useCallback((node: GraphNode) => {
    const colors: Record<string, string> = {
      'Interaction': '#4A90E2',
      'Violation': '#E74C3C',
      'AgentAction': '#2ECC71',
      'UserFeedback': '#F39C12',
      'AuditLog': '#9B59B6',
      'Settings': '#95A5A6'
    };
    return colors[node.type] || '#95A5A6';
  }, []);

  // Get relationship color
  const getRelationshipColor = useCallback((link: GraphLink) => {
    const colors: Record<string, string> = {
      'HAS_VIOLATION': '#E74C3C',
      'PROCESSED_BY': '#2ECC71',
      'TRIGGERED_ACTION': '#F39C12',
      'HAS_FEEDBACK': '#3498DB',
      'AUDITS': '#9B59B6',
      'default': '#888888'
    };
    return colors[link.type] || colors.default;
  }, []);

  // Node size based on type and properties
  const getNodeSize = useCallback((node: GraphNode) => {
    if (node.type === 'Violation') {
      return Math.max(4, (node.properties?.severity || 5) * 0.8);
    }
    return node.type === 'Interaction' ? 6 : 4;
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) {
      onNodeClick(node as GraphNode);
    }
  }, [onNodeClick]);

  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    if (onNodeHover) {
      onNodeHover(node as GraphNode);
    }
  }, [onNodeHover]);

  if (!isClient || isLoading || !ForceGraph3D) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading 3D Graph...</p>
        </div>
      </div>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">No graph data available</p>
          <p className="text-xs text-gray-400 mt-1">Process some interactions to see the graph</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
      style={{ width, height }}
    >
      <ForceGraph3D
        ref={forceGraphRef}
        graphData={data}
        width={width}
        height={height}
        backgroundColor="#ffffff"
        showNavInfo={false}
        controlType="orbit"
        
        // Node styling
        nodeColor={getNodeColor}
        nodeVal={getNodeSize}
        nodeLabel={(node: any) => `
          <div style="
            background: rgba(0,0,0,0.8); 
            color: white; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-size: 12px;
            max-width: 200px;
          ">
            <strong>${node.type}</strong><br/>
            ${node.label}<br/>
            <small style="opacity: 0.8;">Click for details</small>
          </div>
        `}
        
        // Link styling
        linkColor={getRelationshipColor}
        linkWidth={2}
        linkOpacity={0.6}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkLabel={(link: any) => `
          <div style="
            background: rgba(0,0,0,0.8); 
            color: white; 
            padding: 6px 10px; 
            border-radius: 4px; 
            font-size: 11px;
          ">
            ${link.type}
          </div>
        `}
        
        // Interactions
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        
        // Physics
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={200}
        
        // Camera
        cameraPosition={{ x: 0, y: 0, z: 300 }}
        
        // Node rendering
        nodeThreeObject={(node: any) => {
          const sprite = new (window as any).THREE.Sprite(
            new (window as any).THREE.SpriteMaterial({
              map: new (window as any).THREE.CanvasTexture(
                (() => {
                  const canvas = document.createElement('canvas');
                  const size = 64;
                  canvas.width = size;
                  canvas.height = size;
                  const ctx = canvas.getContext('2d')!;
                  
                  // Draw circle
                  ctx.beginPath();
                  ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
                  ctx.fillStyle = getNodeColor(node);
                  ctx.fill();
                  
                  // Draw border
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                  
                  // Draw icon based on type
                  ctx.fillStyle = '#ffffff';
                  ctx.font = '20px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  
                  const icons: Record<string, string> = {
                    'Interaction': '💬',
                    'Violation': '⚠️',
                    'AgentAction': '🤖',
                    'UserFeedback': '👤',
                    'AuditLog': '📋',
                    'Settings': '⚙️'
                  };
                  
                  ctx.fillText(icons[node.type] || '●', size/2, size/2);
                  
                  return canvas;
                })()
              ),
              transparent: true
            })
          );
          
          sprite.scale.set(getNodeSize(node) * 8, getNodeSize(node) * 8, 1);
          return sprite;
        }}
      />
    </div>
  );
}

export default Interactive3DGraph;
