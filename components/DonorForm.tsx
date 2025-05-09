import { bloodGroupService, donorService } from '@/src/_services';
import Colors from '@/src/_utils/colors';
import { RootState } from '@/src/store';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

interface DonorFormValues {
  userId: string;
  bloodType: string;
  location: string;
  age: string;
  gender: string;
  eligibleToDonate: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  bloodType: Yup.string().required('Blood type is required'),
  location: Yup.string().required('Location is required'),
  age: Yup.number().required('Age is required').positive().integer(),
  gender: Yup.string().required('Gender is required'),
  eligibleToDonate: Yup.boolean().required(),
});

const BecomeDonorModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const userId = useSelector((state: RootState) => state.auth.user?._id);


  const [bloodGroups, setBloodGroups] = useState([]);

  const fetchBloodGroups = async () => {
    try {
      const data = await bloodGroupService.getAll();
      setBloodGroups(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error fetching blood groups' });
    }
  };

  useEffect(()=>{
    fetchBloodGroups()
  },[])
  const [formInitialValues, setFormInitialValues] = useState<DonorFormValues>({
    userId: '',
    bloodType: '',
    location: '',
    age: '',
    gender: '',
    eligibleToDonate: true,
  });

  useEffect(() => {
    if (userId) {
      setFormInitialValues((prev) => ({
        ...prev,
        userId,
      }));
    }
  }, [userId]);

  const handleSubmit = async (values: DonorFormValues, { resetForm }: any) => {
    const payload = {
      userId: userId,
      bloodType: values.bloodType.trim(),
      location: values.location.trim(),
      age: parseInt(values.age.trim(), 10),
      gender: values.gender.trim(),
      eligibleToDonate: values.eligibleToDonate,
    };
    try {
      await donorService.create(payload);
      resetForm();
      onClose?.();
      onSuccess?.();
    } catch (error) {
      // Handle error as needed
      console.error('Donor creation failed:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Formik
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
              <View>
                <Text style={styles.label}>Blood Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.bloodType}
                    onValueChange={(itemValue) => setFieldValue('bloodType', itemValue)}
                  >
                    <Picker.Item label="Select blood type..." value="" />
                    {bloodGroups.map((type) => (
                      <Picker.Item label={type.type} value={type._id} key={type} />
                    ))}
                  </Picker>
                </View>
                {touched.bloodType && errors.bloodType && <Text style={styles.error}>{errors.bloodType}</Text>}


                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                />
                {touched.location && errors.location && <Text style={styles.error}>{errors.location}</Text>}

                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  keyboardType="numeric"
                  value={values.age}
                  onChangeText={handleChange('age')}
                  onBlur={handleBlur('age')}
                />
                {touched.age && errors.age && <Text style={styles.error}>{errors.age}</Text>}

                <Text style={styles.label}>Gender</Text>
                       <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.gender}
                    onValueChange={(itemValue) => setFieldValue('gender', itemValue)}
                  >
                    <Picker.Item label="Select Gender" value="" />
                    {['Male', 'Female', 'Other'].map((type) => (
                      <Picker.Item label={type} value={type} key={type} />
                    ))}
                  </Picker>
                </View>
                {touched.gender && errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

                <Text style={styles.label}>Eligible to Donate</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.eligibleToDonate ? 'Yes' : 'No'}
                    onValueChange={(val) => setFieldValue('eligibleToDonate', val === 'Yes')}
                  >
                    <Picker.Item label="Yes" value="Yes" />
                    <Picker.Item label="No" value="No" />
                  </Picker>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: 22,
    color: '#666',
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
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BecomeDonorModal;
