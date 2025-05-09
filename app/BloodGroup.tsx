import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function BloodGroupsUpdatedScreen() {
  const [bloodGroups, setBloodGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newBloodGroup, setNewBloodGroup] = useState({
    type: '',
    description: '',
    compatible_with: '',
  });

  // Fetch blood groups from Supabase
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

  // Handle deleting a blood group
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

  // Handle saving blood group updates
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

  // Handle adding a new blood group
  const handleAddBloodGroup = async () => {
    const newGroupData = {
      type: newBloodGroup.type,
      description: newBloodGroup.description,
      compatible_with: newBloodGroup.compatible_with
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
    };

    const { error } = await supabase
      .from('blood_groups')
      .insert([newGroupData]);

    if (!error) {
      Toast.show({ type: 'success', text1: 'Blood group added' });
      setNewBloodGroup({ type: '', description: '', compatible_with: '' });
      setIsAddModalVisible(false);
      fetchBloodGroups();
    }
  };

  // Render individual blood group item
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
        <TopHeader  isBack={true} title="Blood Group" subtitle='Manage Blood Groups'/>
      <View style={{ padding: 20, }}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by type or description"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addText}>+ Add New Blood Group</Text>
      </TouchableOpacity>

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

      {/* Modal to Add Blood Group */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.title}>Add Blood Group</Text>
            <TextInput
              style={styles.input}
              value={newBloodGroup.type}
              onChangeText={(v) => setNewBloodGroup({ ...newBloodGroup, type: v })}
              placeholder="Type (e.g. A+)"
            />
            <TextInput
              style={styles.input}
              value={newBloodGroup.description}
              onChangeText={(v) => setNewBloodGroup({ ...newBloodGroup, description: v })}
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={newBloodGroup.compatible_with}
              onChangeText={(v) => setNewBloodGroup({ ...newBloodGroup, compatible_with: v })}
              placeholder="Compatible With (comma-separated)"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddBloodGroup}>
              <Text style={styles.saveText}>Add Blood Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsAddModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {  backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  searchInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10,
    marginBottom: 15,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  addText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
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
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },
  saveText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  cancelText: { textAlign: 'center', color: '#555', fontWeight: '600' },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    marginTop: 50,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
