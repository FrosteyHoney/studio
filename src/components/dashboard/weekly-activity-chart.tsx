"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

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
      <BarChart data={data}>
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
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
