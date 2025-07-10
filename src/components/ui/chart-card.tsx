import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  [key: string]: number | string;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  dataKey: string;
  gridColor?: string;
  lineColor?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  dataKey,
  gridColor = "rgba(203, 213, 224, 0.5)", 
  lineColor = "#10B981", 
}) => (
  <Card className="h-full">
    <CardHeader>
      <div>
        <CardTitle>{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="#6B7280" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ dy: 10 }}
          />
          <YAxis
            stroke="#6B7280" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            tick={{ dx: -10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            itemStyle={{
              color: "#10B981", 
              fontWeight: "bold",
            }}
            labelStyle={{
              color: "#374151", 
              fontWeight: "600",
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={lineColor}
            strokeWidth={3}
            dot={{ fill: lineColor, r: 4 }}
            activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);