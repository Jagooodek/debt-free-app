'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, Plus, Calendar, Wallet } from 'lucide-react';
import { useCalculatedRecordsAndDebts } from '@/hooks/useDebtTracker';
import { formatCurrency } from '@/lib/utils';
import { AddDebtSourceDialog } from '@/components/AddDebtSourceDialog';
import { AddSnapshotDialog } from '@/components/AddSnapshotDialog';

export default function DashboardPage() {
  const { calculatedRecords, calculatedDebts, settings, loading, error } = useCalculatedRecordsAndDebts();
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen container mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen container mx-auto flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasData = calculatedRecords.length > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen container flex mx-auto items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Debt-Free Tracker!</CardTitle>
            <CardDescription className="text-base">
              Start your journey to financial freedom by adding your first debt sources and monthly snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full" onClick={() => setDebtDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Debt Source
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setSnapshotDialogOpen(true)}>
              <Calendar className="w-5 h-5 mr-2" />
              Record Monthly Snapshot
            </Button>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddDebtSourceDialog
          open={debtDialogOpen}
          onOpenChange={setDebtDialogOpen}
        />
        <AddSnapshotDialog
          open={snapshotDialogOpen}
          onOpenChange={setSnapshotDialogOpen}
        />
      </div>
    );
  }

  // Now safe to access records
  const latestRecord = calculatedRecords[0];
  const previousRecord = calculatedRecords[1];

  // Calculate trends
  const debtChange = previousRecord
    ? ((latestRecord.totalDebt - previousRecord.totalDebt) / previousRecord.totalDebt) * 100
    : 0;
  const netWorthChange = previousRecord
    ? ((latestRecord.netWorth - previousRecord.netWorth) / Math.abs(previousRecord.netWorth)) * 100
    : 0;

  // Calculate total debt paid (first record vs latest)
  const startingDebt = calculatedDebts.reduce((a, b) => a + b.initialAmount, 0);
  const totalPaidOff = startingDebt - latestRecord.totalDebt;
  const percentagePaidOff = startingDebt > 0
    ? (totalPaidOff / startingDebt) * 100
    : 0;

  // Active debts only
  const activeDebts = calculatedDebts.filter(d => d.isActive);

  // Calculate average monthly payment
  const recentPayments = calculatedRecords.slice(-3).map(r => r.totalPayment);
  const avgMonthlyPayment = recentPayments.length > 0
    ? recentPayments.reduce((a, b) => a + b, 0) / recentPayments.length
    : 0;

  // Estimate debt-free date
  const monthsLeft = avgMonthlyPayment > 0 ? Math.ceil(latestRecord.totalDebt / avgMonthlyPayment) : 0;
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + monthsLeft);
  const debtFreeDateStr = debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Track your journey to financial freedom</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setDebtDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
          <Button onClick={() => setSnapshotDialogOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            New Snapshot
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader className="pb-3">
            <CardDescription>Total Debt</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(latestRecord.totalDebt)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {debtChange < 0 ? (
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {Math.abs(debtChange).toFixed(1)}% decrease
                </Badge>
              ) : debtChange > 0 ? (
                <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {debtChange.toFixed(1)}% increase
                </Badge>
              ) : (
                <Badge variant="outline">No change</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader className="pb-3">
            <CardDescription>Net Worth</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(latestRecord.netWorth)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {netWorthChange > 0 ? (
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {netWorthChange.toFixed(1)}% increase
                </Badge>
              ) : netWorthChange < 0 ? (
                <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {Math.abs(netWorthChange).toFixed(1)}% decrease
                </Badge>
              ) : (
                <Badge variant="outline">No change</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader className="pb-3">
            <CardDescription>Debt-Free Date</CardDescription>
            <CardTitle className="text-3xl text-primary">{debtFreeDateStr}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {monthsLeft} months remaining
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader className="pb-3">
            <CardDescription>Flat Equivalent</CardDescription>
            <CardTitle className="text-3xl text-chart-3">{latestRecord.flatM2.toFixed(1)} m²</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              @ {formatCurrency(settings?.flatPricePerM2 || 11229)}/m²
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Your journey to debt freedom</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              <TrendingDown className="w-3 h-3 mr-1" />
              {percentagePaidOff.toFixed(1)}% paid off
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid: {formatCurrency(totalPaidOff)}</span>
              <span className="text-muted-foreground">Remaining: {formatCurrency(latestRecord.totalDebt)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary via-emerald-400 to-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(percentagePaidOff, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Avg Monthly Payment</p>
              <p className="text-lg font-semibold">{formatCurrency(avgMonthlyPayment)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Last Payment</p>
              <p className="text-lg font-semibold">{formatCurrency(latestRecord.totalPayment)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Active Debts</p>
              <p className="text-lg font-semibold">{activeDebts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <CardTitle>Debt Breakdown</CardTitle>
            <CardDescription>Current debt by source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeDebts.map((debt, idx) => {
              const latestDebtRecord = debt.historyOfPayments[debt.historyOfPayments.length - 1];
              const debtAmount = latestDebtRecord?.amount || debt.currentAmount;
              const percentage = latestRecord.totalDebt > 0
                ? (debtAmount / latestRecord.totalDebt) * 100
                : 0;

              const colorMap: Record<string, string> = {
                'chart-1': 'from-emerald-500 to-emerald-400',
                'chart-2': 'from-blue-500 to-blue-400',
                'chart-3': 'from-purple-500 to-purple-400',
                'chart-4': 'from-amber-500 to-amber-400',
                'chart-5': 'from-red-500 to-red-400',
              };

              const gradient = colorMap[debt.color || 'chart-1'] || 'from-primary to-primary';

              return (
                <div key={debt._id} className="bg-slate-900/50 p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{debt.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {debt.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(debtAmount)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% of total</span>
                    <span>Min: {formatCurrency(debt.minMonthlyPayment)}/mo</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <CardTitle>Recent Snapshots</CardTitle>
            <CardDescription>Last 5 months</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {calculatedRecords.slice(-5).reverse().map((record) => {
              const monthDate = new Date(record.month + '-01');
              const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

              return (
                <div key={record._id} className="bg-slate-900/50 p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{monthStr}</p>
                      <p className="text-sm text-muted-foreground">
                        Payment: {formatCurrency(record.totalPayment)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(record.totalDebt)}</p>
                      <p className="text-xs text-muted-foreground">Total Debt</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Net Worth: {formatCurrency(record.netWorth)}
                    </span>
                    <span className="text-muted-foreground">
                      {record.flatM2.toFixed(1)} m²
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-2/10 border-primary/20">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your debt tracking</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setDebtDialogOpen(true)}>
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Add Debt Source</span>
            <span className="text-xs text-muted-foreground">Track a new debt</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setSnapshotDialogOpen(true)}>
            <Calendar className="w-6 h-6" />
            <span className="font-semibold">New Snapshot</span>
            <span className="text-xs text-muted-foreground">Record this month</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push('/dashboard/debt-sources')}>
            <Wallet className="w-6 h-6" />
            <span className="font-semibold">View All Debts</span>
            <span className="text-xs text-muted-foreground">Manage sources</span>
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddDebtSourceDialog
        open={debtDialogOpen}
        onOpenChange={setDebtDialogOpen}
      />
      <AddSnapshotDialog
        open={snapshotDialogOpen}
        onOpenChange={setSnapshotDialogOpen}
      />
    </div>
  );
}