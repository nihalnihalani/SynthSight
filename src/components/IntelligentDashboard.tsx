import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Database, 
  Eye, 
  Activity,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { DataEvaluationResult, Anomaly, ComplianceViolation } from '../services/companyGuidelinesService';

interface IntelligentDashboardProps {
  evaluationResults: DataEvaluationResult[];
  isLoading?: boolean;
}

const IntelligentDashboard: React.FC<IntelligentDashboardProps> = ({ 
  evaluationResults, 
  isLoading = false 
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);

  useEffect(() => {
    if (evaluationResults.length > 0) {
      calculateDashboardMetrics();
    }
  }, [evaluationResults]);

  const calculateDashboardMetrics = () => {
    const totalEvaluations = evaluationResults.length;
    const avgComplianceScore = evaluationResults.reduce((sum, result) => sum + result.complianceScore, 0) / totalEvaluations;
    
    const riskDistribution = evaluationResults.reduce((acc, result) => {
      acc[result.riskLevel] = (acc[result.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const anomalyTypes = evaluationResults.flatMap(result => result.anomalies);
    const anomalyDistribution = anomalyTypes.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const violationTypes = evaluationResults.flatMap(result => result.violations);
    const violationDistribution = violationTypes.reduce((acc, violation) => {
      acc[violation.ruleType] = (acc[violation.ruleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setDashboardMetrics({
      totalEvaluations,
      avgComplianceScore: Math.round(avgComplianceScore),
      riskDistribution,
      anomalyDistribution,
      violationDistribution,
      totalAnomalies: anomalyTypes.length,
      totalViolations: violationTypes.length
    });
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderVisualization = (anomaly: Anomaly) => {
    const { type, metrics, visualizationType } = anomaly;

    switch (visualizationType) {
      case 'chart':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Data Quality Chart</h4>
            <div className="h-32 flex items-end space-x-2">
              <div className="bg-blue-500 w-8 rounded-t" style={{ height: `${metrics.completeness * 100}%` }}></div>
              <div className="bg-green-500 w-8 rounded-t" style={{ height: `${metrics.accuracy * 100}%` }}></div>
              <div className="bg-purple-500 w-8 rounded-t" style={{ height: `${metrics.confidence * 100}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Completeness</span>
              <span>Accuracy</span>
              <span>Confidence</span>
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Privacy Risk Heatmap</h4>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded ${
                    Math.random() > 0.7 ? 'bg-red-500' : 
                    Math.random() > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Access Violation Timeline</h4>
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div className="h-full bg-red-500 rounded" style={{ width: `${Math.random() * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-600">-{i + 1}h</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'scatter':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Retention Issue Scatter Plot</h4>
            <div className="h-32 relative">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full"
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`
                  }}
                ></div>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Data Age vs Retention Policy
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Classification Error Table</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Field</th>
                    <th className="text-left py-2">Expected</th>
                    <th className="text-left py-2">Actual</th>
                    <th className="text-left py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }, (_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">Field {i + 1}</td>
                      <td className="py-2">Sensitive</td>
                      <td className="py-2 text-red-600">Public</td>
                      <td className="py-2">{Math.round(Math.random() * 40 + 60)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Data Flow Network</h4>
            <div className="h-32 relative">
              <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">A</div>
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">B</div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">C</div>
              <svg className="absolute inset-0 w-full h-full">
                <line x1="20" y1="20" x2="80" y2="20" stroke="#ef4444" strokeWidth="2" />
                <line x1="50" y1="20" x2="50" y2="80" stroke="#ef4444" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Data Flow with Violations
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Default Visualization</h4>
            <div className="h-32 flex items-center justify-center text-gray-500">
              No specific visualization available
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardMetrics) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Upload company guidelines and evaluate data to see insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.avgComplianceScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalAnomalies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Violations</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalViolations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalEvaluations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dashboardMetrics.riskDistribution).map(([risk, count]) => (
            <div key={risk} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk)}`}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count as number}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Anomalies</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {evaluationResults.flatMap(result => result.anomalies).map((anomaly, index) => (
              <div
                key={anomaly.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedAnomaly(anomaly)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      anomaly.severity === 'critical' ? 'bg-red-500' :
                      anomaly.severity === 'high' ? 'bg-orange-500' :
                      anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{anomaly.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{anomaly.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedAnomaly ? 'Anomaly Visualization' : 'Select an Anomaly'}
          </h3>
          {selectedAnomaly ? (
            <div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{selectedAnomaly.type.replace('_', ' ')}</h4>
                <p className="text-sm text-gray-600">{selectedAnomaly.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedAnomaly.severity)}`}>
                    {selectedAnomaly.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    Confidence: {Math.round(selectedAnomaly.confidence * 100)}%
                  </span>
                </div>
              </div>
              {renderVisualization(selectedAnomaly)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4" />
                <p>Click on an anomaly to view its visualization</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Violations Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Violations</h3>
        <div className="space-y-4">
          {evaluationResults.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{result.dataType}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(result.riskLevel)}`}>
                    {result.riskLevel}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{result.complianceScore}%</span>
                </div>
              </div>
              
              {result.violations.length > 0 && (
                <div className="space-y-2">
                  {result.violations.map((violation, vIndex) => (
                    <div key={vIndex} className="flex items-center space-x-3 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-gray-700">{violation.description}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {result.violations.length === 0 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">No violations detected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntelligentDashboard;
