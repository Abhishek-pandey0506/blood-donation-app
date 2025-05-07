// src/screens/DonationRecordScreen.tsx
import { donationService } from '@/src/_services';
import Colors from '@/src/_utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const donationSchema = Yup.object({
  donorId: Yup.string().required('Donor ID is required'),
  donationDate: Yup.string().required('Donation date is required'),
  bloodType: Yup.string().oneOf(bloodTypes).required('Blood type is required'),
  centerId: Yup.string().required('Center ID is required'),
  volume: Yup.number().min(100).max(600).required('Volume is required'),
  verified: Yup.boolean(),
  notes: Yup.string(),
});

const DonationRecordScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width > 640;

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formInitialValues, setFormInitialValues] = useState({
    donorId: '',
    donationDate: new Date().toISOString().split('T')[0],
    bloodType: '',
    centerId: '',
    volume: '',
    verified: false,
    notes: '',
  });

  const fetchRecords = async () => {
    try {
      const data = await donationService.getAll();
      setRecords(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error fetching records' });
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openModalForCreate = () => {
    setEditingId(null);
    setFormInitialValues({
      donorId: '',
      donationDate: new Date().toISOString().split('T')[0],
      bloodType: '',
      centerId: '',
      volume: '',
      verified: false,
      notes: '',
    });
    setModalVisible(true);
  };

  const openModalForEdit = (record) => {
    setEditingId(record._id);
    setFormInitialValues({
      donorId: record.donorId,
      donationDate: record.donationDate.split('T')[0],
      bloodType: record.bloodType,
      centerId: record.centerId,
      volume: record.volume.toString(),
      verified: record.verified,
      notes: record.notes || '',
    });
    setModalVisible(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setConfirmDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await donationService.remove(deletingId);
      Toast.show({ type: 'success', text1: 'Deleted Successfully' });
      fetchRecords();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    } finally {
      setConfirmDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    const payload = {
      donorId: values.donorId.trim(),
      donationDate: values.donationDate,
      bloodType: values.bloodType,
      centerId: values.centerId.trim(),
      volume: parseFloat(values.volume),
      verified: values.verified,
      notes: values.notes?.trim(),
    };

    try {
      if (editingId) {
        await donationService.update(editingId, payload);
        Toast.show({ type: 'success', text1: 'Updated Successfully' });
      } else {
        await donationService.create(payload);
        Toast.show({ type: 'success', text1: 'Created Successfully' });
      }
      resetForm();
      setModalVisible(false);
      setEditingId(null);
      fetchRecords();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Action failed';
      Toast.show({ type: 'error', text1: msg });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donation Records</Text>
        <TouchableOpacity onPress={openModalForCreate}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupType}>{item.bloodType}</Text>
              <Text>Donor: {item.donorId}</Text>
              <Text>Center: {item.centerId}</Text>
              <Text>Date: {item.donationDate.split('T')[0]}</Text>
              <Text>Volume: {item.volume} ml</Text>
              <Text>Verified: {item.verified ? 'Yes' : 'No'}</Text>
              {item.notes ? <Text>Notes: {item.notes}</Text> : null}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openModalForEdit(item)}>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item._id)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for Form */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { width: isSmallScreen ? '60%' : '90%' }]}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Record</Text>
            <Formik
              initialValues={formInitialValues}
              enableReinitialize
              validationSchema={donationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <>
                  {['donorId', 'centerId', 'donationDate', 'bloodType', 'volume', 'notes'].map((field) => (
                    <View key={field}>
                      <Text style={styles.label}>{field}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={field}
                        value={values[field]}
                        onChangeText={handleChange(field)}
                        onBlur={handleBlur(field)}
                      />
                      {touched[field] && errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
                    </View>
                  ))}

                  <View>
                    <Text style={styles.label}>Verified</Text>
                    <TouchableOpacity
                      style={[styles.input, { padding: 12 }]}
                      onPress={() => setFieldValue('verified', !values.verified)}
                    >
                      <Text>{values.verified ? 'Yes' : 'No'}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                    <Text style={styles.buttonText}>{editingId ? 'Update' : 'Create'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: Colors.mediumDark }]}
                    onPress={() => {
                      setModalVisible(false);
                      setEditingId(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={confirmDeleteModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={{ marginBottom: 20 }}>Are you sure you want to delete this record?</Text>
            <TouchableOpacity style={styles.button} onPress={handleDelete}>
              <Text style={styles.buttonText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.mediumDark }]}
              onPress={() => setConfirmDeleteModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.secondary },
  label: { fontWeight: '500', fontSize: 16, marginBottom: 5, color: Colors.text },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 10 },
  error: { color: 'red', fontSize: 12, marginBottom: 10 },
  button: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start',
    gap: 10,
  },
  groupType: { fontWeight: 'bold', fontSize: 16 },
  actions: { flexDirection: 'column', justifyContent: 'center', gap: 10 },
  edit: { color: Colors.secondary, fontWeight: '500' },
  delete: { color: 'red', fontWeight: '500' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.secondary, marginBottom: 10 },
});

export default DonationRecordScreen;
