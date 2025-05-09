import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import Colors from '@/src/_utils/colors';

export default function ManageCentersScreen() {
    const [centers, setCenters] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});

    const fetchCenters = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('donation_centers')
            .select(`
        *,
        center_blood_stock (
          units_available,
          blood_groups (type)
        )
      `)
            .order('created_at', { ascending: false });

        if (!error) {
            setCenters(data);
            setFiltered(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    useEffect(() => {
        const filteredList = centers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiltered(filteredList);
    }, [searchTerm, centers]);

    const handleDelete = async (id) => {
        Alert.alert('Delete Center', 'Are you sure?', [
            { text: 'Cancel' },
            {
                text: 'Delete',
                onPress: async () => {
                    const { error } = await supabase.from('donation_centers').delete().eq('id', id);
                    if (!error) {
                        Toast.show({ type: 'success', text1: 'Center deleted' });
                        fetchCenters();
                    }
                },
            },
        ]);
    };

    const handleSaveEdit = async () => {
        const { error } = await supabase
            .from('donation_centers')
            .update(editingData)
            .eq('id', editingId);

        if (!error) {
            Toast.show({ type: 'success', text1: 'Center updated' });
            setEditingId(null);
            setEditingData({});
            fetchCenters();
        }
    };

    const renderCenter = ({ item }) => {
        const isEditing = editingId === item.id;

        return (
            <View style={styles.card}>
                {isEditing ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={editingData.name}
                            onChangeText={(v) => setEditingData({ ...editingData, name: v })}
                            placeholder="Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={editingData.address}
                            onChangeText={(v) => setEditingData({ ...editingData, address: v })}
                            placeholder="Address"
                        />
                        <TextInput
                            style={styles.input}
                            value={editingData.contact_phone}
                            onChangeText={(v) => setEditingData({ ...editingData, contact_phone: v })}
                            placeholder="Phone"
                        />
                        <TextInput
                            style={styles.input}
                            value={editingData.email}
                            onChangeText={(v) => setEditingData({ ...editingData, email: v })}
                            placeholder="Email"
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.centerName}>{item.name}</Text>
                        <Text style={styles.centerDetail}>📍 {item.address}</Text>
                        {item.contact_phone && <Text style={styles.centerDetail}>📞 {item.contact_phone}</Text>}
                        {item.email && <Text style={styles.centerDetail}>✉️ {item.email}</Text>}
                        {item.center_blood_stock?.length > 0 && (
                            <View style={styles.stockWrap}>
                                {item.center_blood_stock.map((s, i) => (
                                    <Text key={i} style={styles.stockText}>
                                        🩸 {s.blood_groups?.type}: {s.units_available} ml
                                    </Text>
                                ))}
                            </View>
                        )}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => {
                                    setEditingId(item.id);
                                    setEditingData({
                                        name: item.name,
                                        address: item.address,
                                        contact_phone: item.contact_phone,
                                        email: item.email,
                                    });
                                }}
                            >
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(item.id)}
                            >
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Manage Centers</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name or address"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCenter}
                    contentContainerStyle={{ paddingBottom: 60 }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
    searchInput: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10,
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    centerName: { fontSize: 16, fontWeight: '700' },
    centerDetail: { color: '#555', fontSize: 14, marginTop: 4 },
    stockWrap: { marginTop: 8 },
    stockText: { fontSize: 13, color: '#666' },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
        padding: 10, marginTop: 8,
    },
    actionRow: { flexDirection: 'row', marginTop: 10 },
    editBtn: {
        flex: 1, backgroundColor: Colors.primary, padding: 10, marginRight: 5, borderRadius: 6,
    },
    deleteBtn: {
        flex: 1, backgroundColor: '#e53935', padding: 10, marginLeft: 5, borderRadius: 6,
    },
    saveBtn: {
        marginTop: 10,
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 6,
    },
    saveText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
    editText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
    deleteText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
});
