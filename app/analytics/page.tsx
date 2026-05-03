'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MapPin, Fuel, DollarSign } from 'lucide-react';

interface MonthlyData { label: string; cost: number; distance: number; count: number }
interface ThisMonth {
  total_cost: number; total_distance: number; trip_count: number;
  avg_cost_per_km: number;
  most_expensive: Array<{ origin: string; destination: string; fuel_cost_pkr: number }>;
}
interface AnalyticsData { monthly: MonthlyData[]; thisMonth: ThisMonth }

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8">
          <h1 className="text-4xl font-bold mb-8">Analytics<span className="text-accent">.</span></h1>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </AppLayout>
    );
  }

  const hasData = data && data.monthly.length > 0;

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Analytics<span className="text-accent">.</span>
        </h1>

        {/* This Month KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Trips This Month', value: data?.thisMonth.trip_count ?? 0, icon: MapPin, suffix: '' },
            { label: 'Total Spent', value: data?.thisMonth.total_cost.toFixed(0) ?? '0', icon: DollarSign, suffix: ' ₨' },
            { label: 'Distance Driven', value: data?.thisMonth.total_distance.toFixed(0) ?? '0', icon: TrendingUp, suffix: ' km' },
            { label: 'Avg Cost/km', value: data?.thisMonth.avg_cost_per_km.toFixed(2) ?? '0', icon: Fuel, suffix: ' ₨' },
          ].map(({ label, value, icon: Icon, suffix }) => (
            <Card key={label} className="p-5 gradient-card glow-accent">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-accent" />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-2xl font-bold">{value}{suffix}</p>
            </Card>
          ))}
        </div>

        {/* Monthly Spending Chart */}
        <Card className="p-6 gradient-card mb-6">
          <h2 className="text-xl font-bold mb-6">Monthly Fuel Spend <span className="text-accent">(₨)</span></h2>
          {!hasData ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">No trip data yet. Start calculating trips to see spending trends.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(val: number) => [`₨ ${val.toLocaleString()}`, 'Fuel Cost']}
                />
                <Bar dataKey="cost" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Monthly Distance Chart */}
        {hasData && (
          <Card className="p-6 gradient-card mb-6">
            <h2 className="text-xl font-bold mb-6">Monthly Distance <span className="text-accent">(km)</span></h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(val: number) => [`${val} km`, 'Distance']}
                />
                <Bar dataKey="distance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Most Expensive Trips */}
        {data?.thisMonth.most_expensive && data.thisMonth.most_expensive.length > 0 && (
          <Card className="p-6 gradient-card">
            <h2 className="text-xl font-bold mb-4">Most Expensive Trips <span className="text-accent">this month</span></h2>
            <div className="space-y-3">
              {data.thisMonth.most_expensive.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <p className="font-medium">{t.origin} → {t.destination}</p>
                  <p className="text-accent font-bold">₨ {t.fuel_cost_pkr.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
