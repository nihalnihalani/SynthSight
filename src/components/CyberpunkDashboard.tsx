import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  Database, 
  Eye, 
  Lock, 
  Unlock,
  Activity,
  Cpu,
  Wifi,
  WifiOff,
  Terminal,
  Code,
  Binary,
  Hexagon,
  Triangle,
  Square,
  Circle
} from 'lucide-react';

interface CyberpunkDashboardProps {
  evaluationResults: any[];
  isLoading?: boolean;
}

const CyberpunkDashboard: React.FC<CyberpunkDashboardProps> = ({ evaluationResults, isLoading = false }) => {
  const [isHacked, setIsHacked] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [terminalText, setTerminalText] = useState('');

  // Matrix rain effect
  useEffect(() => {
    if (!matrixMode) return;

    const interval = setInterval(() => {
      setTerminalText(prev => {
        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const newChar = chars[Math.floor(Math.random() * chars.length)];
        return prev + newChar;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [matrixMode]);

  // Scanning animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanningProgress(prev => (prev + 1) % 101);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const MatrixRain = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-green-400 text-xs font-mono opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px'
          }}
          animate={{
            y: [0, window.innerHeight + 20],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        >
          {Array.from({ length: 20 }).map((_, j) => (
            <div key={j}>
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );

  const GlitchText = ({ children, className = '' }: { children: string; className?: string }) => {
    const [glitch, setGlitch] = useState(false);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <motion.div
        className={`relative ${className}`}
        animate={glitch ? { x: [0, -2, 2, 0] } : {}}
        transition={{ duration: 0.1 }}
      >
        {children}
        {glitch && (
          <div className="absolute inset-0 text-red-500 opacity-50">
            {children}
          </div>
        )}
      </motion.div>
    );
  };

  const NeonButton = ({ children, onClick, variant = 'primary' }: any) => {
    const variants = {
      primary: 'border-cyan-400 text-cyan-400 hover:shadow-cyan-400/50',
      danger: 'border-red-400 text-red-400 hover:shadow-red-400/50',
      success: 'border-green-400 text-green-400 hover:shadow-green-400/50'
    };

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`px-4 py-2 border-2 rounded-lg font-mono text-sm transition-all duration-300 hover:shadow-lg ${variants[variant]}`}
      >
        {children}
      </motion.button>
    );
  };

  const HolographicCard = ({ title, value, icon: Icon, status = 'normal' }: any) => {
    const statusColors = {
      normal: 'border-cyan-400/50 bg-cyan-400/5',
      warning: 'border-yellow-400/50 bg-yellow-400/5',
      danger: 'border-red-400/50 bg-red-400/5',
      success: 'border-green-400/50 bg-green-400/5'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02, rotateY: 5 }}
        className={`relative p-6 rounded-lg border-2 ${statusColors[status]} backdrop-blur-sm`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Icon className="h-8 w-8 text-cyan-400" />
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {value}
            </div>
          </div>
          <div className="text-gray-300 text-sm font-mono">{title}</div>
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/20 animate-pulse" />
      </motion.div>
    );
  };

  const TerminalWindow = () => (
    <div className="bg-black/90 rounded-lg p-4 font-mono text-green-400 text-xs h-32 overflow-hidden">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-400 ml-2">ethoslens@terminal</span>
      </div>
      <div className="space-y-1">
        <div>$ scanning_data_streams...</div>
        <div>$ analyzing_compliance_patterns...</div>
        <div>$ detecting_anomalies...</div>
        <div className="text-cyan-400">
          {terminalText.slice(-50)}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-cyan-400"
          >
            _
          </motion.span>
        </div>
      </div>
    </div>
  );

  const ScanningRadar = () => (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"></div>
      <div className="absolute inset-4 border-2 border-cyan-400/20 rounded-full"></div>
      <div className="absolute inset-8 border-2 border-cyan-400/10 rounded-full"></div>
      
      <motion.div
        className="absolute inset-0 border-2 border-cyan-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>
      
      {/* Scanning line */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-cyan-400 to-transparent origin-bottom"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen bg-gray-900 text-white ${matrixMode ? 'overflow-hidden' : ''}`}>
      {matrixMode && <MatrixRain />}
      
      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg">
              <Zap className="h-8 w-8 text-black" />
            </div>
            <div>
              <GlitchText className="text-3xl font-bold font-mono">
                ETHOS_LENS_AI
              </GlitchText>
              <div className="text-gray-400 font-mono text-sm">
                CYBER_SECURITY_PROTOCOL_v2.1
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NeonButton onClick={() => setMatrixMode(!matrixMode)}>
              {matrixMode ? 'DISABLE_MATRIX' : 'ENABLE_MATRIX'}
            </NeonButton>
            <NeonButton 
              onClick={() => setIsHacked(!isHacked)} 
              variant={isHacked ? 'danger' : 'success'}
            >
              {isHacked ? 'SECURITY_BREACH' : 'SYSTEM_SECURE'}
            </NeonButton>
          </div>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-cyan-400/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isHacked ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
                <span className="font-mono text-sm">
                  {isHacked ? 'INTRUSION_DETECTED' : 'SYSTEM_OPERATIONAL'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-cyan-400" />
                <span className="font-mono text-sm">NEURAL_NET_ACTIVE</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                <span className="font-mono text-sm">AI_CORE_98%</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-mono text-sm text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="font-mono text-xs text-cyan-400">
                SCAN_PROGRESS: {scanningProgress}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HolographicCard
            title="DATA_STREAMS"
            value={evaluationResults.length || 0}
            icon={Database}
            status="normal"
          />
          <HolographicCard
            title="SECURITY_LEVEL"
            value="98%"
            icon={Shield}
            status="success"
          />
          <HolographicCard
            title="ANOMALIES"
            value="12"
            icon={AlertTriangle}
            status="warning"
          />
          <HolographicCard
            title="THREAT_LEVEL"
            value={isHacked ? "HIGH" : "LOW"}
            icon={Lock}
            status={isHacked ? "danger" : "success"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/80 rounded-lg p-6 border border-cyan-400/30"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Terminal className="h-5 w-5 text-cyan-400" />
              <span className="font-mono text-cyan-400">SYSTEM_TERMINAL</span>
            </div>
            <TerminalWindow />
          </motion.div>

          {/* Scanning Radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/80 rounded-lg p-6 border border-cyan-400/30 flex flex-col items-center justify-center"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span className="font-mono text-cyan-400">NEURAL_SCANNER</span>
            </div>
            <ScanningRadar />
            <div className="mt-4 text-center">
              <div className="font-mono text-sm text-gray-400">
                SCANNING_FOR_THREATS
              </div>
              <div className="font-mono text-xs text-cyan-400 mt-1">
                {scanningProgress}% COMPLETE
              </div>
            </div>
          </motion.div>
        </div>

        {/* Data Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 rounded-lg p-6 border border-cyan-400/30"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Code className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-cyan-400">DATA_VISUALIZATION_MATRIX</span>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 64 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded border border-cyan-400/30"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.05
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Security Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { name: 'FIREWALL', status: 'ACTIVE', icon: Shield, color: 'green' },
            { name: 'ENCRYPTION', status: 'ENABLED', icon: Lock, color: 'blue' },
            { name: 'MONITORING', status: 'RUNNING', icon: Eye, color: 'purple' }
          ].map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/50 rounded-lg p-4 border border-cyan-400/30"
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`h-6 w-6 text-${item.color}-400`} />
                <div>
                  <div className="font-mono text-sm text-gray-400">{item.name}</div>
                  <div className={`font-mono text-xs text-${item.color}-400`}>
                    {item.status}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CyberpunkDashboard;
