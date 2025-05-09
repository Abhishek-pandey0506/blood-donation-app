import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Importing Expo Icons
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList, ScrollView, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function CentersScreen() {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) return setLoadingRole(false);

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error) setRole(data.role);
      setLoadingRole(false);
    };

    getRole();
  }, []);

  const fetchCenters = async () => {
    setLoadingCenters(true);

    const { data, error } = await supabase
      .from('donation_centers')
      .select(`
        *,
        center_blood_stock (
          units_available,
          blood_groups (type)
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setCenters(data);
      setFilteredCenters(data);
    }

    setLoadingCenters(false);
  };

  useEffect(() => {
    if (role) fetchCenters();
  }, [role]);

  useEffect(() => {
    const filtered = centers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCenters(filtered);
  }, [search, centers]);

  const handleDelete = async (id) => {
    Alert.alert('Delete Center', 'Are you sure you want to delete this center?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('donation_centers').delete().eq('id', id);
          if (!error) {
            Toast.show({ type: 'success', text1: 'Center deleted' });
            fetchCenters();
          }
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('donation_centers')
      .update(editingData)
      .eq('id', editingId);

    if (!error) {
      Toast.show({ type: 'success', text1: 'Center updated' });
      setEditingId(null);
      setEditingData({});
      fetchCenters();
    }
  };

  const renderCenter = ({ item }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.card}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editingData.name}
              onChangeText={(v) => setEditingData({ ...editingData, name: v })}
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={editingData.address}
              onChangeText={(v) => setEditingData({ ...editingData, address: v })}
              placeholder="Address"
            />
            <TextInput
              style={styles.input}
              value={editingData.contact_phone}
              onChangeText={(v) => setEditingData({ ...editingData, contact_phone: v })}
              placeholder="Phone"
            />
            <TextInput
              style={styles.input}
              value={editingData.email}
              onChangeText={(v) => setEditingData({ ...editingData, email: v })}
              placeholder="Email"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.centerName}>{item.name}</Text>
            <Text style={styles.centerDetail}>📍 {item.address}</Text>
            {item.contact_phone && <Text style={styles.centerDetail}>📞 {item.contact_phone}</Text>}
            {item.email && <Text style={styles.centerDetail}>✉️ {item.email}</Text>}
            {item.center_blood_stock?.length > 0 && (
              <View style={styles.stockWrap}>
                {item.center_blood_stock.map((s, i) => (
                  <Text key={i} style={styles.stockText}>
                    🩸 {s.blood_groups?.type}: {s.units_available} ml
                  </Text>
                ))}
              </View>
            )}
            {role === 'admin' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setEditingId(item.id);
                    setEditingData({
                      name: item.name,
                      address: item.address,
                      contact_phone: item.contact_phone,
                      email: item.email,
                    });
                  }}
                >
                  <MaterialIcons name="edit" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (loadingRole || loadingCenters) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
       <TopHeader  />
      <View style={{ padding: 20, }}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {role === 'admin' ? 'Manage Centers' : 'Nearby Donation Centers'}
        </Text>
        {role === 'admin' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/AddCenter')}>
            <Ionicons name="add-circle-outline" size={30} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or address"
        value={search}
        onChangeText={setSearch}
      />
      {filteredCenters.length === 0 ? (
        <Text style={styles.noData}>No centers found.</Text>
      ) : (
        <FlatList
          data={filteredCenters}
          keyExtractor={(item) => item.id}
          renderItem={renderCenter}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: { backgroundColor: '#fff' , paddingBottom: 50,},
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  addBtn: { padding: 10 },
  card: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  centerName: { fontSize: 16, fontWeight: '700' },
  centerDetail: { color: '#555', fontSize: 14, marginTop: 4 },
  stockWrap: { marginTop: 8 },
  stockText: { fontSize: 13, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  actionRow: { flexDirection: 'row', marginTop: 10 },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 10,
    marginRight: 5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    padding: 10,
    marginLeft: 5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: { marginTop: 10, backgroundColor: Colors.primary, padding: 10, borderRadius: 6 },
  saveText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  noData: { textAlign: 'center', fontSize: 16, marginTop: 30, color: '#999' },
});
