import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function RequestBloodScreen() {
  const [bloodGroups, setBloodGroups] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [form, setForm] = useState({
    blood_group_id: '',
    quantity_ml: '',
    urgency: 'medium',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchBloodGroups();
    fetchRequests();
  }, []);

  const fetchBloodGroups = async () => {
    const { data } = await supabase.from('blood_groups').select('*');
    setBloodGroups(data || []);
  };

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('blood_requests')
      .select('*, blood_groups(type)')
      .eq('requested_by', user.id)
      .order('created_at', { ascending: false });

    setBloodRequests(data || []);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!form.blood_group_id || !form.quantity_ml || !form.location) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill all required fields.' });
      return;
    }

    const { error } = await supabase.from('blood_requests').insert([{
      ...form,
      quantity_ml: parseInt(form.quantity_ml),
      requested_by: user.id,
      status: 'pending'
    }]);

    if (error) {
      Toast.show({ type: 'error', text1: 'Failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Request submitted' });
      setForm({ blood_group_id: '', quantity_ml: '', urgency: 'medium', location: '', notes: '' });
      setModalVisible(false);
      fetchRequests();
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.requestTitle}>{item.blood_groups?.type || 'Unknown'} — {item.quantity_ml} ml</Text>
      <Text>Status: {item.status}</Text>
      <Text>Urgency: {item.urgency}</Text>
      <Text>Location: {item.location}</Text>
      {item.notes ? <Text>Notes: {item.notes}</Text> : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <TopHeader isBack={true} title="Blood Requests" subtitle="View & Make Blood Requests" />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Make Request</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={bloodRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        ListEmptyComponent={<Text style={{ padding: 20 }}>No requests yet.</Text>}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.title}>New Blood Request</Text>

            <Text style={styles.label}>Blood Type *</Text>
            <View style={styles.optionsWrapper}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.option, form.blood_group_id === group.id && styles.optionSelected]}
                  onPress={() => setForm({ ...form, blood_group_id: group.id })}
                >
                  <Text style={form.blood_group_id === group.id ? styles.selectedText : null}>
                    {group.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Quantity (ml) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.quantity_ml}
              onChangeText={(v) => setForm({ ...form, quantity_ml: v })}
            />

            <Text style={styles.label}>Urgency</Text>
            <View style={styles.optionsWrapper}>
              {['low', 'medium', 'high'].map((urgency) => (
                <TouchableOpacity
                  key={urgency}
                  style={[styles.option, form.urgency === urgency && styles.optionSelected]}
                  onPress={() => setForm({ ...form, urgency })}
                >
                  <Text style={form.urgency === urgency ? styles.selectedText : null}>
                    {urgency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(v) => setForm({ ...form, location: v })}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              value={form.notes}
              onChangeText={(v) => setForm({ ...form, notes: v })}
              multiline
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit Request</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: '#E53935', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
  },
  addButton: {
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { marginTop: 15, marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
  },
  optionSelected: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  requestCard: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '100%',
  },
});
