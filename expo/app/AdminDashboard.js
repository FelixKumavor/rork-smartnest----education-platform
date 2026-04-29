import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_BASE } from '../config';

const ADMIN_TOKEN = 'REPLACE_WITH_ADMIN_JWT';

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/all`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setProperties(result.data);
      } else {
        Alert.alert('Error', result.message || 'Unable to load properties');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load admin listings');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setBusyId(id);
    try {
      const response = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (result.success) {
        loadProperties();
      } else {
        Alert.alert('Error', result.message || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProperty(id) {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to permanently delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusyId(id);
            try {
              const response = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${ADMIN_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              });
              const result = await response.json();
              if (result.success) {
                loadProperties();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete property');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to delete property');
            } finally {
              setBusyId(null);
            }
          }
        }
      ]
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>Status: {item.status}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.meta}>Price: {item.price}</Text>
      <Text style={styles.meta}>Type: {item.roomType}</Text>
      <Text style={styles.meta}>Posted by: {item.postedBy?.fullName || 'Unknown'}</Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.approveButton]}
          onPress={() => updateStatus(item._id, 'approved')}
          disabled={busyId === item._id}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.blockButton]}
          onPress={() => updateStatus(item._id, 'blocked')}
          disabled={busyId === item._id}
        >
          <Text style={styles.buttonText}>Block</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteProperty(item._id)}
          disabled={busyId === item._id}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Control Center</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#5a67d8" />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No properties found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#4a5568'
  },
  description: {
    color: '#4a5568',
    marginBottom: 8,
  },
  meta: {
    color: '#718096',
    fontSize: 13,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#48bb78',
  },
  blockButton: {
    backgroundColor: '#f6ad55',
  },
  deleteButton: {
    backgroundColor: '#f56565',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 32,
  },
});
