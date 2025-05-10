import TopHeader from '@/components/TopHeader';
import { supabase } from '@/lib/supabase';
import Colors from '@/src/_utils/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    centers: 0,
    donations: 0,
    requests: 0,
    stock: [],
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null); // To handle user role
  const router = useRouter();
const { width } = useWindowDimensions();
  const isSmallScreen = width >= 640;
  useEffect(() => {
    const fetchUserRoleAndStats = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data?.role) {
          setUserRole(data.role);
        }
      }

      // Fetch the stats based on the user's role
      const [{ count: centers }, { count: donations }, { count: requests }, { data: stock }] = await Promise.all([
        supabase.from('donation_centers').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('*', { count: 'exact', head: true }),
        supabase.from('blood_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('center_blood_stock')
          .select('units_available, blood_groups(type), donation_centers(name)')
          .limit(10),
      ]);

      setStats({ centers, donations, requests, stock });
      setLoading(false);
    };

    fetchUserRoleAndStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TopHeader  />
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <View style={{ padding: 20, width: isSmallScreen ? '40%' : '100%'}}>
      <Text style={styles.title}>{userRole === 'admin' ? 'Admin Dashboard' : 'Donor Dashboard'}</Text>

      {/* Show stats for Admin */}
          {(userRole === 'admin' || userRole === 'staff')? (
        <>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Donation Centers</Text>
            <Text style={styles.statValue}>{stats.centers}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Donations</Text>
            <Text style={styles.statValue}>{stats.donations}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Requests</Text>
            <Text style={styles.statValue}>{stats.requests}</Text>
          </View>

          <Text style={styles.sectionTitle}>Recent Blood Stock</Text>
          {stats.stock.length === 0 ? (
            <Text style={styles.noData}>No stock data found.</Text>
          ) : (
            stats.stock.map((item, index) => (
              <View key={index} style={styles.stockCard}>
                <Text style={styles.stockText}>
                  {item.blood_groups?.type} – {item.units_available} ml at {item.donation_centers?.name}
                </Text>
              </View>
            ))
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/ManageRequests')}>
              <Text style={styles.buttonText}>Manage Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/ManageDonations')}>
              <Text style={styles.buttonText}>Manage Donations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/CentersScreen')}>
              <Text style={styles.buttonText}>Manage Centers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/ManageAppointments')}>
              <Text style={styles.buttonText}>Manage Appointments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={() => router.push('/BloodGroup')}>
              <Text style={styles.buttonText}>Manage Blood</Text>
            </TouchableOpacity>
                {userRole === 'admin' && (
            <TouchableOpacity style={styles.button} onPress={() => router.push('/ManageUsers')}>
              <Text style={styles.buttonText}>Manage Users</Text>
            </TouchableOpacity>
                )}
          </View>
        </>
      ) : (
        // Show stats for Donor
        <>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Upcoming Donations</Text>
            <Text style={styles.statValue}>{stats.donations}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Requests</Text>
            <Text style={styles.statValue}>{stats.requests}</Text>
          </View>

          <Text style={styles.sectionTitle}>Recent Blood Stock</Text>
          {stats.stock.length === 0 ? (
            <Text style={styles.noData}>No stock data found.</Text>
          ) : (
            stats.stock.map((item, index) => (
              <View key={index} style={styles.stockCard}>
                <Text style={styles.stockText}>
                  {item.blood_groups?.type} – {item.units_available} ml at {item.donation_centers?.name}
                </Text>
              </View>
            ))
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/BookAppointment')}>
              <Text style={styles.buttonText}>Book Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/DonationHistory')}>
              <Text style={styles.buttonText}>Donation History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/CentersScreen')}>
              <Text style={styles.buttonText}>Nearby Centers</Text>
            </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => router.push('/RequestBlood')}>
              <Text style={styles.buttonText}>Request Blood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/Profile')}>
              <Text style={styles.buttonText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' , paddingBottom: 50,},
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, color:Colors.primary },
  statBox: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  statLabel: { fontSize: 16, color: '#666' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 30, marginBottom: 10, },
  noData: { color: '#999', fontSize: 14 },
  stockCard: {
    backgroundColor: '#EFEFEF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  stockText: { fontSize: 15, fontWeight: '500' },
  actions: { marginTop: 30 },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
});
