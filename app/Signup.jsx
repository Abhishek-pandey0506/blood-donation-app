import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import images from '@/src/_utils/images';
import { useRouter } from "expo-router";
import { Formik } from 'formik';
import { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

const registerSchema = Yup.object({
  name: Yup.string().min(3, 'Name must be at least 3 characters').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  phone: Yup.string().required('Phone is required'),
});

const RegisterScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width > 640;
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleRegister = async (values) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;
      const { user } = authData;

      const { error: dbError } = await supabase.from('users').insert([
        {
          id: user.id,
          email: values.email,
          name: values.name,
          phone: values.phone,
          role: 'donor',
          location: '',
          blood_group_id: null,
        }
      ]);

      if (dbError) throw dbError;

      setShowVerifyModal(true);
    } catch (error) {
      console.error('Register error:', error);
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error.message || 'Something went wrong',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={[styles.card, { width: isSmallScreen ? '40%' : '100%' }]}>
        <Image style={styles.image} source={images.splash} resizeMode='contain' />

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.desc}>Fill in your details to sign up</Text>

        <Formik
          initialValues={{ name: '', email: '', password: '', phone: '' }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
              />
              {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => router.replace("/Login")}>
            Login here
          </Text>
        </Text>
      </View>

      {/* Email Verification Modal */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Check Your Email</Text>
            <Text style={styles.modalMessage}>
              A verification link has been sent to your email. Please verify your account before logging in.
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => {
                setShowVerifyModal(false);
                router.replace('/Login');
              }}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  image: {
    height: 200,
    width: '100%',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
    color: Colors.secondary,
  },
  desc: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    color: Colors.mediumDark,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginText: {
    marginTop: 15,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '600',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.secondary,
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default RegisterScreen;
