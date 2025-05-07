import { authService } from '@/src/_services/auth.service';
import { setLogin } from '@/src/_store/_reducers/auth';
import Colors from '@/src/_utils/colors';
import images from '@/src/_utils/images';
import { useRouter } from "expo-router";
import { Formik } from 'formik';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

// Validation schema
const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width > 640;

  const dispatch = useDispatch();
  const handleLogin = async (values) => {
    try {
      const response = await authService.login(values);
      const res = response.data;
      console.log(response)
      if (res.token) {
        const userData = {
          token: res.token,
          email: res.user.email,
          name: res.user.name || '',
          role: res.user.role || '',
          isLoggedIn: true,
          _id: res.user._id,
          user: res.user
        };

        dispatch(setLogin(userData));

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back!`,
        });

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid email or password',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { width: isSmallScreen ? '40%' : '100%' }]}>
        <Image
          style={styles.image}
          source={images.splash}
          resizeMode='contain'
        />
        <Text style={styles.title}>Get Started.</Text>
        <Text style={styles.desc}>Enter your email and password to login</Text>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
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

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <Text style={styles.registerText}>
          Don't have an account?{' '}
          <Text style={styles.registerLink} onPress={() => router.replace("/Signup")}>
            Register here
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 }, // Equal shadow top & bottom
    shadowRadius: 10, // Controls spread
    elevation: 10, // Android shadow
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
    alignSelf: 'flex-start',
    color: Colors.secondary,
  },
  desc: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    alignSelf: 'flex-start',
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
    borderRadius: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  registerText: {
    marginTop: 15,
    textAlign: 'center',
  },
  registerLink: {
    fontWeight: '600',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
