import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookAppointmentScreen() {
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
   const { data, error } = await supabase
  .from('donation_appointments')
  .select('*, donation_centers(id, name)') // Including center id and name, and donation volume
  .order('scheduled_date', { ascending: false });

    if (!error) setAppointments(data || []);
  };

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
    setLoading(false);
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: 'Please select a status.' });
      return;
    }

    const { error } = await supabase.from('donation_appointments')
      .update({ status: selectedStatus })
      .eq('id', editingAppointment.id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: error.message });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Appointment Updated',
        text2: `Your donation appointment status has been updated to ${selectedStatus}!`
      });

      // If status is completed, automatically create a donation entry
      if (selectedStatus === 'completed') {
        createDonation(editingAppointment);
      }

      setModalVisible(false);
      setEditingAppointment(null);
      fetchAppointments();
    }
  };

  const createDonation = async (appointment) => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log(appointment, user)
    const donationData = {
      appointment_id: appointment.id,
      donor_id: appointment.donor_id, // From logged-in user
      center_id: appointment.donation_centers.id, // Center from the appointment
      blood_group_id: appointment.blood_group_id, // Blood group from the user
      volume_ml: appointment.donation_volume_ml, // Volume from the appointment
      donated_at: new Date().toISOString() // Set the donation date to the current time
    };

    const { error } = await supabase
      .from('donations')
      .insert([donationData]);

    if (error) {
      Toast.show({ type: 'error', text1: 'Donation Creation Failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Donation Created', text2: 'Your donation has been recorded successfully.' });
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setSelectedStatus(appointment.status);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.appointmentTitle}>
        {item.donation_centers?.name || 'Unknown Center'}
      </Text>
      <Text style={styles.appointmentDate}>
        {new Date(item.scheduled_date).toDateString()}
      </Text>
      {item.notes ? <Text style={styles.appointmentNotes}>{item.notes}</Text> : null}
      {item.donation_details ? <Text style={styles.appointmentNotes}>Donation Details: {item.donation_details}</Text> : null}
      <Text style={styles.appointmentNotes}>Status: {item.status}</Text>

      {/* Hide the "Edit Status" button for Completed and Cancelled appointments */}
      {item.status !== 'completed' && item.status !== 'cancelled' && (
        <TouchableOpacity onPress={() => handleEditAppointment(item)} style={styles.editButton}>
          <Text>Edit Status</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TopHeader isBack={true} title="My Appointments" subtitle="View & Update Donation Appointments" />
      
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No appointments yet.</Text>}
      />

      {/* Update Status Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.label}>Update Appointment Status</Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select Status --" value="" />
                  <Picker.Item label="Scheduled" value="scheduled" />
                  <Picker.Item label="Completed" value="completed" />
                  <Picker.Item label="Cancelled" value="cancelled" />
                </Picker>
              </View>

              <TouchableOpacity
                style={[styles.button, !selectedStatus && { backgroundColor: '#ccc' }]}
                onPress={handleUpdateStatus}
                disabled={!selectedStatus}
              >
                <Text style={styles.buttonText}>Update Status</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { marginVertical: 10, fontWeight: '600', fontSize: 15 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9'
  },
  picker: {
    height: 50,
    width: '100%'
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#E53935',
    padding: 8,
    borderRadius: 6
  },
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  appointmentCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  appointmentDate: {
    fontSize: 14,
    color: '#555'
  },
  appointmentNotes: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#777'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden'
  },
  modalHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
});
