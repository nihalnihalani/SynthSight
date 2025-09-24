import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ViolationChartProps {
  violations: Array<{ type: string; count: number }>;
}

const ViolationChart: React.FC<ViolationChartProps> = ({ violations }) => {
  if (violations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <p className="text-gray-500">No violation data available yet.</p>
          <p className="text-sm text-gray-400 mt-1">Charts will appear here once violations are detected.</p>
        </div>
      </div>
    );
  }

  const barData = {
    labels: violations.map(v => v.type.toUpperCase()),
    datasets: [
      {
        label: 'Violations',
        data: violations.map(v => v.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',   // PII - Red
          'rgba(245, 158, 11, 0.6)',  // Misinformation - Orange
          'rgba(168, 85, 247, 0.6)',  // Bias - Purple
          'rgba(59, 130, 246, 0.6)',  // Hallucination - Blue
          'rgba(220, 38, 127, 0.6)',  // Hate Speech - Pink
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',     // PII - Red
          'rgba(245, 158, 11, 1)',    // Misinformation - Orange
          'rgba(168, 85, 247, 1)',    // Bias - Purple
          'rgba(59, 130, 246, 1)',    // Hallucination - Blue
          'rgba(220, 38, 127, 1)',    // Hate Speech - Pink
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: violations.map(v => v.type.toUpperCase()),
    datasets: [
      {
        data: violations.map(v => v.count),
        backgroundColor: [
          '#EF4444',  // PII - Red
          '#F59E0B',  // Misinformation - Orange
          '#A855F7',  // Bias - Purple
          '#3B82F6',  // Hallucination - Blue
          '#DC267F',  // Hate Speech - Pink
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Violation Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Violation Types',
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <Bar data={barData} options={options} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </motion.div>
    </div>
  );
};

export default ViolationChart;