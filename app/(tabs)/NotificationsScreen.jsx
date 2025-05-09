import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState(''); // Store selected user or 'all'
  const [users, setUsers] = useState([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = session?.user;
      if (!user) throw new Error('User not authenticated');

      const userId = user.id;
      const { data: userData, error: userError } = await supabase.from('users').select('role').eq('id', userId).single();
      if (userError) throw userError;
      setRole(userData?.role || 'user');

      if (userData?.role === 'admin') {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        setNotifications(data || []);
        const { data: allUsers } = await supabase.from('users').select('id, name');
        setUsers(allUsers || []);
      } else {
        const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        setNotifications(data || []);
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: error.message || 'Unexpected error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('notifications').delete().eq('id', id);
          if (!error) {
            Toast.show({ type: 'success', text1: 'Deleted successfully' });
            fetchNotifications();
          }
        },
      },
    ]);
  };

  const handleCreateNotification = async () => {
    if (!title || !message) {
      Toast.show({ type: 'error', text1: 'Title and message are required' });
      return;
    }

    try {
      if (targetUserId === 'all') {
        const inserts = users.map((user) => ({
          user_id: user.id,
          title,
          message,
        }));
        const { error } = await supabase.from('notifications').insert(inserts);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notifications').insert({
          user_id: targetUserId || null,
          title,
          message,
        });
        if (error) throw error;
      }

      Toast.show({ type: 'success', text1: 'Notification sent' });
      setModalVisible(false);
      setTitle('');
      setMessage('');
      setTargetUserId('');
      fetchNotifications();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed to send notification' });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{new Date(item.created_at).toLocaleString()}</Text>
      {/* {role === 'admin' && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={20} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6 }}>Delete</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeader />
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="notifications-outline" size={28} color={Colors.primary} />
          <Text style={styles.title}>Notifications</Text>
          {role === 'admin' ? (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ): <View/>}
        </View>

        {notifications.length === 0 ? (
          <Text style={styles.noData}>No notifications found.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Modal for adding notification */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Send Notification</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Message"
                value={message}
                onChangeText={setMessage}
                multiline
              />

              {/* Picker for user selection */}
              <Text style={styles.label}>Send to:</Text>
              <Picker
                selectedValue={targetUserId}
                onValueChange={(value) => setTargetUserId(value)}
                style={styles.picker}
              >
                <Picker.Item label="All Users" value="all" />
                {users.map((user) => (
                  <Picker.Item key={user.id} label={user.name} value={user.id} />
                ))}
              </Picker>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleCreateNotification} style={styles.sendBtn}>
                  <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
container: { backgroundColor: '#fff' , paddingBottom: 50,},
  content: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noData: { textAlign: 'center', color: '#777', marginTop: 40, fontSize: 16 },
  notificationCard: {
    // backgroundColor: '#F3F3F3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  notificationMessage: { fontSize: 14, color: '#555', marginTop: 4 },
  notificationTime: { fontSize: 12, color: '#999', marginTop: 6 },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: '#e53935',
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  sendText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: {
    backgroundColor: '#e53935',
    padding: 10,
    borderRadius: 8,
  },
  picker:{
    width: '100%',
    height: 40,
  },
  cancelText: { color: '#fff', fontWeight: 'bold' },
});

