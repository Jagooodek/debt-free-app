'use client';

import {useState, useEffect} from 'react';
import {useCalculatedRecordsAndDebts} from '@/hooks/useDebtTracker';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import {formatCurrency, getDebtTypeColor, getDebtTypeLabel} from '@/lib/utils';
import {TrendingDown, DollarSign, Target, Calendar} from 'lucide-react';

export default function StatsPage() {
  const {calculatedRecords, calculatedDebts, settings, loading, error} = useCalculatedRecordsAndDebts();
  const [selectedDebtIds, setSelectedDebtIds] = useState<Set<string>>(new Set());

  // Initialize selected debts when data loads
  useEffect(() => {
    if (!loading && calculatedDebts.length > 0 && selectedDebtIds.size === 0) {
      setSelectedDebtIds(new Set(calculatedDebts.filter(d => d.isActive).map(d => d._id!)));
    }
  }, [loading, calculatedDebts]);

  const toggleDebt = (debtId: string) => {
    setSelectedDebtIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(debtId)) {
        newSet.delete(debtId);
      } else {
        newSet.add(debtId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter records and calculate stats based on selected debts
  const selectedDebts = calculatedDebts.filter(d => selectedDebtIds.has(d._id!));

  // Prepare chart data
  const debtProgressData = calculatedRecords.map(record => {
    const dataPoint: any = {
      month: record.month,
      total: 0,
    };

    selectedDebts.forEach(debt => {
      const debtRecord = record.debts.find(d => d.debtSourceId === debt._id);
      const amount = debtRecord?.amount ?? debt.initialAmount;
      dataPoint[debt._id!] = amount;
      dataPoint.total += amount;
    });

    return dataPoint;
  }).toReversed();

  const paymentProgressData = calculatedRecords.map(record => {
    let totalPayment = 0;

    selectedDebts.forEach(debt => {
      const debtRecord = record.debts.find(d => d.debtSourceId === debt._id);
      if (debtRecord) {
        totalPayment += debtRecord.payment;
      }
    });

    return {
      month: record.month,
      payment: totalPayment,
    };
  }).toReversed();

  const netWorthData = calculatedRecords.map(record => ({
    month: record.month,
    netWorth: record.netWorth,
    assets: record.assets,
    debt: record.totalDebt,
    flatM2: record.flatM2,
  })).toReversed();

  // Calculate statistics
  const totalInitialDebt = selectedDebts.reduce((sum, d) => sum + d.initialAmount, 0);
  const totalCurrentDebt = selectedDebts.reduce((sum, d) => sum + d.currentAmount, 0);
  const totalPaid = totalInitialDebt - totalCurrentDebt;
  const progressPercentage = totalInitialDebt > 0 ? (totalPaid / totalInitialDebt) * 100 : 0;
  const totalPayments = calculatedRecords.reduce((sum, r) => {
    const recordPayment = selectedDebts.reduce((paymentSum, debt) => {
      const debtRecord = r.debts.find(d => d.debtSourceId === debt._id);
      return paymentSum + (debtRecord?.payment ?? 0);
    }, 0);
    return sum + recordPayment;
  }, 0);

  const averagePayment = calculatedRecords.length > 0 ? totalPayments / calculatedRecords.length : 0;

  // Chart configs
  const debtChartConfig: ChartConfig = {
    total: {
      label: 'Total Debt',
      color: 'hsl(var(--chart-1))',
    },
    ...Object.fromEntries(
      selectedDebts.map((debt, index) => [
        debt._id!,
        {
          label: debt.name,
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        },
      ])
    ),
  };

  const paymentChartConfig: ChartConfig = {
    payment: {
      label: 'Monthly Payment',
      color: 'hsl(var(--chart-2))',
    },
  };

  const netWorthChartConfig: ChartConfig = {
    netWorth: {
      label: 'Net Worth',
      color: 'hsl(var(--chart-3))',
    },
    assets: {
      label: 'Assets',
      color: 'hsl(var(--chart-4))',
    },
    debt: {
      label: 'Total Debt',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-1">Visualize your debt repayment progress</p>
        </div>
      </div>

      {/* Debt Selection */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl mb-6">
        <CardHeader>
          <CardTitle>Select Debts to Include</CardTitle>
          <CardDescription>Choose which debt sources to include in the statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculatedDebts.map(debt => (
              <div key={debt._id} className="flex items-start space-x-3">
                <Checkbox
                  id={`debt-${debt._id}`}
                  checked={selectedDebtIds.has(debt._id!)}
                  onCheckedChange={() => toggleDebt(debt._id!)}
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor={`debt-${debt._id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {debt.name}
                  </Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getDebtTypeColor(debt.type)}>
                      {getDebtTypeLabel(debt.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(debt.currentAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {calculatedRecords.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardContent className="py-16 text-center">
            <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Snapshots Yet</h3>
            <p className="text-muted-foreground mb-6">
              You need to add monthly snapshots to view statistics
            </p>
          </CardContent>
        </Card>
      ) : selectedDebtIds.size === 0 ? (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardContent className="py-16 text-center">
            <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
            <p className="text-muted-foreground text-lg">
              Please select at least one debt source to view statistics
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">
                {progressPercentage.toFixed(1)}% of initial debt
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Debt</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentDebt)}</div>
              <p className="text-xs text-muted-foreground">
                {(100 - progressPercentage).toFixed(1)}% remaining
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averagePayment)}</div>
              <p className="text-xs text-muted-foreground">
                Per month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Months Tracked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatedRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                Snapshots recorded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Debt Progress Chart */}
        <Card
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl mb-6">
          <CardHeader>
            <CardTitle>Debt Progress Over Time</CardTitle>
            <CardDescription>Track how your debt has decreased over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <ChartContainer config={debtChartConfig} className="max-h-96 mx-auto">
                <AreaChart data={debtProgressData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${(value / 1000).toFixed(2)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent/>}/>
                  {selectedDebts.map((debt, index) => (
                    <Area
                      key={debt._id}
                      type="monotone"
                      dataKey={debt._id!}
                      stackId="1"
                      stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Progress Chart */}
        <Card
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl mb-6">
          <CardHeader>
            <CardTitle>Monthly Payments</CardTitle>
            <CardDescription>Your monthly payment amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={paymentChartConfig} className="max-h-96 mx-auto">
              <BarChart data={paymentProgressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${(value / 1000).toFixed(2)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent/>}/>
                <Bar
                  dataKey="payment"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Net Worth Chart */}
        {calculatedRecords.length > 0 && (
          <Card
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl mb-6">
            <CardHeader>
              <CardTitle>Net Worth Progression</CardTitle>
              <CardDescription>Your assets, debt, and net worth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={netWorthChartConfig} className="max-h-96 mx-auto">
                <LineChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${(value / 1000).toFixed(2)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent/>}/>
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="assets"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Flat m² Chart */}
        {settings && calculatedRecords.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
            <CardHeader>
              <CardTitle>Net Worth in Square Meters</CardTitle>
              <CardDescription>
                Your net worth converted to apartment size (at {formatCurrency(settings.flatPricePerM2)}/m²)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  flatM2: {
                    label: 'Square Meters',
                    color: 'hsl(var(--chart-5))',
                  },
                }}
                className="max-h-96 mx-auto"
              >
                <AreaChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value.toFixed(2)}m²`}
                  />
                  <ChartTooltip content={<ChartTooltipContent/>}/>
                  <Area
                    type="monotone"
                    dataKey="flatM2"
                    stroke="hsl(var(--chart-5))"
                    fill="hsl(var(--chart-5))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
            )}
          </>
        )}
        </div>
      );
      }
