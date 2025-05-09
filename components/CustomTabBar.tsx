import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const getIconName = (routeName: string) => {
  switch (routeName) {
    case 'index':
      return 'home';
    case 'CentersScreen':
      return 'hospital-o';
    case 'NotificationsScreen':
      return 'bell';
    case 'Profile':
      return 'user';
    default:
      return 'circle';
  }
};

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        console.log(route.name)
        const iconName = getIconName(route.name);
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };


        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tabButton, isFocused ? styles.activeTab: {}]}
          >
            <FontAwesome name={iconName} size={22} color={isFocused ? '#fff' : '#999'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    height: 50,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  activeTab:{
    backgroundColor: '#ff0000',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    height: 40,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  centerButton: {
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00C6AE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  centerIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
