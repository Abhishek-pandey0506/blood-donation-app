import BecomeDonorModal from '@/components/DonorForm';
import TopHeader from '@/components/TopHeader';
import images from '@/src/_utils/images'; // Ensure image1, image2, image3 are valid URIs
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function Tab() {
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const carouselImages = [
    { id: 1, uri: images.splash },
    { id: 6, uri: images.image1 },
    { id: 2, uri: images.image2 },
    { id: 3, uri: images.image3 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <TopHeader />
      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.header}>
          <View style={styles.stepsCard}>
            <Text style={styles.stepsText}>You can become a Blood Donor in</Text>
            <Text style={styles.stepsNumber}>few Easy steps</Text>
            <TouchableOpacity onPress={()=> setModalVisible(true)}>
            <Text style={styles.linkText}>Become a Donor Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={{ height: 190, marginBottom: 20 }}>
          <FlatList
            data={carouselImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 5, }}
            renderItem={({ item }) => (
              <View style={[styles.Slidercard, { width: width - 42 }]}>
                {/* <Image source={{ uri: item.uri }} style={styles.slideImage} /> */}
                <Image
                  source={item.uri}
                  resizeMode='contain'
                  style={[styles.slideImage,]}
                />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <View style={styles.pagination}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons (2 in a row) */}
        <View style={styles.actions}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.replace("/Donor")}>
              <Text style={styles.textIcon}>🔍</Text>
              {/* <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.actionIcon} /> */}
              <Text>Find Donors</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.textIcon}>🩸</Text>
              {/* <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.actionIcon} /> */}
              <Text>Donate Blood</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.textIcon}>📦</Text>
              {/* <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.actionIcon} /> */}
              <Text>Order Blood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.textIcon}>📅</Text>
              {/* <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.actionIcon} /> */}
              <Text>Schedule</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.replace("/BloodGroup")}>
              <Text style={styles.textIcon}>🧬</Text>
              {/* <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.actionIcon} /> */}
              <Text>Blood Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.replace("/DonationCenter")}>
              <Text style={styles.textIcon}>🏥</Text>
              {/* <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.actionIcon} /> */}
              <Text>Donation Center</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FlatList Swiper Slider */}


        {/* Pagination Dots */}


        {/* Featured Events (Full width & scrollable) */}
        <Text style={styles.sectionTitle}>Featured Events</Text>
        <ScrollView showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
          <View style={[styles.Slidercard2]}>
            <Image
              source={carouselImages[0].uri}
              resizeMode='contain'
              style={[styles.slideImage,]}
            />
            <View style={styles.textContainer}>
              <Text style={styles.eventTitle}>World Heart Day 2021</Text>
            </View>
          </View>
          <View style={[styles.Slidercard2]}>
            <Image
              source={carouselImages[1].uri}
              resizeMode='contain'
              style={[styles.slideImage,]}
            />
            <View style={styles.textContainer}>
              <Text style={styles.eventTitle}>World Blood Day 2021</Text>
            </View>
          </View>

          <View style={[styles.Slidercard2]}>
            <Image
              source={carouselImages[2].uri}
              resizeMode='contain'
              style={[styles.slideImage,]}
            />
            <View style={styles.textContainer}>
              <Text style={styles.eventTitle}>Blood Donation Awareness</Text>
            </View>
          </View>
          <View style={[styles.Slidercard2]}>
            <Image
              source={carouselImages[3].uri}
              resizeMode='contain'
              style={[styles.slideImage,]}
            />
            <View style={styles.textContainer}>
              <Text style={styles.eventTitle}>Emergency Blood Drive</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <BecomeDonorModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onSuccess={() => {
    // Optionally refetch donors or show a toast
  }}
/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepsCard: {
    backgroundColor: '#FDE2E4',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsText: {
    fontSize: 14,
  },
  stepsNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textIcon: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  linkText: {
    color: '#E53935',
    marginTop: 5,
  },
  actions: {
    marginVertical: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FFE5EC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  Slidercard: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1', // Fallback color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    padding: 5,
    paddingHorizontal: 5,
  },
  Slidercard2: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginVertical: 5
  },
  slideImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  textContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f1f1f1',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#E53935',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  eventsScroll: {
    margin: 10,
    // marginVertical: 10,
    // paddingHorizontal: 10,
  },
  eventCard: {
    // Full width minus padding
    // marginRight: 10,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  // eventTitle: {
  //   marginTop: 10,
  //   fontSize: 16,
  //   fontWeight: '600',
  //   textAlign: 'center',
  // },
});
