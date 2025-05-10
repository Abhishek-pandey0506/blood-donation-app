import Colors from '@/src/_utils/colors';
import images from '@/src/_utils/images';
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { supabase } from '@/lib/supabase'; // Adjust this import if needed

export default function Index() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();

    const checkLoginStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/Login');
      }
    };

    const timer = setTimeout(checkLoginStatus, 3000);

    return () => {
      clearTimeout(timer);
      bounceAnimation.stop();
    };
  }, [router, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={images.splash}
        resizeMode="contain"
        style={[styles.image, { transform: [{ scale: scaleAnim }] }]}
      />
      <ActivityIndicator size="large" color="#fff" style={styles.loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  image: {
    height: 300,
    width: '100%',
  },
  loading: {
    marginTop: 20,
  },
});
