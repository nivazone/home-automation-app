"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type SystemInfo = {
  platform: string;
  cpuTemp: number | null;
  cpuUsage: string[];
  memoryUsage: {
    total: number;
    used: number;
    free: number;
  };
};

export default function StatsPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemInfo() {
      try {
        const response = await fetch("/api/system");
        const data = await response.json();
        setSystemInfo(data);
      } catch (error) {
        console.error("Failed to fetch system info:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSystemInfo();
  }, []);

  if (loading) {
    return <div>Loading system information...</div>;
  }

  if (!systemInfo) {
    return <div>Failed to load system information.</div>;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Raspberry Pi</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[
              ["Platform", systemInfo.platform],
              [
                "CPU Temperature",
                `${systemInfo.cpuTemp?.toFixed(1) ?? "N/A"}°C`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}:</span>
                <span className="text-foreground font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">CPU Usage</h3>
            {systemInfo.cpuUsage.map((usage: string, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Core {index + 1}</span>
                  <span>{usage}%</span>
                </div>
                <Progress value={parseFloat(usage)} className="h-2" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Memory Usage
            </h3>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Used</span>
              <span>
                {systemInfo.memoryUsage.used.toFixed(2)} /{" "}
                {systemInfo.memoryUsage.total.toFixed(2)} GB
              </span>
            </div>
            <Progress
              value={
                (systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) *
                100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
