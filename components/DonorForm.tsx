import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookAppointmentScreen() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      const { data, error } = await supabase.from('donation_centers').select('*');
      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Unable to load donation centers.' });
      } else {
        setCenters(data || []);
      }
      setLoading(false);
    };
    fetchCenters();
  }, []);

  const handleBook = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      Toast.show({ type: 'error', text1: 'Authentication error', text2: 'Please log in again.' });
      return;
    }

    if (!selectedCenter) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: 'Please select a center.' });
      return;
    }

    const { error } = await supabase.from('donation_appointments').insert([
      {
        donor_id: user.id,
        center_id: selectedCenter,
        scheduled_date: date.toISOString(),
        status: 'scheduled'
      }
    ]);

    if (error) {
      Toast.show({ type: 'error', text1: 'Booking Failed', text2: error.message });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Appointment Confirmed',
        text2: 'Thank you for scheduling your donation!'
      });
      setSelectedCenter('');
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
      <TopHeader
        isBack={true}
        title={'Donation Appointment'}
        subtitle={'Book a Donation Appointment'}
      />
      <View style={{ padding: 20 }}>
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

        <TouchableOpacity
          style={[styles.button, !selectedCenter && { backgroundColor: '#ccc' }]}
          onPress={handleBook}
          disabled={!selectedCenter}
        >
          <Text style={styles.buttonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    width: '100%',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
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
  }
});
