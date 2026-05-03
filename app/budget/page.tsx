'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context';
import { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function BudgetPage() {
  const { dbUser, trips, updateBudget, isLoading } = useApp();
  const [budgetInput, setBudgetInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const budget = dbUser?.monthly_budget ?? null;

  // Current month spending
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthTrips = trips.filter(t => new Date(t.created_at) >= monthStart);
  const spent = currentMonthTrips.reduce((s, t) => s + t.fuel_cost_pkr, 0);

  // Projection: days elapsed / days in month * spent = projected full month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const projected = daysPassed > 0 ? (spent / daysPassed) * daysInMonth : 0;

  const pct = budget ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = budget !== null && spent > budget;
  const isNearBudget = budget !== null && pct >= 80 && !isOverBudget;

  const handleSave = async () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) return;
    setIsSaving(true);
    await updateBudget(val);
    setBudgetInput('');
    setIsSaving(false);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <Target className="w-8 h-8 text-accent" />
          <h1 className="text-4xl font-bold text-foreground">
            Budget <span className="gradient-primary bg-clip-text text-transparent">Planner</span>
          </h1>
        </div>

        {/* Set Budget */}
        <Card className="p-6 gradient-card glow-accent mb-6">
          <h2 className="text-xl font-bold mb-4">Monthly Budget <span className="text-accent">(₨)</span></h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                {budget ? `Current: ₨ ${budget.toLocaleString()}` : 'No budget set yet'}
              </label>
              <Input
                type="number"
                placeholder="e.g., 15000"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                min="1"
              />
            </div>
            <Button onClick={handleSave} className="btn-gradient" disabled={isSaving}>
              {isSaving ? 'Saving...' : budget ? 'Update' : 'Set Budget'}
            </Button>
          </div>
        </Card>

        {budget && (
          <>
            {/* Alert */}
            {isOverBudget && (
              <Card className="p-4 mb-6 border-destructive/50 bg-destructive/10">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <p className="text-destructive font-semibold">
                    Budget exceeded! You&apos;ve spent ₨ {(spent - budget).toFixed(0)} over your limit.
                  </p>
                </div>
              </Card>
            )}
            {isNearBudget && (
              <Card className="p-4 mb-6 border-amber-500/50 bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <p className="text-amber-600 font-semibold">
                    Approaching limit — {(100 - pct).toFixed(0)}% remaining (₨ {(budget - spent).toFixed(0)})
                  </p>
                </div>
              </Card>
            )}
            {!isOverBudget && !isNearBudget && spent > 0 && (
              <Card className="p-4 mb-6 border-green-500/50 bg-green-500/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-600 font-semibold">On track — ₨ {(budget - spent).toFixed(0)} remaining</p>
                </div>
              </Card>
            )}

            {/* Progress */}
            <Card className="p-6 gradient-card mb-6">
              <div className="flex justify-between mb-3">
                <span className="font-semibold">Spent this month</span>
                <span className="font-bold text-accent">₨ {spent.toFixed(0)} / ₨ {budget.toLocaleString()}</span>
              </div>
              <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-destructive' : isNearBudget ? 'bg-amber-500' : 'bg-accent'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{pct.toFixed(1)}% of budget used</p>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 gradient-card glow-accent">
                <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-accent" /><p className="text-xs text-muted-foreground">Remaining Budget</p></div>
                <p className="text-2xl font-bold">₨ {Math.max(budget - spent, 0).toFixed(0)}</p>
              </Card>
              <Card className="p-5 gradient-card glow-accent">
                <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-accent" /><p className="text-xs text-muted-foreground">Projected Month-End</p></div>
                <p className={`text-2xl font-bold ${projected > budget ? 'text-destructive' : 'text-foreground'}`}>
                  ₨ {projected.toFixed(0)}
                </p>
              </Card>
              <Card className="p-5 gradient-card glow-accent">
                <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-accent" /><p className="text-xs text-muted-foreground">Trips This Month</p></div>
                <p className="text-2xl font-bold">{currentMonthTrips.length}</p>
              </Card>
            </div>
          </>
        )}

        {!budget && !isLoading && (
          <Card className="p-12 text-center gradient-card">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Set a monthly fuel budget to start tracking your spending</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

