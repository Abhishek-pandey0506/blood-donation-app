import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker'; // if using Expo, use @react-native-community/datetimepicker

export default function BookAppointmentScreen() {
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            const { data, error } = await supabase.from('donation_centers').select('*');
            if (!error) setCenters(data);
            setLoading(false);
        };
        fetchCenters();
    }, []);

    const handleBook = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from('donation_appointments').insert([
            {
                donor_id: user.id,
                center_id: selectedCenter,
                scheduled_date: date.toISOString(),
                status: 'scheduled',
            }
        ]);

        if (error) {
            Toast.show({ type: 'error', text1: 'Failed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: 'Appointment Booked' });
            setSelectedCenter(null);
            setDate(new Date());
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Book a Donation Appointment</Text>

            <Text style={styles.label}>Select Donation Center</Text>
            {centers.map((center) => (
                <TouchableOpacity
                    key={center.id}
                    style={[
                        styles.centerOption,
                        selectedCenter === center.id && styles.centerSelected
                    ]}
                    onPress={() => setSelectedCenter(center.id)}
                >
                    <Text style={styles.centerName}>{center.name}</Text>
                    <Text style={styles.centerDetail}>{center.address}</Text>
                </TouchableOpacity>
            ))}

            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateInput}>
                <Text>{date.toDateString()}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    mode="date"
                    value={date}
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={handleBook}
                disabled={!selectedCenter}
            >
                <Text style={styles.buttonText}>Confirm Booking</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
    label: { marginVertical: 10, fontWeight: '600' },
    centerOption: {
        backgroundColor: '#F4F4F4',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    centerSelected: {
        borderColor: '#E53935',
        backgroundColor: '#FDE2E4',
    },
    centerName: {
        fontWeight: '600',
    },
    centerDetail: {
        fontSize: 13,
        color: '#666',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#E53935',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
