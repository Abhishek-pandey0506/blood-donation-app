import Colors from '@/src/_utils/colors';
import images from '@/src/_utils/images';
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { useSelector } from 'react-redux';

export default function Index() {
  const router = useRouter();
  const user = useSelector((state)=> state.auth.user) 
  // Animated value for scaling the image
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Create a bounce/zoom animation sequence:
    // 1. Spring to a slightly larger size.
    // 2. Timing animation to shrink a bit.
    // 3. Timing animation to grow back.
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
        })
      ])
    );

    bounceAnimation.start();

    const timer = setTimeout(() => {
      // Navigate to the next screen after 3 seconds
      if(user && user.isLoggedIn){
        router.replace('/(tabs)');
      }else{
        router.replace('/StepPage');
      }
    }, 3000);

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
