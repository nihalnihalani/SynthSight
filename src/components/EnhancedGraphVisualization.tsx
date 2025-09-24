import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import Interactive3DGraph from './Interactive3DGraph';
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

const EnhancedGraphVisualization: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching graph data for 3D visualization...');
      const data = await apiService.getGraphData();
      console.log('3D Graph data received:', data);
      setGraphData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load graph data');
      console.error('3D Graph data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchGraphData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchGraphData, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [fetchGraphData, autoRefresh]);

  // Filter data based on selected type
  const filteredData = React.useMemo(() => {
    if (filterType === 'all') return graphData;
    
    const filteredNodes = graphData.nodes.filter(node => 
      filterType === 'violations' ? node.type === 'Violation' :
      filterType === 'interactions' ? node.type === 'Interaction' :
      filterType === 'actions' ? node.type === 'AgentAction' :
      true
    );
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => 
      nodeIds.has(link.source) && nodeIds.has(link.target)
    );
    
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, filterType]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  // Handle node hover
  const handleNodeHover = useCallback((_node: GraphNode | null) => {
    // Could add hover effects here
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
  const graphHeight = isFullscreen ? window.innerHeight : 600;

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
            <p className="text-gray-600">Loading 3D Knowledge Graph...</p>
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
            <h3 className="text-lg font-semibold text-black">3D Knowledge Graph</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{filteredData.nodes.length} nodes</span>
              <span>•</span>
              <span>{filteredData.links.length} relationships</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Filter Controls */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Nodes</option>
              <option value="interactions">Interactions</option>
              <option value="violations">Violations</option>
              <option value="actions">Agent Actions</option>
            </select>
            
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-1 rounded ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Controls toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              title="Toggle controls"
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
            <Interactive3DGraph
              data={filteredData}
              width={graphWidth - (showControls ? 300 : 0)}
              height={graphHeight - 60}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
            />
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto"
                style={{ height: graphHeight - 60 }}
              >
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
                      {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Properties:</div>
                          <div className="space-y-1">
                            {Object.entries(selectedNode.properties).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-gray-500">{key}:</span>
                                <span className="ml-1 text-gray-700">
                                  {typeof value === 'string' ? value.substring(0, 30) + (value.length > 30 ? '...' : '') : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>User Feedback</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedGraphVisualization;
