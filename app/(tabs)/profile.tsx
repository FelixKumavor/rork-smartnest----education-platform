import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight 
} from 'lucide-react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: Settings, title: 'Account Settings', subtitle: 'Manage your account' },
    { icon: Bell, title: 'Notifications', subtitle: 'Push notifications, email' },
    { icon: CreditCard, title: 'Payment Methods', subtitle: 'Manage payment options' },
    { icon: HelpCircle, title: 'Help & Support', subtitle: 'Get help when you need it' },
    { icon: LogOut, title: 'Sign Out', subtitle: '', danger: true },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 40 }]}
      >
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@email.com</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[
                styles.iconContainer,
                item.danger && styles.iconContainerDanger
              ]}>
                <item.icon 
                  size={20} 
                  color={item.danger ? '#FF3B30' : '#007AFF'} 
                />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[
                  styles.menuItemTitle,
                  item.danger && styles.menuItemTitleDanger
                ]}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
            </View>
            <ChevronRight size={20} color="#C7C7CC" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 1,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerDanger: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuItemTitleDanger: {
    color: '#FF3B30',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});