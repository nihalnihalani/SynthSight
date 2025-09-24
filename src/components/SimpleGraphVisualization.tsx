import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  Maximize2, 
  Minimize2,
  RefreshCw, 
  Eye,
  EyeOff,
  Database,
  Activity,
  AlertTriangle,
  Users,
  FileText
} from 'lucide-react';
import Dynamic2DGraph from './Dynamic2DGraph';
import { apiService } from '../api/apiService';

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

const SimpleGraphVisualization: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching graph data for 2D visualization...');
      const data = await apiService.getGraphData();
      console.log('2D Graph data received:', data);
      setGraphData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load graph data');
      console.error('2D Graph data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchGraphData();
    const interval = setInterval(fetchGraphData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchGraphData]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    console.log('Node clicked:', node);
  }, []);

  // Get node type icon
  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'Interaction':
        return <Activity className="h-4 w-4" />;
      case 'Violation':
        return <AlertTriangle className="h-4 w-4" />;
      case 'AgentAction':
        return <Users className="h-4 w-4" />;
      case 'UserFeedback':
        return <FileText className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Get statistics
  const stats = React.useMemo(() => {
    const nodeTypes: { [key: string]: number } = {};
    const linkTypes: { [key: string]: number } = {};
    
    graphData.nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });
    
    graphData.links.forEach(link => {
      linkTypes[link.type] = (linkTypes[link.type] || 0) + 1;
    });
    
    return { nodeTypes, linkTypes };
  }, [graphData]);

  const graphWidth = isFullscreen ? window.innerWidth : 800;
  const graphHeight = isFullscreen ? window.innerHeight : 500;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Knowledge Graph...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-center h-96 text-red-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Network className="h-5 w-5 text-black" />
            <h3 className="text-lg font-semibold text-black">Knowledge Graph</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{graphData.nodes.length} nodes</span>
              <span>•</span>
              <span>{graphData.links.length} relationships</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controls toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              title="Toggle info panel"
            >
              {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            {/* Manual refresh */}
            <button
              onClick={fetchGraphData}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              title="Refresh graph"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Main Graph Area */}
          <div className="flex-1">
            <Dynamic2DGraph
              data={graphData}
              width={graphWidth - (showControls ? 300 : 0)}
              height={graphHeight}
              onNodeClick={handleNodeClick}
            />
          </div>

          {/* Side Panel */}
          {showControls && (
            <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto" style={{ height: graphHeight }}>
              {/* Statistics */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Graph Statistics</h4>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-gray-500">Total Nodes:</span>
                    <span className="ml-2 font-medium">{graphData.nodes.length}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Total Relationships:</span>
                    <span className="ml-2 font-medium">{graphData.links.length}</span>
                  </div>
                </div>
              </div>

              {/* Node Types */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Node Types</h4>
                <div className="space-y-2">
                  {Object.entries(stats.nodeTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        {getNodeTypeIcon(type)}
                        <span className="text-xs text-gray-700">{type}</span>
                      </div>
                      <span className="text-xs font-medium text-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationship Types */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Relationships</h4>
                <div className="space-y-2">
                  {Object.entries(stats.linkTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-xs text-gray-700">{type}</span>
                      <span className="text-xs font-medium text-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Node Details */}
              {selectedNode && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Node</h4>
                  <div className="bg-white rounded border p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {getNodeTypeIcon(selectedNode.type)}
                      <span className="text-sm font-medium text-black">{selectedNode.type}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Label:</strong> {selectedNode.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>ID:</strong> {selectedNode.id}
                    </div>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Interactions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Violations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Agent Actions</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SimpleGraphVisualization;
