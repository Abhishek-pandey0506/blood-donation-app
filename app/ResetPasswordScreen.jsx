import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

const passwordSchema = Yup.object({
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

export default function ResetPasswordScreen() {
  const { access_token } = useLocalSearchParams(); // access_token from deep link
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const signInWithToken = async () => {
      if (!access_token) {
        Toast.show({ type: 'error', text1: 'Missing token' });
        router.push('/Login');
        return;
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token: access_token });
      if (error) {
        Toast.show({ type: 'error', text1: 'Session error', text2: error.message });
        router.push('/Login');
      } else {
        setLoading(false);
      }
    };

    signInWithToken();
  }, [access_token]);

  const handleResetPassword = async (values) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;

      Toast.show({ type: 'success', text1: 'Password updated!' });
      router.replace('/Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Reset Failed', text2: error.message });
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={Colors.primary} />;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Your Password</Text>

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={passwordSchema}
          onSubmit={handleResetPassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Update Password</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.secondary,
    textAlign: 'center',
  },
  label: {
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
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
