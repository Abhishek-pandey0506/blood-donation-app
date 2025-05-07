import {
    donationCenterService
} from '@/src/_services';
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
    useWindowDimensions,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
  
  interface Coordinates {
    lat: number;
    lng: number;
  }
  
  interface Location {
    city: string;
    state: string;
    coordinates: Coordinates;
  }
  
  interface DonationCenter {
    _id: string;
    name: string;
    address: string;
    contactNumber: string;
    email: string;
    location: Location;
    openingHours: string;
    isVerified: boolean;
    addedBy: string;
  }
  
  const donationCenterSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
    contactNumber: Yup.string().required('Contact number is required'),
    email: Yup.string().email().required('Email is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    // lat: Yup.number().required('Latitude is required'),
    // lng: Yup.number().required('Longitude is required'),
    openingHours: Yup.string().required('Opening hours are required'),
  });
  
  const DonationCenterScreen = () => {
    const { width } = useWindowDimensions();
    const isSmallScreen = width > 640;
    const user = useSelector((state)=> state.auth.user) 

    const [centers, setCenters] = useState<DonationCenter[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
  
    const [formInitialValues, setFormInitialValues] = useState({
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      city: '',
      state: '',
      lat: '',
      lng: '',
      openingHours: '',
    });
  
    const fetchCenters = async () => {
      try {
        const data = await donationCenterService.getAll();
        setCenters(data);
      } catch {
        Toast.show({ type: 'error', text1: 'Error fetching centers' });
      }
    };
  
    useEffect(() => {
      fetchCenters();
    }, []);
  
    const openModalForCreate = () => {
      setEditingId(null);
      setFormInitialValues({
        name: '',
        address: '',
        contactNumber: '',
        email: '',
        city: '',
        state: '',
        lat: '',
        lng: '',
        openingHours: '',
      });
      setModalVisible(true);
    };
  
    const openModalForEdit = (center: DonationCenter) => {
      setEditingId(center._id);
      setFormInitialValues({
        name: center.name,
        address: center.address,
        contactNumber: center.contactNumber,
        email: center.email,
        city: center.location.city,
        state: center.location.state,
        lat: center.location.coordinates.lat.toString(),
        lng: center.location.coordinates.lng.toString(),
        openingHours: center.openingHours,
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
        await donationCenterService.remove(deletingId);
        Toast.show({ type: 'success', text1: 'Deleted Successfully' });
        fetchCenters();
      } catch {
        Toast.show({ type: 'error', text1: 'Delete failed' });
      } finally {
        setConfirmDeleteModal(false);
        setDeletingId(null);
      }
    };
  
    const handleSubmit = async (values: any, { resetForm }: any) => {
      const payload = {
        name: values.name.trim(),
        address: values.address.trim(),
        contactNumber: values.contactNumber.trim(),
        email: values.email.trim(),
        location: {
          city: values.city.trim(),
          state: values.state.trim(),
          coordinates: {
            lat: parseFloat(values.lat),
            lng: parseFloat(values.lng),
          },
        },
        openingHours: values.openingHours.trim(),
        addedBy: user._id, // replace this with actual logged-in admin ID
      };
  
      try {
        if (editingId) {
          await donationCenterService.update(editingId, payload);
          Toast.show({ type: 'success', text1: 'Updated Successfully' });
        } else {
          await donationCenterService.create(payload);
          Toast.show({ type: 'success', text1: 'Created Successfully' });
        }
        resetForm();
        setEditingId(null);
        setModalVisible(false);
        fetchCenters();
      } catch (error: any) {
        const msg = error.response?.data?.error || 'Action failed';
        Toast.show({ type: 'error', text1: msg });
      }
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Donation Centers</Text>
          <TouchableOpacity onPress={openModalForCreate}>
            <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
  
        <FlatList
          data={centers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupType}>{item.name}</Text>
                <Text>{item.address}</Text>
                <Text>{item.email} | {item.contactNumber}</Text>
                <Text>Location: {item.location.city}, {item.location.state}</Text>
                <Text>Hours: {item.openingHours}</Text>
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
              <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Donation Center</Text>
              <Formik
                initialValues={formInitialValues}
                enableReinitialize
                validationSchema={donationCenterSchema}
                onSubmit={handleSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm }) => (
                  <>
                    {['name', 'address', 'contactNumber', 'email', 'city', 'state', 'lat', 'lng', 'openingHours'].map((field) => (
                      <View key={field}>
                        <Text style={styles.label}>{field.replace(/([A-Z])/g, ' $1')}</Text>
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
              <Text style={{ marginBottom: 20 }}>Are you sure you want to delete this donation center?</Text>
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
      backgroundColor: Colors.background,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.secondary,
    },
    label: {
      fontWeight: '500',
      fontSize: 16,
      marginBottom: 5,
      color: Colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
    },
    error: {
      color: 'red',
      marginBottom: 10,
      fontSize: 12,
    },
    button: {
      backgroundColor: Colors.primary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
    },
    listItem: {
      flexDirection: 'row',
      gap: 10,
      padding: 12,
      borderBottomWidth: 1,
      borderColor: '#eee',
      alignItems: 'flex-start',
    },
    groupType: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    actions: {
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 10,
    },
    edit: {
      color: Colors.secondary,
      fontWeight: '500',
      marginBottom: 5,
    },
    delete: {
      color: 'red',
      fontWeight: '500',
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      width: '90%',
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.secondary,
      marginBottom: 10,
    },
  });
  
  export default DonationCenterScreen;
  