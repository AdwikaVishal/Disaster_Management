import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { riskLabels } from '@/data/dummyData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface RiskGraphProps {
  riskLevels: number[];
  totalIncidents: number;
  resolvedIncidents: number;
}

const RiskGraph = ({ riskLevels, totalIncidents, resolvedIncidents }: RiskGraphProps) => {
  const lineData = {
    labels: riskLabels,
    datasets: [
      {
        label: 'Incidents by Risk Level',
        data: riskLevels,
        borderColor: 'hsl(215, 70%, 45%)',
        backgroundColor: 'hsla(215, 70%, 45%, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'hsl(215, 70%, 45%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(215, 25%, 15%)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(215, 15%, 50%)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'hsl(214, 20%, 92%)',
        },
        ticks: {
          color: 'hsl(215, 15%, 50%)',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const doughnutData = {
    labels: ['Resolved', 'Pending'],
    datasets: [
      {
        data: [resolvedIncidents, totalIncidents - resolvedIncidents],
        backgroundColor: ['hsl(152, 60%, 42%)', 'hsl(210, 15%, 93%)'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(215, 25%, 15%)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const resolutionRate = Math.round((resolvedIncidents / totalIncidents) * 100);

  return (
    <motion.div
      className="card-elevated p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Line Chart */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">Risk Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Incidents categorized by severity level</p>
          <div className="h-48">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-border" />

        {/* Doughnut Chart */}
        <div className="lg:w-48 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Resolution Rate</h3>
          <div className="relative w-32 h-32">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{resolutionRate}%</span>
              <span className="text-xs text-muted-foreground">Resolved</span>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-muted-foreground">{resolvedIncidents} Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="text-muted-foreground">{totalIncidents - resolvedIncidents} Pending</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskGraph;
