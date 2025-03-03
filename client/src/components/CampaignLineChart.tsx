import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ZoomPlugin,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, zoomPlugin);

interface CampaignLineChartProps {
  dailyClicks: Record<string, Record<string, number>>;
  campaigns: string[];
}

const CampaignLineChart: React.FC<CampaignLineChartProps> = ({ dailyClicks, campaigns }) => {
  const dates = Object.keys(dailyClicks).sort();
  const colors = [
    'rgba(99, 102, 241, 0.8)', // Indigo
    'rgba(236, 72, 153, 0.8)', // Pink
    'rgba(34, 211, 238, 0.8)', // Cyan
    'rgba(245, 158, 11, 0.8)', // Amber
    'rgba(16, 185, 129, 0.8)', // Emerald
    'rgba(139, 92, 246, 0.8)'  // Purple
  ];

  const data = {
    labels: dates,
    datasets: campaigns.map((campaign, index) => ({
      label: campaign,
      data: dates.map(date => dailyClicks[date][campaign] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('0.8', '0.1'),
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      fill: true,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Campaign Performance Over Time',
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: '600',
        },
        padding: {
          top: 20,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: '600',
        },
        displayColors: true,
        usePointStyle: true,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
        limits: {
          y: {min: 'original', max: 'original'},
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default CampaignLineChart;