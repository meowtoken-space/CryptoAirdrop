import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePoints = (walletAddress: string) => {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('total_points')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setPoints(data.total_points);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const addPoints = async (amount: number) => {
    if (!walletAddress) return;

    try {
      const { data, error } = await supabase.rpc('add_points', {
        user_wallet: walletAddress,
        points_to_add: amount,
      });

      if (error) {
        throw error;
      }

      if (data) {
        setPoints(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return { points, loading, error, addPoints, refreshPoints: fetchPoints };
};
