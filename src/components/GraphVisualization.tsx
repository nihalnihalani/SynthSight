import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Database, Activity, AlertTriangle } from 'lucide-react';
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
  properties: any;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const GraphVisualization: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching graph data...');
        const data = await apiService.getGraphData();
        console.log('Graph data received:', data);
        setGraphData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load graph data');
        console.error('Graph data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
    const interval = setInterval(fetchGraphData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'Interaction':
        return <Activity className="h-4 w-4" />;
      case 'Violation':
        return <AlertTriangle className="h-4 w-4" />;
      case 'AgentAction':
        return <Network className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getNodeTypeStats = () => {
    const stats: { [key: string]: number } = {};
    graphData.nodes.forEach(node => {
      stats[node.type] = (stats[node.type] || 0) + 1;
    });
    return stats;
  };

  const getRelationshipStats = () => {
    const stats: { [key: string]: number } = {};
    graphData.links.forEach(link => {
      stats[link.type] = (stats[link.type] || 0) + 1;
    });
    return stats;
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading graph data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-64 text-red-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const nodeStats = getNodeTypeStats();
  const relationshipStats = getRelationshipStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-black">Knowledge Graph Overview</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              console.log('Manual refresh clicked');
              const fetchGraphData = async () => {
                try {
                  setIsLoading(true);
                  console.log('Manual fetch: Fetching graph data...');
                  const data = await apiService.getGraphData();
                  console.log('Manual fetch: Graph data received:', data);
                  setGraphData(data);
                  setError(null);
                } catch (err) {
                  setError('Failed to load graph data');
                  console.error('Manual fetch: Graph data fetch error:', err);
                } finally {
                  setIsLoading(false);
                }
              };
              fetchGraphData();
            }}
            className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
          >
            Refresh
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Database className="h-4 w-4" />
            <span>Neo4j Graph Database</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Node Statistics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Node Types</h4>
          <div className="space-y-2">
            {Object.entries(nodeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {getNodeTypeIcon(type)}
                  <span className="text-sm text-gray-700">{type}</span>
                </div>
                <span className="text-sm font-medium text-black">{count}</span>
              </div>
            ))}
          </div>
          {Object.keys(nodeStats).length === 0 && (
            <p className="text-sm text-gray-500 italic">No nodes found</p>
          )}
        </div>

        {/* Relationship Statistics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Relationships</h4>
          <div className="space-y-2">
            {Object.entries(relationshipStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{type}</span>
                </div>
                <span className="text-sm font-medium text-black">{count}</span>
              </div>
            ))}
          </div>
          {Object.keys(relationshipStats).length === 0 && (
            <p className="text-sm text-gray-500 italic">No relationships found</p>
          )}
        </div>
      </div>

      {/* Graph Summary */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-black">{graphData.nodes.length}</div>
            <div className="text-sm text-gray-500">Total Nodes</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-black">{graphData.links.length}</div>
            <div className="text-sm text-gray-500">Total Relationships</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-black">
              {Object.keys(nodeStats).length + Object.keys(relationshipStats).length}
            </div>
            <div className="text-sm text-gray-500">Graph Elements</div>
          </div>
        </div>
      </div>

      {/* Graph Status */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Graph database connected</span>
        </div>
        <div className="text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Integration Ready Indicator */}
      {graphData.nodes.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Network className="h-4 w-4" />
            <span className="text-sm font-medium">Ready for Thinking Graph Integration</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Graph relationships are properly structured for knowledge graph visualization
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GraphVisualization;
