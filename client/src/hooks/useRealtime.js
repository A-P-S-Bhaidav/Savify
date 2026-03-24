import { useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';

export function useRealtime(userId, onExpenseChange, onProfileChange) {
    const channelRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        const channel = supabase.channel(`public:dashboard_updates:${userId}`);

        channel
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` },
                (payload) => {
                    console.log('💸 Expense detected! Refreshing...');
                    if (onExpenseChange) onExpenseChange(payload);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'user_applications', filter: `user_id=eq.${userId}` },
                (payload) => {
                    console.log('👤 Profile updated! Refreshing...');
                    if (onProfileChange) onProfileChange(payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime Connected');
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [userId, onExpenseChange, onProfileChange]);
}
