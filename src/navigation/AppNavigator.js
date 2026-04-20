import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../utils/theme';

import HomeScreen from '../screens/HomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import PetsScreen from '../screens/PetsScreen';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Home:    { icon: 'home',         iconActive: 'home',          label: '首页' },
  Records: { icon: 'heart-outline', iconActive: 'heart',         label: '健康' },
  Pets:    { icon: 'paw-outline',  iconActive: 'paw',           label: '宠物' },
};

function TabIcon({ name, focused }) {
  const cfg = TAB_CONFIG[name];
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? cfg.iconActive : cfg.icon}
        size={22}
        color={focused ? Colors.accent : Colors.textMuted}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {cfg.label}
      </Text>
    </View>
  );
}

export default function AppNavigator({ petBookData }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home">
          {() => <HomeScreen petBookData={petBookData} />}
        </Tab.Screen>
        <Tab.Screen name="Records">
          {() => <RecordsScreen petBookData={petBookData} />}
        </Tab.Screen>
        <Tab.Screen name="Pets">
          {() => <PetsScreen petBookData={petBookData} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    ...Fonts.medium,
  },
  tabLabelFocused: {
    color: Colors.accent,
    ...Fonts.semiBold,
  },
});
