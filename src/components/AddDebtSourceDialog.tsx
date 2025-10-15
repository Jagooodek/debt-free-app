// components/AddDebtSourceDialog.tsx

'use client';

import {useState, useEffect} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useDebtSources} from '@/hooks/useDebtTracker';
import {DebtType} from '@/lib/types';

interface AddDebtSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string | null;
}

export function AddDebtSourceDialog({open, onOpenChange, editingId}: AddDebtSourceDialogProps) {
  const {debtSources, createDebtSource, updateDebtSource} = useDebtSources();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: DebtType.CREDIT_CARD,
    initialAmount: '',
    interestRate: '',
    minMonthlyPayment: '',
    canOverpay: true,
    accountLimit: '',
    color: 'chart-1',
    notes: ''
  });

  useEffect(() => {
    if (editingId && open) {
      const source = debtSources.find(ds => ds._id === editingId);
      if (source) {
        // For ACCOUNT_LIMIT: initialAmount is the debt, so balance = limit - debt
        const isAccountLimit = source.type === DebtType.ACCOUNT_LIMIT;
        const balance = isAccountLimit && source.accountLimit
          ? source.accountLimit - source.initialAmount
          : source.initialAmount;

        setFormData({
          name: source.name,
          type: source.type,
          initialAmount: balance.toString(),
          interestRate: source.interestRate?.toString() || '',
          minMonthlyPayment: source.minMonthlyPayment.toString(),
          canOverpay: source.canOverpay,
          accountLimit: source.accountLimit?.toString() || '',
          color: source.color || 'chart-1',
          notes: source.notes || ''
        });
      }
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        type: DebtType.CREDIT_CARD,
        initialAmount: '',
        interestRate: '',
        minMonthlyPayment: '',
        canOverpay: true,
        accountLimit: '',
        color: 'chart-1',
        notes: ''
      });
    }
  }, [editingId, open, debtSources]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isAccountLimit = formData.type === DebtType.ACCOUNT_LIMIT;
      const accountLimit = formData.accountLimit ? parseFloat(formData.accountLimit) : undefined;
      const balance = parseFloat(formData.initialAmount);

      // For ACCOUNT_LIMIT type: initialAmount = limit - balance (the actual debt)
      const initialAmount = isAccountLimit && accountLimit
        ? accountLimit - balance
        : balance;

      const data = {
        name: formData.name,
        type: formData.type,
        initialAmount,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        minMonthlyPayment: parseFloat(formData.minMonthlyPayment),
        canOverpay: formData.canOverpay,
        accountLimit,
        color: formData.color,
        notes: formData.notes || undefined
      };

      if (editingId) {
        await updateDebtSource(editingId, data);
      } else {
        await createDebtSource(data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving debt source:', error);
      alert('Failed to save debt source. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAccountLimit = formData.type === DebtType.ACCOUNT_LIMIT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className=" bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Edit Debt Source' : 'Add New Debt Source'}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? 'Update the details of your debt source'
              : 'Add a new debt or liability to track'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., mBank Credit Card"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({...formData, type: value as DebtType})}
            >
              <SelectTrigger>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DebtType.CREDIT_CARD}>Credit Card</SelectItem>
                <SelectItem value={DebtType.CREDIT}>Credit/Loan</SelectItem>
                <SelectItem value={DebtType.LEASING}>Leasing</SelectItem>
                <SelectItem value={DebtType.ACCOUNT_LIMIT}>Account Limit</SelectItem>
                <SelectItem value={DebtType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Initial Amount */}
          <div className="space-y-2">
            <Label htmlFor="initialAmount">
              {isAccountLimit ? 'Current Balance *' : 'Initial Amount *'}
            </Label>
            <Input
              id="initialAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.initialAmount}
              onChange={(e) => setFormData({...formData, initialAmount: e.target.value})}
              required
            />
            {isAccountLimit && (
              <p className="text-xs text-muted-foreground">
                Enter your current account balance (not the debt)
              </p>
            )}
          </div>

          {/* Account Limit (only for ACCOUNT_LIMIT type) */}
          {isAccountLimit && (
            <div className="space-y-2">
              <Label htmlFor="accountLimit">Account Limit *</Label>
              <Input
                id="accountLimit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.accountLimit}
                onChange={(e) => setFormData({...formData, accountLimit: e.target.value})}
                required={isAccountLimit}
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount you can use (debt = limit - balance)
              </p>
            </div>
          )}

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (APR %)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              placeholder="e.g., 19.9"
              value={formData.interestRate}
              onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if unknown or no interest
            </p>
          </div>

          {/* Min Monthly Payment */}
          <div className="space-y-2">
            <Label htmlFor="minMonthlyPayment">Minimum Monthly Payment *</Label>
            <Input
              id="minMonthlyPayment"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.minMonthlyPayment}
              onChange={(e) => setFormData({...formData, minMonthlyPayment: e.target.value})}
              required
            />
          </div>

          {/* Can Overpay */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="canOverpay"
              checked={formData.canOverpay}
              onChange={(e) => setFormData({...formData, canOverpay: e.target.checked})}
              className="w-4 h-4 rounded border-border"
            />
            <Label htmlFor="canOverpay" className="cursor-pointer">
              Can make additional payments (overpay)
            </Label>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Chart Color</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => setFormData({...formData, color: value})}
            >
              <SelectTrigger>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart-1">Emerald (Green)</SelectItem>
                <SelectItem value="chart-2">Blue</SelectItem>
                <SelectItem value="chart-3">Purple</SelectItem>
                <SelectItem value="chart-4">Amber (Yellow)</SelectItem>
                <SelectItem value="chart-5">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add Debt Source'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}