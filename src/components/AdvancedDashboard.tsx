import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Shield, 
  Database, 
  Eye, 
  Zap,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

interface AdvancedDashboardProps {
  evaluationResults: any[];
  isLoading?: boolean;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ evaluationResults, isLoading = false }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Force re-render for animations
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getAnomalyCounts = () => {
    const counts = {
      data_quality: 0,
      privacy_breach: 0,
      access_violation: 0,
      retention_issue: 0,
      classification_error: 0,
      data_flow_anomaly: 0
    };
    
    evaluationResults.forEach(result => {
      result.anomalies?.forEach((anomaly: any) => {
        counts[anomaly.type as keyof typeof counts] = (counts[anomaly.type as keyof typeof counts] || 0) + 1;
      });
    });
    
    return counts;
  };

  const getRiskDistribution = () => {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    evaluationResults.forEach(result => {
      distribution[result.riskLevel as keyof typeof distribution] = 
        (distribution[result.riskLevel as keyof typeof distribution] || 0) + 1;
    });
    return distribution;
  };

  const getComplianceTrend = () => {
    // Generate mock trend data
    return Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      compliance: Math.floor(Math.random() * 30) + 70,
      violations: Math.floor(Math.random() * 10) + 1,
      anomalies: Math.floor(Math.random() * 15) + 5
    }));
  };

  const anomalyCounts = getAnomalyCounts();
  const riskDistribution = getRiskDistribution();
  const complianceTrend = getComplianceTrend();

  const totalAnomalies = Object.values(anomalyCounts).reduce((sum, count) => sum + count, 0);
  const totalViolations = evaluationResults.reduce((sum, result) => sum + (result.violations?.length || 0), 0);
  const avgCompliance = evaluationResults.length > 0 
    ? Math.round(evaluationResults.reduce((sum, result) => sum + result.overallComplianceScore, 0) / evaluationResults.length)
    : 0;

  const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * value));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{count}</span>;
  };

  const AnimatedPieChart = ({ data, size = 120 }: { data: any; size?: number }) => {
    const total = Object.values(data).reduce((sum: number, value: any) => sum + value, 0);
    let cumulativePercentage = 0;
    
    const colors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444',
      critical: '#7C2D12'
    };

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            const percentage = (value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const x1 = 60 + 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 60 + 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 60 + 50 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 60 + 50 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            const pathData = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            cumulativePercentage += percentage;
            
            return (
              <path
                key={key}
                d={pathData}
                fill={colors[key as keyof typeof colors] || '#6B7280'}
                className="transition-all duration-1000 ease-out"
                style={{
                  strokeDasharray: '314',
                  strokeDashoffset: '314',
                  animation: `drawPie 2s ease-out forwards ${cumulativePercentage * 0.01}s`
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              <AnimatedCounter value={total} />
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const AnimatedBarChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => d.compliance));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <motion.div
            key={item.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 text-xs text-gray-600">{item.day}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(item.compliance / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            <div className="w-8 text-xs font-medium text-gray-900">{item.compliance}%</div>
          </motion.div>
        ))}
      </div>
    );
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    trend = 'up' 
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    color?: string;
    trend?: 'up' | 'down';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
    };

    return (
      <motion.div
        key={animationKey}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {change}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            <AnimatedCounter value={value} />
          </div>
          <div className="text-sm text-gray-600">{title}</div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Intelligent Data Evaluation Dashboard</h2>
            <p className="text-gray-600">Real-time insights and anomaly detection</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Avg Compliance"
          value={avgCompliance}
          change={5.2}
          icon={BarChart3}
          color="blue"
          trend="up"
        />
        <MetricCard
          title="Total Anomalies"
          value={totalAnomalies}
          change={-12.3}
          icon={AlertTriangle}
          color="yellow"
          trend="down"
        />
        <MetricCard
          title="Violations"
          value={totalViolations}
          change={8.1}
          icon={Shield}
          color="red"
          trend="up"
        />
        <MetricCard
          title="Evaluations"
          value={evaluationResults.length}
          change={15.7}
          icon={Database}
          color="green"
          trend="up"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Level Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Risk Level Distribution</h3>
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <AnimatedPieChart data={riskDistribution} size={140} />
          </div>
          
          <div className="mt-6 space-y-2">
            {Object.entries(riskDistribution).map(([level, count]) => {
              const colors = {
                low: 'bg-green-100 text-green-800',
                medium: 'bg-yellow-100 text-yellow-800',
                high: 'bg-orange-100 text-orange-800',
                critical: 'bg-red-100 text-red-800'
              };
              
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      level === 'low' ? 'bg-green-500' :
                      level === 'medium' ? 'bg-yellow-500' :
                      level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-700 capitalize">{level}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
                    <AnimatedCounter value={count as number} />
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Compliance Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Trend</h3>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <AnimatedBarChart data={complianceTrend} />
        </motion.div>
      </div>

      {/* Anomaly Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Detected Anomalies */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Detected Anomalies</h3>
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(anomalyCounts).map(([type, count]) => {
              if (count === 0) return null;
              
              const icons = {
                data_quality: Database,
                privacy_breach: Shield,
                access_violation: Users,
                retention_issue: Clock,
                classification_error: FileText,
                data_flow_anomaly: Activity
              };
              
              const Icon = icons[type as keyof typeof icons] || AlertTriangle;
              
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedAnomaly(type)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Icon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-500">Anomaly detected</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      <AnimatedCounter value={count} />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </motion.div>
              );
            })}
            
            {totalAnomalies === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <div className="text-lg font-medium text-gray-900">No Anomalies Detected</div>
                <div className="text-sm text-gray-500">Your data is clean and compliant</div>
              </div>
            )}
          </div>
        </div>

        {/* Anomaly Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Anomaly Details</h3>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </div>
          
          {selectedAnomaly ? (
            <motion.div
              key={selectedAnomaly}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedAnomaly.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  {anomalyCounts[selectedAnomaly as keyof typeof anomalyCounts]} instances detected
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Severity</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    High
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Impact</span>
                  <span className="text-sm font-medium text-gray-900">Data Quality</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Under Review
                  </span>
                </div>
              </div>
              
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Detailed Analysis
              </button>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Select an Anomaly</div>
              <div className="text-sm text-gray-500">
                Click on an anomaly from the list to view detailed information
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { action: 'Data evaluation completed', time: '2 minutes ago', status: 'success' },
            { action: 'Anomaly detected in dataset', time: '5 minutes ago', status: 'warning' },
            { action: 'Compliance check passed', time: '8 minutes ago', status: 'success' },
            { action: 'New guideline uploaded', time: '12 minutes ago', status: 'info' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
              {activity.status === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : activity.status === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <Zap className="h-4 w-4 text-blue-500" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes drawPie {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedDashboard;
