// app/dashboard/debt-sources/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TrendingDown } from 'lucide-react';
import { useDebtSources } from '@/hooks/useDebtTracker';
import { formatCurrency } from '@/lib/utils';
import { DebtType } from '@/lib/types';
import { AddDebtSourceDialog } from '@/components/AddDebtSourceDialog';

export default function DebtSourcesPage() {
  const { debtSources, loading, deleteDebtSource } = useDebtSources();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<string | null>(null);

  const getDebtTypeLabel = (type: DebtType) => {
    const labels: Record<DebtType, string> = {
      [DebtType.CREDIT]: 'Credit',
      [DebtType.CREDIT_CARD]: 'Credit Card',
      [DebtType.ACCOUNT_LIMIT]: 'Account Limit',
      [DebtType.LEASING]: 'Leasing',
      [DebtType.OTHER]: 'Other'
    };
    return labels[type];
  };

  const getDebtTypeColor = (type: DebtType) => {
    const colors: Record<DebtType, string> = {
      [DebtType.CREDIT]: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      [DebtType.CREDIT_CARD]: 'bg-primary/10 text-primary border-primary/20',
      [DebtType.ACCOUNT_LIMIT]: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      [DebtType.LEASING]: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      [DebtType.OTHER]: 'bg-muted text-muted-foreground border-border'
    };
    return colors[type];
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this debt source?')) {
      await deleteDebtSource(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading debt sources...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Debt Sources</h1>
          <p className="text-muted-foreground mt-1">Manage your debts and liabilities</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Debt Source
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
        <CardHeader>
          <CardDescription>Total Initial Debt</CardDescription>
          <CardTitle className="text-3xl">
            {formatCurrency(debtSources.reduce((sum, ds) => sum + ds.initialAmount, 0))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Sources</p>
              <p className="text-2xl font-semibold text-foreground">{debtSources.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Min. Monthly Payment</p>
              <p className="text-2xl font-semibold text-chart-2">
                {formatCurrency(debtSources.reduce((sum, ds) => sum + ds.minMonthlyPayment, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">With Interest</p>
              <p className="text-2xl font-semibold text-chart-4">
                {debtSources.filter(ds => ds.interestRate).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Can Overpay</p>
              <p className="text-2xl font-semibold text-primary">
                {debtSources.filter(ds => ds.canOverpay).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Sources List */}
      {debtSources.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardContent className="py-16 text-center">
            <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Debt Sources Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your debts by adding your first debt source
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Debt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {debtSources.map((source) => (
            <Card
              key={source._id}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <CardTitle className="text-xl">{source.name}</CardTitle>
                      <Badge variant="outline" className={getDebtTypeColor(source.type)}>
                        {getDebtTypeLabel(source.type)}
                      </Badge>
                      {source.canOverpay && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Can Overpay
                        </Badge>
                      )}
                    </div>
                    {source.notes && (
                      <CardDescription className="mt-2">{source.notes}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSource(source._id!);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(source._id!)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Initial Amount</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(source.initialAmount)}
                    </p>
                  </div>
                  {source.accountLimit && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Limit</p>
                      <p className="text-lg font-semibold text-chart-4">
                        {formatCurrency(source.accountLimit)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Min. Payment</p>
                    <p className="text-lg font-semibold text-chart-2">
                      {formatCurrency(source.minMonthlyPayment)}
                    </p>
                  </div>
                  {source.interestRate ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                      <p className="text-lg font-semibold text-destructive">
                        {source.interestRate}% APR
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                      <p className="text-lg font-semibold text-muted-foreground">Unknown</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AddDebtSourceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingSource(null);
        }}
        editingId={editingSource}
      />
    </>
  );
}