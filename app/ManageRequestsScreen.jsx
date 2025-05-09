import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import Toast from 'react-native-toast-message';

export default function ManageRequestsScreen() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blood_requests')
            .select(`
        id, quantity_ml, urgency, status, location, notes, created_at,
        users(name, email),
        blood_groups(type)
      `)
            .eq('status', statusFilter)
            .order('created_at', { ascending: false });

        if (!error) {
            setRequests(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleUpdateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('blood_requests')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            Toast.show({ type: 'error', text1: 'Update Failed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: `Marked as ${newStatus}` });
            fetchRequests();
        }
    };

    const renderRequest = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.bloodType}>🩸 {item.blood_groups?.type} • {item.quantity_ml} ml</Text>
            <Text style={styles.meta}>Urgency: {item.urgency} • Status: {item.status}</Text>
            <Text style={styles.meta}>Requested by: {item.users?.name} ({item.users?.email})</Text>
            <Text style={styles.meta}>Location: {item.location}</Text>
            {item.notes && <Text style={styles.meta}>Notes: {item.notes}</Text>}

            {statusFilter === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleUpdateStatus(item.id, 'approved')}
                    >
                        <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#F44336' }]}
                        onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                    >
                        <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
            {statusFilter === 'approved' && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#2196F3', marginTop: 8 }]}
                    onPress={() => handleUpdateStatus(item.id, 'fulfilled')}
                >
                    <Text style={styles.buttonText}>Mark Fulfilled</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Blood Requests</Text>

            <View style={styles.filters}>
                {['pending', 'approved', 'fulfilled', 'cancelled'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterButton,
                            statusFilter === status && styles.activeFilter
                        ]}
                        onPress={() => setStatusFilter(status)}
                    >
                        <Text style={styles.filterText}>{status.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {requests.length === 0 ? (
                <Text style={styles.noData}>No requests found.</Text>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRequest}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filters: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap' },
    filterButton: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        margin: 4,
    },
    activeFilter: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#F4F4F4',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
    bloodType: { fontSize: 18, fontWeight: '700', color: Colors.danger },
    meta: { fontSize: 14, marginTop: 4, color: '#444' },
    actions: { flexDirection: 'row', marginTop: 10 },
    button: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 10,
        borderRadius: 6,
    },
    buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
    noData: { textAlign: 'center', color: '#888', fontSize: 16 },
});
