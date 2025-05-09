import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import Toast from 'react-native-toast-message';

export default function DonationHistoryScreen() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('donations')
                .select(`
          id, amount_ml, donated_at,
          donation_centers (name)
        `)
                .eq('user_id', user.id)
                .order('donated_at', { ascending: false });

            if (error) throw error;
            setDonations(data);
        } catch (error) {
            console.error('Error fetching donations:', error);
            Toast.show({ type: 'error', text1: 'Failed to load donation history' });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDonations();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.title}>Donation History</Text>

            {donations.length === 0 ? (
                <Text style={styles.noData}>You have no donation records yet.</Text>
            ) : (
                <View style={styles.historyBox}>
                    {donations.map((donation) => (
                        <View key={donation.id} style={styles.item}>
                            <Text style={styles.amount}>🩸 {donation.amount_ml} ml</Text>
                            <Text style={styles.center}>
                                📍 {donation.donation_centers?.name || 'Unknown Center'}
                            </Text>
                            <Text style={styles.date}>
                                📅 {new Date(donation.donated_at).toLocaleDateString()}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 20,
    },
    noData: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#888',
    },
    historyBox: {
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        padding: 16,
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    amount: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    center: {
        fontSize: 14,
        color: Colors.mediumDark,
        marginTop: 4,
    },
    date: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
});
