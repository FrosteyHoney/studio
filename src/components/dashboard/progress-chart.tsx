
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-provider"
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

interface StatHistoryEntry {
  date: string
  weight: number
  bmi: number
  bodyFat: number
  muscleMass: number
}

export function ProgressChart() {
  const { user } = useAuth()
  const [data, setData] = useState<StatHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
        setLoading(false);
        setData([]);
        return;
    }

    const historyRef = collection(db, "users", user.uid, "statHistory")
    const q = query(historyRef, orderBy("date", "desc"), limit(5))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs
        .map((doc) => {
            const data = doc.data()
            return {
                ...data,
                date: format(new Date(data.date), "MMM d"),
            } as StatHistoryEntry
        })
        .reverse() // Reverse to show oldest first
      setData(historyData)
      setLoading(false)
    },
    (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyRef.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        setData([]); // Set data to empty array on error
        setLoading(false);
    });

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />
  }
  
  if (data.length < 2) {
    return (
        <div className="flex h-[350px] w-full flex-col items-center justify-center">
            <p className="text-muted-foreground">Not enough data to display chart.</p>
            <p className="text-sm text-muted-foreground">Check back after your next measurement!</p>
        </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Legend />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value} kg`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name="Weight (kg)" />
        <Line yAxisId="left" type="monotone" dataKey="muscleMass" stroke="hsl(var(--accent))" name="Muscle Mass (kg)" />
        <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat (%)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
