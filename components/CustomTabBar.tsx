// components/CustomTabBar.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;

        const isFocused = state.index === index;

        const iconName = options.tabBarIconName || 'circle';

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
            accessibilityRole="button"
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', padding: 10 }}
          >
            <FontAwesome name={iconName} size={24} color={isFocused ? 'blue' : 'gray'} />
            <Text style={{ color: isFocused ? 'blue' : 'gray', fontSize: 12 }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
