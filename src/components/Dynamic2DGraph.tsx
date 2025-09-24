import { useEffect, useRef, useState, useCallback } from 'react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: any;
  color: string;
  size: number;
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

interface Dynamic2DGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

export function Dynamic2DGraph({ 
  data, 
  width = 800, 
  height = 600, 
  onNodeClick 
}: Dynamic2DGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import the 2D force graph
    import('react-force-graph-2d').then((module) => {
      setForceGraph2D(() => module.default);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  // Get node color based on type
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

  // Get link color based on type
  const getLinkColor = useCallback((link: GraphLink) => {
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

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) {
      onNodeClick(node as GraphNode);
    }
  }, [onNodeClick]);

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading Graph...</p>
        </div>
      </div>
    );
  }

  if (!ForceGraph2D) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <p className="text-sm text-red-600">Graph library failed to load</p>
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
            <span className="text-gray-500 text-xl">📊</span>
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
      <ForceGraph2D
        graphData={data}
        width={width}
        height={height}
        backgroundColor="#ffffff"
        
        // Node styling
        nodeColor={getNodeColor}
        nodeVal={(node: any) => {
          if (node.type === 'Violation') {
            return Math.max(4, (node.properties?.severity || 5) * 0.8);
          }
          return node.type === 'Interaction' ? 8 : 6;
        }}
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
        linkColor={getLinkColor}
        linkWidth={2}
        linkDirectionalArrowLength={6}
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
        
        // Physics
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={200}
        
        // Node canvas rendering for better performance
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.label;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();
          
          // Draw border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2/globalScale;
          ctx.stroke();
          
          // Draw label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#333333';
          ctx.fillText(label, node.x, node.y + (node.val || 5) + fontSize + 2);
        }}
      />
    </div>
  );
}

export default Dynamic2DGraph;
