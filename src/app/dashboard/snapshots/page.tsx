// app/dashboard/snapshots/page.tsx

'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Plus, Pencil, Trash2, Calendar, TrendingDown, TrendingUp} from 'lucide-react';
import {useCalculatedRecordsAndDebts} from '@/hooks/useDebtTracker';
import {formatCurrency, formatMonth} from '@/lib/utils';
import {AddSnapshotDialog} from '@/components/AddSnapshotDialog';


export default function MonthlySnapshotsPage() {
  const {
    calculatedRecords,
    calculatedDebts,
    deleteRecord,
    loading,
    refetch
  } = useCalculatedRecordsAndDebts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);


  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this snapshot?')) {
      await deleteRecord(id);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading snapshots...</p>
      </div>
    );
  }

  if (calculatedDebts.length === 0) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Monthly Snapshots</h1>
            <p className="text-muted-foreground mt-1">Track your debt reduction over time</p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardContent className="py-16 text-center">
            <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Debt Sources Yet</h3>
            <p className="text-muted-foreground mb-6">
              You need to add debt sources before creating monthly snapshots
            </p>
            <Button asChild size="lg">
              <a href="/dashboard/debt-sources">Go to Debt Sources</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Snapshots</h1>
          <p className="text-muted-foreground mt-1">Track your debt reduction over time</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="w-4 h-4"/>
          Add Snapshot
        </Button>
      </div>

      {/* Snapshots List */}
      {calculatedRecords.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Snapshots Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first monthly snapshot to start tracking your progress
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-4 h-4"/>
              Add First Snapshot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="md:grid md:grid-cols-2 md:gap-4">
          {calculatedRecords.map((record, index) => {

            return (
              <Card key={record._id}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{formatMonth(record.month)}</CardTitle>
                        {index === 0 && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Latest
                          </Badge>
                        )}
                        {record.totalPayment > 0 && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            <TrendingDown className="w-3 h-3 mr-1"/>
                            -{formatCurrency(record.totalPayment)}
                          </Badge>
                        )}
                        {record.totalPayment < 0 && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            <TrendingUp className="w-3 h-3 mr-1"/>
                            +{formatCurrency(Math.abs(record.totalPayment))}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingRecord(record._id!);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4"/>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record._id!)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive"/>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Debt</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(record.totalDebt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Assets</p>
                      <p className="text-lg font-semibold text-chart-2">
                        {formatCurrency(record.assets)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
                      <p
                        className={`text-lg font-semibold ${record.netWorth >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(record.netWorth)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
                      <p className="text-lg font-semibold text-chart-4">
                        {formatCurrency(record.totalPayment)}
                      </p>
                    </div>
                  </div>

                  {/* Individual Debts */}
                  <div className="space-y-2">
                    {record.debts.map((debt) => {
                      const source = calculatedDebts.find(ds => ds._id === debt.debtSourceId);
                      if (!source) return null;

                      return (
                        <div key={debt.debtSourceId} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{source.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {debt.payment ? `Payment: ${formatCurrency(debt.payment)}` : 'No payment recorded'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                {formatCurrency(debt.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddSnapshotDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingRecord(null);
            refetch()
          }
        }}
        editingId={editingRecord}
      />
    </div>
  );
}