import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Network, 
  Layers, 
  Zap, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  Database,
  Eye,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Interactive3DDashboardProps {
  evaluationResults: any[];
  isLoading?: boolean;
}

const Interactive3DDashboard: React.FC<Interactive3DDashboardProps> = ({ evaluationResults, isLoading = false }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // 3D Globe Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    const drawGlobe = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw globe
      const gradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 0, centerX, centerY, radius);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(1, '#1E40AF');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw data points
      const dataPoints = evaluationResults.length || 5;
      for (let i = 0; i < dataPoints; i++) {
        const angle = (i / dataPoints) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * (radius + 20);
        const y = centerY + Math.sin(angle) * (radius + 20);
        
        ctx.fillStyle = i % 2 === 0 ? '#10B981' : '#EF4444';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connection lines
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      if (isPlaying) {
        setRotation(prev => prev + 0.02);
      }
      drawGlobe();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [evaluationResults.length, isPlaying, rotation]);

  // Network Visualization
  const NetworkVisualization = () => {
    const nodes = [
      { id: 'data', x: 100, y: 100, type: 'data', size: 20 },
      { id: 'compliance', x: 300, y: 100, type: 'compliance', size: 25 },
      { id: 'anomaly', x: 200, y: 200, type: 'anomaly', size: 15 },
      { id: 'security', x: 100, y: 300, type: 'security', size: 22 },
      { id: 'quality', x: 300, y: 300, type: 'quality', size: 18 }
    ];

    const connections = [
      { from: 'data', to: 'compliance' },
      { from: 'data', to: 'anomaly' },
      { from: 'compliance', to: 'security' },
      { from: 'anomaly', to: 'quality' },
      { from: 'security', to: 'quality' }
    ];

    return (
      <div className="relative w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
        <svg className="w-full h-full">
          {/* Connections */}
          {connections.map((conn, index) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            
            return (
              <motion.line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.2 }}
              />
            );
          })}
          
          {/* Nodes */}
          {nodes.map((node, index) => {
            const colors = {
              data: '#3B82F6',
              compliance: '#10B981',
              anomaly: '#EF4444',
              security: '#F59E0B',
              quality: '#8B5CF6'
            };
            
            return (
              <motion.circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={colors[node.type as keyof typeof colors]}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
              />
            );
          })}
        </svg>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    );
  };

  // Holographic Card
  const HolographicCard = ({ title, value, icon: Icon, color = 'blue' }: any) => {
    const colorClasses = {
      blue: 'from-blue-500 via-purple-500 to-pink-500',
      green: 'from-green-500 via-emerald-500 to-teal-500',
      red: 'from-red-500 via-orange-500 to-yellow-500',
      purple: 'from-purple-500 via-pink-500 to-red-500'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.05, rotateY: 5 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r opacity-75 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm"
             style={{ background: `linear-gradient(45deg, ${colorClasses[color as keyof typeof colorClasses]})` }} />
        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <Icon className="h-8 w-8 text-white" />
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
          <div className="text-white/80 text-sm">{title}</div>
        </div>
      </motion.div>
    );
  };

  // Data Flow Animation
  const DataFlowAnimation = () => {
    return (
      <div className="relative h-32 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-400 rounded-full"
              style={{
                left: `${i * 12.5}%`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              animate={{
                x: [0, 100, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-8' : ''}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">3D Interactive Dashboard</h2>
            <p className="text-gray-300">Immersive data visualization and analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Holographic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HolographicCard
          title="Data Points"
          value={evaluationResults.length || 0}
          icon={Database}
          color="blue"
        />
        <HolographicCard
          title="Compliance Rate"
          value="94%"
          icon={Shield}
          color="green"
        />
        <HolographicCard
          title="Anomalies"
          value="12"
          icon={AlertTriangle}
          color="red"
        />
        <HolographicCard
          title="Performance"
          value="98%"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* 3D Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3D Globe */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Global Data Flow</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Live</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="border border-white/20 rounded-lg"
            />
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-300">
              Real-time data processing across {evaluationResults.length || 5} nodes
            </div>
          </div>
        </motion.div>

        {/* Network Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Network Topology</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          
          <NetworkVisualization />
          
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
            >
              <div className="text-white font-medium capitalize">{selectedNode.type} Node</div>
              <div className="text-gray-300 text-sm">Size: {selectedNode.size}px</div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Data Flow Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Real-time Data Stream</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              <span className="text-green-400">●</span> Processing
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-blue-400">●</span> Analyzing
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-purple-400">●</span> Storing
            </div>
          </div>
        </div>
        
        <DataFlowAnimation />
      </motion.div>

      {/* Interactive Layers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { name: 'Data Layer', icon: Database, color: 'blue', status: 'Active' },
          { name: 'Security Layer', icon: Shield, color: 'green', status: 'Protected' },
          { name: 'Analysis Layer', icon: Layers, color: 'purple', status: 'Processing' }
        ].map((layer, index) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 bg-${layer.color}-500/20 rounded-lg`}>
                <layer.icon className={`h-6 w-6 text-${layer.color}-400`} />
              </div>
              <div>
                <div className="text-white font-medium">{layer.name}</div>
                <div className="text-gray-300 text-sm">{layer.status}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Health</span>
                <span className="text-green-400">98%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Interactive3DDashboard;
