import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

const AddDonationCenterScreen = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddCenter = async () => {
    if (!name.trim() || !address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name and Address are required',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('donation_centers').insert({
      name: name.trim(),
      address: address.trim(),
      contact_phone: phone.trim() || null,
      email: email.trim() || null,
    });

    setLoading(false);

    if (error) {
      console.error('Insert error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add center',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Center added successfully',
      });
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Add Donation Center</Text>

      <TextInput
        style={styles.input}
        placeholder="Center Name *"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Address *"
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddCenter}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Center</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff',
  },
  title: {
    fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: '600',
  },
});

export default AddDonationCenterScreen;
