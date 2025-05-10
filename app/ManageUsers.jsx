import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
export default function ManageUsersScreen() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [updatedName, setUpdatedName] = useState('');
    const [updatedPhone, setUpdatedPhone] = useState('');
    const [updatedBloodGroup, setUpdatedBloodGroup] = useState('');
    const [updatedRole, setUpdatedRole] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, blood_groups(type)')
            .order('name', { ascending: true });

        if (!error) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (userId, newRole) => {
        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            Toast.show({ type: 'error', text1: 'Update Failed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: `Role updated to ${newRole}` });
            fetchUsers();
        }
    };

    const handleDeleteUser = (userId) => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            [
                { text: 'Cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        const { error } = await supabase
                            .from('users')
                            .delete()
                            .eq('id', userId);
                        if (error) {
                            Toast.show({ type: 'error', text1: 'Delete Failed', text2: error.message });
                        } else {
                            Toast.show({ type: 'success', text1: 'User deleted successfully' });
                            fetchUsers();
                        }
                    },
                },
            ]
        );
    };

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setUpdatedName(user.name);
        setUpdatedPhone(user.phone);
        setUpdatedBloodGroup(user.blood_groups?.type || ''); // Set blood group if available
        setUpdatedRole(user.role);
    };

    const handleSaveEdit = async () => {
        const { error } = await supabase
            .from('users')
            .update({
                name: updatedName,
                phone: updatedPhone,
                blood_groups: { type: updatedBloodGroup }, // Update blood group
                role: updatedRole, // Ensure role is updated
            })
            .eq('id', editingUser);

        if (error) {
            Toast.show({ type: 'error', text1: 'Edit Failed', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: 'User updated successfully' });
            setEditingUser(null);
            fetchUsers();
        }
    };

    const renderUser = ({ item }) => (
        <View style={styles.card}>
            {editingUser === item.id ? (
                <View>
                    <TextInput
                        style={styles.input}
                        value={updatedName}
                        onChangeText={setUpdatedName}
                        placeholder="Name"
                    />
                    <TextInput
                        style={styles.input}
                        value={updatedPhone}
                        onChangeText={setUpdatedPhone}
                        placeholder="Phone"
                    />
                    <TextInput
                        style={styles.input}
                        value={updatedBloodGroup}
                        onChangeText={setUpdatedBloodGroup}
                        placeholder="Blood Group"
                    />
                    <View style={styles.roleButtons}>
                        {['donor', 'staff', 'admin'].map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.roleButton,
                                    updatedRole === role && styles.activeRole,
                                ]}
                                onPress={() => setUpdatedRole(role)}
                            >
                                <Text style={styles.roleText}>{role.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setEditingUser(null)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.detail}>📞 {item.phone}</Text>
                    <Text style={styles.detail}>🧬 {item.blood_groups?.type || 'Unknown'} • {item.role}</Text>
                   

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditUser(item)}
                        >
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteUser(item.id)}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
<TopHeader  isBack={true} title={'Manage Users'} subtitle={'Manage all users'}/>
      <View style={{ padding: 20, }}>
            <Text style={styles.header}>Manage Users</Text>
            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" /></View>
            ) : users.length === 0 ? (
                <Text style={styles.noData}>No users found.</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {  backgroundColor: '#fff',},
    header: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noData: { textAlign: 'center', marginTop: 40, color: '#999' },
    card: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    detail: { fontSize: 14, color: '#555' },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    roleButton: {
        padding: 8,
        backgroundColor: '#ddd',
        borderRadius: 6,
        flex: 1,
        marginHorizontal: 3,
    },
    activeRole: {
        backgroundColor: Colors.primary,
    },
    roleText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    editButton: {
        backgroundColor: Colors.primary,
        padding: 8,
        borderRadius: 6,
        flex: 1,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#e53935',
        padding: 8,
        borderRadius: 6,
        flex: 1,
        marginLeft: 5,
    },
    editButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    deleteButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop:10,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 6,
        flex: 1,
        marginRight: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        flex: 1,
        marginLeft: 5,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
});
