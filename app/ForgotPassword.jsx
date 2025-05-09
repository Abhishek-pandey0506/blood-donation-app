import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

const forgotPasswordSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordScreen = () => {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isSmallScreen = width > 640;

    const handleForgotPassword = async (values) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
                redirectTo: 'https://your-app.com/reset-password', // Update this in Supabase Auth settings
            });

            if (error) throw error;

            Toast.show({
                type: 'success',
                text1: 'Reset Link Sent',
                text2: 'Check your email to reset your password',
            });

            router.replace('/Login');
        } catch (error) {
            console.error('Password reset error:', error);
            Toast.show({
                type: 'error',
                text1: 'Reset Failed',
                text2: error.message || 'Unable to send reset email',
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.card, { width: isSmallScreen ? '40%' : '100%' }]}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.desc}>Enter your email to receive a reset link</Text>

                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={forgotPasswordSchema}
                    onSubmit={handleForgotPassword}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                            />
                            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Send Reset Link</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Formik>

                <Text style={styles.loginText}>
                    Remembered your password?{' '}
                    <Text style={styles.loginLink} onPress={() => router.replace('/Login')}>
                        Go to Login
                    </Text>
                </Text>
            </View>
        </View>
    );
};

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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.secondary,
    },
    desc: {
        fontSize: 16,
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
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    loginText: {
        marginTop: 20,
        textAlign: 'center',
    },
    loginLink: {
        fontWeight: '600',
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
});

export default ForgotPasswordScreen;
