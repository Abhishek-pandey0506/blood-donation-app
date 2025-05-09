import Colors from '@/src/_utils/colors';
import images from '@/src/_utils/images';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

const TopHeader = ({ isBack = false, title = '', subtitle = '' }) => {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);

    const handleBackPress = () => {
        router.push('/(tabs)'); // Correct method for going back in expo-router
    };

    return (
        <View style={styles.header}>
            <View style={styles.leftContainer}>
                {isBack ? (
                    <>
                        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{title}</Text>
                            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                        </View>
                    </>
                ) : (
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{user?.name || 'Guest User'}</Text>
                        <Text style={styles.subtitle}>{user?.email || 'guest@example.com'}</Text>
                    </View>
                )}
            </View>

            <View style={styles.logoContainer}>
                <Image source={images.splash} resizeMode="contain" style={styles.logo} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomEndRadius: 20,
        borderBottomStartRadius: 20,
        backgroundColor: Colors.primary,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    textContainer: {
        flexShrink: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#fff',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 5,
    },
    logo: {
        width: 50,
        height: 50,
    },
});

export default TopHeader;
