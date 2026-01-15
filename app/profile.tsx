import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../src/config/api';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUserId = params.id;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/get_profile.php?user_id=${currentUserId}`);
      if (response.data.status === 200) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Navigate back to Login and clear history so user can't go back
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
             <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile?.username?.[0]}</Text>
             </View>
             <Text style={styles.username}>{profile?.username}</Text>
             <Text style={styles.email}>{profile?.email}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Game</Text>
                <Text style={styles.statValue}>{profile?.game_name}</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Rank</Text>
                <Text style={styles.statValue}>{profile?.rank_tier}</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Role</Text>
                <Text style={styles.statValue}>{profile?.role}</Text>
            </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>"{profile?.bio || "No bio yet."}"</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  closeText: { color: '#007AFF', fontSize: 16 },
  
  content: { padding: 20 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#ddd', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#555' },
  username: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 16, color: '#888' },

  statsCard: { 
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 20, 
    justifyContent: 'space-between', marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 
  },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#444' },
  bioText: { fontSize: 16, color: '#666', fontStyle: 'italic', lineHeight: 24 },

  logoutBtn: { 
    backgroundColor: '#ff4d4d', padding: 15, borderRadius: 12, alignItems: 'center' 
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});