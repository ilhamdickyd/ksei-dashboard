import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  data: DonutChartData[];
  className?: string;
}

// Types for CustomTooltip
type CustomTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name: string;
    value: number;
    payload: DonutChartData;
  }>;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-gray-600 font-medium">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// Types for CustomLegend
interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: DonutChartData;
  }>;
}

// legend
const CustomLegend: React.FC<CustomLegendProps> = (props) => {
  const { payload } = props;

  if (!payload) return null;

  return (
    <ul className="flex flex-wrap justify-center mt-6 gap-x-6 gap-y-3">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium">
            {entry.value}:{" "}
            <span className="font-semibold">
              {entry.payload.value.toLocaleString()}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  data,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-md ${className}`}>
      <h3 className="text-xl font-semibold mb-6 text-center text-gray-800">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={125}
            paddingAngle={3}
            dataKey="value"
            animationDuration={800}
            animationBegin={0}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={<CustomLegend />}
            layout="horizontal"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
