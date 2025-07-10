
"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
  { name: "Mon", total: Math.floor(Math.random() * 60) + 30 },
  { name: "Tue", total: Math.floor(Math.random() * 60) + 30 },
  { name: "Wed", total: Math.floor(Math.random() * 60) + 30 },
  { name: "Thu", total: Math.floor(Math.random() * 60) + 30 },
  { name: "Fri", total: Math.floor(Math.random() * 60) + 30 },
  { name: "Sat", total: Math.floor(Math.random() * 60) + 30 },
  { name: "Sun", total: Math.floor(Math.random() * 60) + 30 },
]

export function WeeklyActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <Tooltip />
        <Legend />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}m`}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
