import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import Colors from '@/src/_utils/colors';

export default function BloodGroupsUpdatedScreen() {
  const [bloodGroups, setBloodGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const fetchBloodGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blood_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setBloodGroups(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBloodGroups();
  }, []);

  useEffect(() => {
    const filteredList = bloodGroups.filter(b =>
      b.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(filteredList);
  }, [searchTerm, bloodGroups]);

  const handleDelete = async (id) => {
    Alert.alert('Delete Blood Group', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const { error } = await supabase.from('blood_groups').delete().eq('id', id);
          if (!error) {
            Toast.show({ type: 'success', text1: 'Deleted successfully' });
            fetchBloodGroups();
          }
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    const updatedData = {
      ...editingData,
      compatible_with: editingData.compatible_with
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
    };

    const { error } = await supabase
      .from('blood_groups')
      .update(updatedData)
      .eq('id', editingId);

    if (!error) {
      Toast.show({ type: 'success', text1: 'Blood group updated' });
      setEditingId(null);
      setEditingData({});
      fetchBloodGroups();
    }
  };

  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.card}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editingData.type}
              onChangeText={(v) => setEditingData({ ...editingData, type: v })}
              placeholder="Type (e.g. A+)"
            />
            <TextInput
              style={styles.input}
              value={editingData.description}
              onChangeText={(v) => setEditingData({ ...editingData, description: v })}
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={editingData.compatible_with}
              onChangeText={(v) => setEditingData({ ...editingData, compatible_with: v })}
              placeholder="Compatible With (comma-separated)"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.groupType}>{item.type}</Text>
            {item.description ? <Text style={styles.groupDetail}>📝 {item.description}</Text> : null}
            {item.compatible_with?.length > 0 && (
              <Text style={styles.groupDetail}>
                🔁 Compatible With: {Array.isArray(item.compatible_with)
                  ? item.compatible_with.join(', ')
                  : item.compatible_with}
              </Text>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setEditingId(item.id);
                  setEditingData({
                    type: item.type,
                    description: item.description || '',
                    compatible_with: Array.isArray(item.compatible_with)
                      ? item.compatible_with.join(', ')
                      : (item.compatible_with || ''),
                  });
                }}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Blood Groups</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by type or description"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  searchInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  groupType: { fontSize: 16, fontWeight: '700' },
  groupDetail: { color: '#555', fontSize: 14, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 10, marginTop: 8,
  },
  actionRow: { flexDirection: 'row', marginTop: 10 },
  editBtn: {
    flex: 1, backgroundColor: Colors.primary, padding: 10, marginRight: 5, borderRadius: 6,
  },
  deleteBtn: {
    flex: 1, backgroundColor: '#e53935', padding: 10, marginLeft: 5, borderRadius: 6,
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 6,
  },
  saveText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  editText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  deleteText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
});
