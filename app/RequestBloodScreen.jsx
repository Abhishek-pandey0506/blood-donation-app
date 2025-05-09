import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

export default function RequestBloodScreen() {
    const [bloodGroups, setBloodGroups] = useState([]);
    const [form, setForm] = useState({
        blood_group_id: '',
        quantity_ml: '',
        urgency: 'medium',
        location: '',
        notes: '',
    });

    useEffect(() => {
        supabase.from('blood_groups').select('*').then(({ data }) => {
            setBloodGroups(data || []);
        });
    }, []);

    const handleSubmit = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('blood_requests').insert([
            {
                ...form,
                quantity_ml: parseInt(form.quantity_ml),
                requested_by: user.id,
                status: 'pending',
            }
        ]);

        if (error) {
            Toast.show({ type: 'error', text1: 'Failed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: 'Request submitted' });
            setForm({ blood_group_id: '', quantity_ml: '', urgency: 'medium', location: '', notes: '' });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Request Blood</Text>

            <Text style={styles.label}>Blood Type</Text>
            {bloodGroups.map((group) => (
                <TouchableOpacity
                    key={group.id}
                    style={[
                        styles.option,
                        form.blood_group_id === group.id && styles.optionSelected,
                    ]}
                    onPress={() => setForm({ ...form, blood_group_id: group.id })}
                >
                    <Text>{group.type}</Text>
                </TouchableOpacity>
            ))}

            <Text style={styles.label}>Quantity (ml)</Text>
            <TextInput
                style={styles.input}
                value={form.quantity_ml}
                keyboardType="numeric"
                onChangeText={(v) => setForm({ ...form, quantity_ml: v })}
            />

            <Text style={styles.label}>Urgency</Text>
            {['low', 'medium', 'high'].map((level) => (
                <TouchableOpacity
                    key={level}
                    style={[
                        styles.option,
                        form.urgency === level && styles.optionSelected,
                    ]}
                    onPress={() => setForm({ ...form, urgency: level })}
                >
                    <Text>{level}</Text>
                </TouchableOpacity>
            ))}

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                value={form.location}
                onChangeText={(v) => setForm({ ...form, location: v })}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={styles.input}
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Request</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
    label: { marginTop: 10, fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginTop: 5 },
    option: { padding: 10, marginTop: 5, borderWidth: 1, borderRadius: 6, borderColor: '#ddd' },
    optionSelected: { backgroundColor: '#e0e0e0' },
    button: { marginTop: 20, backgroundColor: '#E53935', padding: 15, borderRadius: 6 },
    buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
});
