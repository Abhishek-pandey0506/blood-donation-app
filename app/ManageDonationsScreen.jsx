import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import Toast from 'react-native-toast-message';

export default function ManageDonationsScreen() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDonations = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('donations')
            .select(`
        id, donated_at, volume_ml,
        users(name, email),
        donation_centers(name),
        blood_groups(type)
      `)
            .order('donated_at', { ascending: false });

        if (!error) setDonations(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const renderDonation = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>
                🩸 {item.blood_groups?.type} – {item.volume_ml} ml
            </Text>
            <Text style={styles.meta}>
                Donated by: {item.users?.name} ({item.users?.email})
            </Text>
            <Text style={styles.meta}>
                Center: {item.donation_centers?.name}
            </Text>
            <Text style={styles.meta}>
                Date: {new Date(item.donated_at).toLocaleDateString()}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>All Donations</Text>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : donations.length === 0 ? (
                <Text style={styles.noData}>No donations found.</Text>
            ) : (
                <FlatList
                    data={donations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDonation}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1 },
    header: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    meta: { fontSize: 14, color: '#444', marginTop: 2 },
    noData: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 30 },
});
