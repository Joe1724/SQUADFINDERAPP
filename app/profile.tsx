import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import api from '../src/config/api';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUserId = params.id;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // <--- New State for Edit Mode

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [rank, setRank] = useState("");
  const [role, setRole] = useState("");
  const [gameName, setGameName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/get_profile.php?user_id=${currentUserId}`);
      if (response.data.status === 200) {
        const data = response.data.data;
        setUsername(data.username);
        setEmail(data.email);
        setBio(data.bio);
        setRank(data.rank_tier);
        setRole(data.role);
        setGameName(data.game_name);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.post('/update_profile.php', {
        user_id: currentUserId,
        bio: bio,
        rank_tier: rank,
        role: role
      });

      if (response.data.status === 200) {
        Alert.alert("Success", "Profile updated!");
        setIsEditing(false); // Turn off edit mode
      } else {
        Alert.alert("Error", "Could not update profile.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{flex: 1}}
    >
      <ScrollView style={styles.container}>
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
                  <Text style={styles.avatarText}>{username?.[0]}</Text>
               </View>
               <Text style={styles.username}>{username}</Text>
               <Text style={styles.email}>{email}</Text>
          </View>

          {/* Stats Card (Editable) */}
          <View style={styles.statsCard}>
              <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Game</Text>
                  <Text style={styles.statValue}>{gameName}</Text>
              </View>

              <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Rank</Text>
                  {isEditing ? (
                    <TextInput 
                      style={styles.inputSmall} 
                      value={rank} 
                      onChangeText={setRank} 
                      placeholder="Rank"
                    />
                  ) : (
                    <Text style={styles.statValue}>{rank}</Text>
                  )}
              </View>

              <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Role</Text>
                  {isEditing ? (
                    <TextInput 
                      style={styles.inputSmall} 
                      value={role} 
                      onChangeText={setRole} 
                      placeholder="Role"
                    />
                  ) : (
                    <Text style={styles.statValue}>{role}</Text>
                  )}
              </View>
          </View>

          {/* Bio Section (Editable) */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.inputBio} 
                  value={bio} 
                  onChangeText={setBio} 
                  multiline 
                  placeholder="Write something about yourself..."
                />
              ) : (
                <Text style={styles.bioText}>"{bio || "No bio yet."}"</Text>
              )}
          </View>

          {/* Action Buttons */}
          {isEditing ? (
             <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.btnText}>Save Changes</Text>
             </TouchableOpacity>
          ) : (
             <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Text style={styles.editText}>Edit Profile</Text>
             </TouchableOpacity>
          )}

          {!isEditing && (
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between', marginBottom: 30, elevation: 2 
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', textAlign: 'center' },

  inputSmall: { 
    borderBottomWidth: 1, borderBottomColor: '#007AFF', width: '80%', 
    textAlign: 'center', fontSize: 16, padding: 2 
  },
  inputBio: {
    backgroundColor: '#fff', borderRadius: 10, padding: 15, height: 100,
    textAlignVertical: 'top', fontSize: 16, color: '#333'
  },

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#444' },
  bioText: { fontSize: 16, color: '#666', fontStyle: 'italic', lineHeight: 24 },

  editBtn: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#007AFF', 
    padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 
  },
  editText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },

  saveBtn: { 
    backgroundColor: '#007AFF', padding: 15, borderRadius: 12, 
    alignItems: 'center', marginBottom: 15 
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  logoutBtn: { 
    backgroundColor: '#ff4d4d', padding: 15, borderRadius: 12, alignItems: 'center' 
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});