import {
  bloodGroupService
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
import * as Yup from 'yup';
interface BloodGroup {
  _id: string;
  type: string;
  description?: string;
  compatibleWith: string[];
}

const bloodGroupSchema = Yup.object({
  type: Yup.string().required('Blood type is required'),
  description: Yup.string(),
  compatibleWith: Yup.string(),
});

const BloodGroupScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width > 640;

  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState({
    type: '',
    description: '',
    compatibleWith: '',
  });

  const fetchBloodGroups = async () => {
    try {
      const data = await bloodGroupService.getAll();
      setBloodGroups(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error fetching blood groups' });
    }
  };

  useEffect(() => {
    fetchBloodGroups();
  }, []);

  const openModalForCreate = () => {
    setEditingId(null);
    setFormInitialValues({ type: '', description: '', compatibleWith: '' });
    setModalVisible(true);
  };

  const openModalForEdit = (item: BloodGroup) => {
    setEditingId(item._id);
    setFormInitialValues({
      type: item.type,
      description: item.description || '',
      compatibleWith: item.compatibleWith.join(', '),
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
      await bloodGroupService.remove(deletingId);
      Toast.show({ type: 'success', text1: 'Deleted Successfully' });
      fetchBloodGroups();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    } finally {
      setConfirmDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    const payload = {
      type: values.type.trim(),
      description: values.description?.trim(),
      compatibleWith: values.compatibleWith
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await bloodGroupService.update(editingId, payload);
        Toast.show({ type: 'success', text1: 'Updated Successfully' });
      } else {
        await bloodGroupService.create(payload);
        Toast.show({ type: 'success', text1: 'Created Successfully' });
      }
      resetForm();
      setEditingId(null);
      setModalVisible(false);
      fetchBloodGroups();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Action failed';
      Toast.show({ type: 'error', text1: msg });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blood Groups</Text>
        <TouchableOpacity onPress={openModalForCreate}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={bloodGroups}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupType}>{item.type}</Text>
              <Text>{item.description}</Text>
              <Text>Compatible With: {item.compatibleWith.join(', ')}</Text>
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
            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Blood Group</Text>
            <Formik
              initialValues={formInitialValues}
              enableReinitialize
              validationSchema={bloodGroupSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm }) => (
                <>
                  <Text style={styles.label}>Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. A+"
                    value={values.type}
                    onChangeText={handleChange('type')}
                    onBlur={handleBlur('type')}
                  />
                  {touched.type && errors.type && <Text style={styles.error}>{errors.type}</Text>}

                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Optional description"
                    value={values.description}
                    onChangeText={handleChange('description')}
                  />

                  <Text style={styles.label}>Compatible With</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. A+, AB+"
                    value={values.compatibleWith}
                    onChangeText={handleChange('compatibleWith')}
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
            <Text style={{ marginBottom: 20 }}>Are you sure you want to delete this blood group?</Text>
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

export default BloodGroupScreen;
