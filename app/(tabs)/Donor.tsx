// src/screens/DonorScreen.tsx
import { donorService } from '@/src/_services';
import Colors from '@/src/_utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

interface Donor {
  _id: string;
  userId: string;
  bloodType: string;
  lastDonationDate: Date;
  location: string;
  age: number;
  gender: string;
  eligibleToDonate: boolean;
}

const donorSchema = Yup.object({
  userId: Yup.string().required('User ID is required'),
  bloodType: Yup.string().required('Blood type is required'),
  location: Yup.string().required('Location is required'),
  age: Yup.number().required('Age is required').positive().integer(),
  gender: Yup.string().required('Gender is required'),
  eligibleToDonate: Yup.boolean(),
});

const DonorScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width > 640;

  const [donors, setDonors] = useState<Donor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState({
    userId: '',
    bloodType: '',
    lastDonationDate: '',
    location: '',
    age: '',
    gender: '',
    eligibleToDonate: true,
  });

  const fetchDonors = async () => {
    try {
      const data = await donorService.getAll();
      setDonors(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error fetching donors' });
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const openModalForCreate = () => {
    setEditingId(null);
    setFormInitialValues({
      userId: '',
      bloodType: '',
      lastDonationDate: '',
      location: '',
      age: '',
      gender: '',
      eligibleToDonate: true,
    });
    setModalVisible(true);
  };

  const openModalForEdit = (item: Donor) => {
    setEditingId(item._id);
    setFormInitialValues({
      userId: item.userId,
      bloodType: item.bloodType,
      lastDonationDate: item.lastDonationDate.toString(),
      location: item.location,
      age: item.age.toString(),
      gender: item.gender,
      eligibleToDonate: item.eligibleToDonate,
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
      await donorService.remove(deletingId);
      Toast.show({ type: 'success', text1: 'Deleted Successfully' });
      fetchDonors();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    } finally {
      setConfirmDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    const payload = {
      userId: values.userId.trim(),
      bloodType: values.bloodType.trim(),
      lastDonationDate: new Date(values.lastDonationDate),
      location: values.location.trim(),
      age: parseInt(values.age.trim(), 10),
      gender: values.gender.trim(),
      eligibleToDonate: values.eligibleToDonate,
    };

    try {
      if (editingId) {
        await donorService.update(editingId, payload);
        Toast.show({ type: 'success', text1: 'Updated Successfully' });
      } else {
        await donorService.create(payload);
        Toast.show({ type: 'success', text1: 'Created Successfully' });
      }
      resetForm();
      setEditingId(null);
      setModalVisible(false);
      fetchDonors();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Action failed';
      Toast.show({ type: 'error', text1: msg });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donors</Text>
        <TouchableOpacity onPress={openModalForCreate}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={donors}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupType}>{item.bloodType}</Text>
              <Text>Location: {item.location}</Text>
              <Text>Age: {item.age}</Text>
              <Text>Eligible: {item.eligibleToDonate ? 'Yes' : 'No'}</Text>
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

      {/* Form Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { width: isSmallScreen ? '60%' : '90%' }]}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Donor</Text>
            <Formik
              initialValues={formInitialValues}
              enableReinitialize
              validationSchema={donorSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm }) => (
                <>
                  <Text style={styles.label}>User ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="User ID"
                    value={values.userId}
                    onChangeText={handleChange('userId')}
                    onBlur={handleBlur('userId')}
                  />
                  {touched.userId && errors.userId && <Text style={styles.error}>{errors.userId}</Text>}

                  <Text style={styles.label}>Blood Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Blood Type (e.g., A+)"
                    value={values.bloodType}
                    onChangeText={handleChange('bloodType')}
                    onBlur={handleBlur('bloodType')}
                  />
                  {touched.bloodType && errors.bloodType && <Text style={styles.error}>{errors.bloodType}</Text>}

                  <Text style={styles.label}>Last Donation Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Donation Date"
                    value={values.lastDonationDate}
                    onChangeText={handleChange('lastDonationDate')}
                    onBlur={handleBlur('lastDonationDate')}
                  />

                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={values.location}
                    onChangeText={handleChange('location')}
                  />

                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Age"
                    value={values.age}
                    onChangeText={handleChange('age')}
                  />

                  <Text style={styles.label}>Gender</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Gender"
                    value={values.gender}
                    onChangeText={handleChange('gender')}
                  />

                  <Text style={styles.label}>Eligible to Donate</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Eligible to Donate"
                    value={values.eligibleToDonate ? 'Yes' : 'No'}
                    onChangeText={handleChange('eligibleToDonate')}
                  />

                  <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                    <Text style={styles.buttonText}>{editingId ? 'Update' : 'Create'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: Colors.mediumDark }]}
                    onPress={() => {
                      resetForm();
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
            <Text style={{ marginBottom: 20 }}>Are you sure you want to delete this donor?</Text>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  groupType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  edit: {
    color: Colors.primary,
    marginBottom: 5,
  },
  delete: {
    color: Colors.danger,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginBottom: 5,
  },
});

export default DonorScreen;
