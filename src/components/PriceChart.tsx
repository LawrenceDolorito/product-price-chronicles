
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PricePoint } from "@/types/types";
import { format, parseISO } from "date-fns";

interface PriceChartProps {
  priceHistory: PricePoint[];
  lowestPrice: number;
  highestPrice: number;
  currency: string;
}

const formatDate = (dateStr: string) => {
  const date = parseISO(dateStr);
  return format(date, "MMM d");
};

const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory,
  lowestPrice,
  highestPrice,
  currency,
}) => {
  const data = priceHistory.map((point) => ({
    date: point.date,
    price: point.price,
    formattedDate: formatDate(point.date),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-md border border-gray-200">
          <p className="font-semibold">{formatDate(label)}</p>
          <p className="text-primary">
            Price: {currency}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            domain={[
              (dataMin: number) => Math.floor(dataMin * 0.95),
              (dataMax: number) => Math.ceil(dataMax * 1.05),
            ]}
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(value) => `${currency}${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={lowestPrice}
            stroke="#10b981"
            strokeDasharray="3 3"
            label={{
              value: `Lowest: ${currency}${lowestPrice}`,
              position: "insideBottomRight",
              fill: "#10b981",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={highestPrice}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: `Highest: ${currency}${highestPrice}`,
              position: "insideTopRight",
              fill: "#ef4444",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ stroke: "#3b82f6", fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
