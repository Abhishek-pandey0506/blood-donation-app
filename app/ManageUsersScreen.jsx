import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import Colors from '@/src/_utils/colors';

export default function ManageUsersScreen() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, blood_groups(type)')
            .order('name', { ascending: true });

        if (!error) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (userId, newRole) => {
        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            Toast.show({ type: 'error', text1: 'Update Failed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: `Role updated to ${newRole}` });
            fetchUsers();
        }
    };

    const renderUser = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>📧 {item.email}</Text>
            <Text style={styles.detail}>📞 {item.phone}</Text>
            <Text style={styles.detail}>🧬 {item.blood_groups?.type || 'Unknown'} • {item.role}</Text>

            <View style={styles.roleButtons}>
                {['donor', 'staff', 'admin'].map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.roleButton,
                            item.role === role && styles.activeRole
                        ]}
                        onPress={() => updateRole(item.id, role)}
                    >
                        <Text style={styles.roleText}>{role.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Manage Users</Text>
            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" /></View>
            ) : users.length === 0 ? (
                <Text style={styles.noData}>No users found.</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
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
    noData: { textAlign: 'center', marginTop: 40, color: '#999' },
    card: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    detail: { fontSize: 14, color: '#555' },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    roleButton: {
        padding: 8,
        backgroundColor: '#ddd',
        borderRadius: 6,
        flex: 1,
        marginHorizontal: 3,
    },
    activeRole: {
        backgroundColor: Colors.primary,
    },
    roleText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
});
