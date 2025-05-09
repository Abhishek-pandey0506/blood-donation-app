import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import { AntDesign, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookAppointmentScreen() {
  const [centers, setCenters] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('');  // For Blood Group
  const [donationVolume, setDonationVolume] = useState('');  // For Donation Volume (in milliliters)

  const fetchCenters = async () => {
    const { data, error } = await supabase.from('donation_centers').select('*');
    if (!error) setCenters(data || []);
  };

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('donation_appointments')
      .select('*, donation_centers(name)')
      .eq('donor_id', user.id)
      .order('scheduled_date', { ascending: false });

    if (!error) setAppointments(data || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCenters();
      await fetchAppointments();
      setLoading(false);
    })();
  }, []);

  const handleBook = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!selectedCenter || !bloodGroup || !donationVolume) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: 'Please fill in all required fields.' });
      return;
    }

    const { error } = await supabase.from('donation_appointments').insert([{
      donor_id: user.id,
      center_id: selectedCenter,
      scheduled_date: date.toISOString(),
      status: 'scheduled',
      notes: notes.trim() || null,
      blood_group_id: bloodGroup,  // Include blood group
      donation_volume_ml: donationVolume  // Include donation volume
    }]);

    if (error) {
      Toast.show({ type: 'error', text1: 'Booking Failed', text2: error.message });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Appointment Confirmed',
        text2: 'Thank you for scheduling your donation!'
      });
      setSelectedCenter('');
      setBloodGroup('');
      setDonationVolume('');
      setDate(new Date());
      setNotes('');
      setModalVisible(false);
      fetchAppointments();
    }
  };

  const renderDateInput = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={date.toISOString().substring(0, 10)}
          onChange={(e) => setDate(new Date(e.target.value))}
          style={styles.webDateInput}
        />
      );
    }

    return (
      <>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateInput}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            value={date}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
      </>
    );
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
       <Text style={styles.appointmentNotes}>{item.status}</Text>
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
      <TopHeader isBack={true} title="My Appointments" subtitle="View & Book Donation Appointments" />
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.bookButton}
        >
          <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No appointments yet.</Text>}
      />

      {/* Booking Modal */}
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
              <Text style={styles.label}>Select Donation Center</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCenter}
                  onValueChange={(value) => setSelectedCenter(value)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select a center --" value="" />
                  {centers.map((center) => (
                    <Picker.Item key={center.id} label={center.name} value={center.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Select Date</Text>
              {renderDateInput()}

              <Text style={styles.label}>Blood Group</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={bloodGroup}
                  onValueChange={(value) => setBloodGroup(value)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select a blood group --" value="" />
                  <Picker.Item label="A+" value="A+" />
                  <Picker.Item label="A-" value="A-" />
                  <Picker.Item label="B+" value="B+" />
                  <Picker.Item label="B-" value="B-" />
                  <Picker.Item label="O+" value="O+" />
                  <Picker.Item label="O-" value="O-" />
                  <Picker.Item label="AB+" value="AB+" />
                  <Picker.Item label="AB-" value="AB-" />
                </Picker>
              </View>

              <Text style={styles.label}>Donation Volume (in ml)</Text>
              <TextInput
                value={donationVolume}
                onChangeText={setDonationVolume}
                placeholder="Enter volume in milliliters"
                keyboardType="numeric"
                style={styles.notesInput}
              />

              <Text style={styles.label}>Add Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Mention any relevant info"
                multiline
                style={styles.notesInput}
              />

              <TouchableOpacity
                style={[styles.button, !selectedCenter || !bloodGroup || !donationVolume ? { backgroundColor: '#ccc' } : {}]}
                onPress={handleBook}
                disabled={!selectedCenter || !bloodGroup || !donationVolume}
              >
                <Text style={styles.buttonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Add styles for new inputs and other components
  container: {},
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%'
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginRight: 15,
    marginTop: 10
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 20,
    textAlignVertical: 'top'
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'flex-end',
    paddingTop: 10
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
