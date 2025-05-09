import CustomTabBar from '@/components/CustomTabBar';
import { supabase } from '@/lib/supabase';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
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
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!userRole) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        headerShown: false, // Apply headerShown: false globally to hide the default header
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {userRole === 'admin' ? (
        <>
          <Tabs.Screen
            name="adminDashboard"
            options={{
              title: 'Dashboard',
            }}
          />
          <Tabs.Screen
            name="manageRequests"
            options={{
              title: 'Requests',
            }}
          />
          <Tabs.Screen
            name="manageCenters"
            options={{
              title: 'Centers',
            }}
          />
          <Tabs.Screen
            name="manageUsers"
            options={{
              title: 'Users',
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
            }}
          />
          <Tabs.Screen
            name="book"
            options={{
              title: 'Book',
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
            }}
          />
        </>
      )}
    </Tabs>
  );
}
