import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

const DonorProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '' });
  const [bloodGroups, setBloodGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, name, email, phone, role, location, blood_group_id,
          blood_groups (id, type)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        location: data.location || '',
      });
      setSelectedGroupId(data.blood_groups?.id || null);
    } catch (error) {
      console.error('Profile fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodGroups = async () => {
    const { data, error } = await supabase.from('blood_groups').select();
    if (error) {
      console.error('Failed to fetch blood groups:', error);
      Toast.show({ type: 'error', text1: 'Could not load blood groups' });
    } else {
      setBloodGroups(data);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBloodGroups();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Toast.show({ type: 'success', text1: 'Logged out' });
    router.replace('/Login');
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        blood_group_id: selectedGroupId,
      })
      .eq('id', profile.id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to update profile' });
      return;
    }

    Toast.show({ type: 'success', text1: 'Profile updated' });
    setModalVisible(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Could not load profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <TopHeader  />
      <View style={{ padding: 20, }}>
      <Text style={styles.title}>👤 My Profile</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{profile.phone}</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{profile.location || 'Not provided'}</Text>

        <Text style={styles.label}>Blood Group</Text>
        <Text style={styles.value}>{profile.blood_groups?.type || 'Unknown'}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{profile.role}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.logoutText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              placeholder="Name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Location"
              value={form.location}
              onChangeText={(text) => setForm({ ...form, location: text })}
              style={styles.input}
            />

            <Text style={{ fontSize: 14, marginBottom: 6, color: '#555' }}>Blood Group</Text>
            <View style={styles.pickerContainer}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.pickerItem,
                    selectedGroupId === group.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedGroupId(group.id)}
                >
                  <Text
                    style={{
                      color: selectedGroupId === group.id ? '#fff' : '#333',
                      fontWeight: '600',
                    }}
                  >
                    {group.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
container: { backgroundColor: '#fff' , paddingBottom: 50,},
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 25,
    color: Colors.primary,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
    marginTop: 14,
  },
  value: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: Colors.primary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontSize: 14,
  },
});

export default DonorProfileScreen;
