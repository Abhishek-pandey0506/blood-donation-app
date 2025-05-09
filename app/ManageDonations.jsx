import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
export default function ManageDonationsScreen() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDonations = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('donations')
            .select(`
                id, donated_at, volume_ml, status,
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

    // Function to mark donation as completed
    const markDonationCompleted = async (id) => {
        const { error } = await supabase
            .from('donations')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) {
            Toast.show({ type: 'error', text1: 'Failed to mark as completed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: 'Donation marked as completed' });
            fetchDonations();
        }
    };

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

            {/* Show Mark Completed button if status is not completed */}
            {item.status !== 'completed' && (
                <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={() => markDonationCompleted(item.id)}
                >
                    <Text style={styles.btnText}>Mark Completed</Text>
                </TouchableOpacity>
            )}

            <Text style={[styles.status, item.status === 'completed' && styles.completed]}>
                Status: {item.status.toUpperCase()}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TopHeader isBack={true} title={'Donations'} subtitle={'All Donations'} />
      <View style={{ padding: 20, }}>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', flex: 1 },
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
    status: {
        marginTop: 8,
        fontWeight: '600',
        color: '#555',
    },
    completed: {
        color: 'green', // Color for completed donations
    },
    noData: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 30 },

    // Button Styling
    completeBtn: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 6,
        marginTop: 10,
    },
    btnText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
});
