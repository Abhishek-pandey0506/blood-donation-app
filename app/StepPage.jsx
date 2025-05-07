import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Colors from '../src/_utils/colors';
import images from '../src/_utils/images';

const StepData = [
  {
    id: 1,
    title: 'Donate Blood',
    description:
      'Provide a lots of program entertainment with service best in the world ',
    image: images.image1,
  },
  {
    id: 2,
    title: 'Search Blood Donation',
    description: 'Search Blood Donadion so easier and safer than ever.',
    image: images.image2,
  },
  {
    id: 3,
    title: ' Explore Update around you ',
    description: 'Find request and blood donation so eaty arourid you ',
    image: images.image3,
  },
];

const StepPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const router = useRouter();
  
  const handleSkip = () => {
        router.replace("/Signup")
  };

  const handleNext = () => {
    if (currentStep < StepData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
         router.replace("/Signup")
    }
  };

  const handleDotPress = index => {
    setCurrentStep(index);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={StepData[currentStep].image}
          style={styles.bottomImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.heading}>{StepData[currentStep].title}</Text>
      <Text style={styles.bodyText}>{StepData[currentStep].description}</Text>

      <View style={styles.boxInnerContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text onPress={handleSkip} style={styles.skipButton}>
            Skip
          </Text>
          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              {StepData.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    currentStep === index && styles.activeDot,
                  ]}
                  onPress={() => handleDotPress(index)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {currentStep === StepData.length - 1 ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default StepPage;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background
    },
    boxInnerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    skipButton: {
      padding: 20,
      color: Colors.secondary,
      fontSize: 16,
      fontWeight: '700',
    },
    heading: {
      fontSize: 28,
      fontWeight: 800,
      textAlign: 'center',
      color: Colors.text,
    },
    bodyText: {
      padding: 15,
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.mediumDark,
      textAlign: 'center',
    },
    stepContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 8,
      backgroundColor: Colors.softPink,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: Colors.primary,
      width: 14,
      height: 14,
      borderRadius: 10,
    },
    imageContainer: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 10,
      marginHorizontal: 10,
      marginBottom: 20,

    },
    bottomImage: {
      width: '100%',
      height: 400,
    },
    nextButton: {
      padding: 20,
    },
    nextButtonText: {
      color: Colors.secondary,
      fontSize: 16,
      fontWeight: '800',
    },
  });
