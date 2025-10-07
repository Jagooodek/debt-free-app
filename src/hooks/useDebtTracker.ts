// hooks/useDebtTracker.ts

'use client';

import { useState, useEffect } from 'react';
import { ISettings, IDebtSource, IRecord } from '@/lib/types';

export function useSettings() {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: Partial<ISettings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const updated = await response.json();
      setSettings(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, updateSettings, refetch: fetchSettings };
}

export function useDebtSources() {
  const [debtSources, setDebtSources] = useState<IDebtSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebtSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debt-sources');
      if (!response.ok) throw new Error('Failed to fetch debt sources');
      const data = await response.json();
      setDebtSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createDebtSource = async (data: Omit<IDebtSource, '_id' | 'userId' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/debt-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create debt source');
      const created = await response.json();
      setDebtSources(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateDebtSource = async (id: string, data: Partial<IDebtSource>) => {
    try {
      const response = await fetch(`/api/debt-sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update debt source');
      const updated = await response.json();
      setDebtSources(prev => prev.map(ds => ds._id === id ? updated : ds));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteDebtSource = async (id: string) => {
    try {
      const response = await fetch(`/api/debt-sources/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete debt source');
      setDebtSources(prev => prev.filter(ds => ds._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchDebtSources();
  }, []);

  return {
    debtSources,
    loading,
    error,
    createDebtSource,
    updateDebtSource,
    deleteDebtSource,
    refetch: fetchDebtSources
  };
}

export function useRecords() {
  const [records, setRecords] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/records');
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: Omit<IRecord, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create record');
      }
      const created = await response.json();
      setRecords(prev => [created, ...prev].sort((a, b) => b.month.localeCompare(a.month)));
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateRecord = async (id: string, data: Partial<IRecord>) => {
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update record');
      const updated = await response.json();
      setRecords(prev => prev.map(r => r._id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete record');
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  };
}