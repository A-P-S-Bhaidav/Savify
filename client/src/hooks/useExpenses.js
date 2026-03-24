import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { APP_START_DATE } from '../utils/helpers';

export function useExpenses(userId) {
    const [expenses, setExpenses] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading] = useState(false);

    const fetchExpenses = useCallback(async () => {
        if (!userId) return [];
        const { data } = await supabase.from('expenses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        const all = data || [];
        setExpenses(all);
        return all;
    }, [userId]);

    const fetchHistory = useCallback(async () => {
        if (!userId) return;
        const { data } = await supabase.from('expenses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        setHistory(data || []);
    }, [userId]);

    const addExpense = useCallback(async (amount, category, description) => {
        if (!userId) throw new Error('No user');
        const { error } = await supabase.from('expenses').insert([{
            user_id: userId,
            amount,
            category,
            description
        }]);
        if (error) throw error;
    }, [userId]);

    const getFilteredExpenses = useCallback(() => {
        return expenses.filter(exp => new Date(exp.created_at) >= APP_START_DATE);
    }, [expenses]);

    const calculateStreak = useCallback(async () => {
        if (!userId) return 0;
        const { data } = await supabase.from('expenses')
            .select('created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (!data || data.length === 0) return 0;
        const dates = new Set(data.map(e => e.created_at.split('T')[0]));
        let streak = 0;
        let d = new Date();
        const todayStr = d.toISOString().split('T')[0];
        // If no expense today, check from yesterday
        if (!dates.has(todayStr)) {
            d.setDate(d.getDate() - 1);
            if (!dates.has(d.toISOString().split('T')[0])) return 0;
        }
        while (dates.has(d.toISOString().split('T')[0])) { streak++; d.setDate(d.getDate() - 1); }
        return streak;
    }, [userId]);

    return {
        expenses,
        history,
        loading,
        fetchExpenses,
        fetchHistory,
        addExpense,
        getFilteredExpenses,
        calculateStreak
    };
}
