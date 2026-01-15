import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../src/config/api';

interface Match {
  match_id: number;
  user_id: number;
  username: string;
  game_name: string;
  rank_tier: string;
  role: string;
}

export default function MatchesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUserId = params.id;

  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/get_matches.php?user_id=${currentUserId}`);
      if (response.data.status === 200) {
        setMatches(response.data.matches);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Squad</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.match_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            // <--- THIS IS THE MISSING PIECE! --->
            onPress={() => router.push({
              pathname: '/chat',
              params: { 
                sender_id: currentUserId, 
                receiver_id: item.user_id, 
                username: item.username 
              }
            })}
          >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username ? item.username[0] : "?"}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.details}>{item.game_name} • {item.rank_tier}</Text>
            </View>
            <View style={styles.chatBtn}>
                <Text style={styles.chatText}>Chat</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No matches yet. Keep swiping!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 30, fontWeight: 'bold' },
  backBtn: { padding: 10 },
  backText: { color: '#007AFF', fontSize: 16 },
  item: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#555' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { color: '#888' },
  chatBtn: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#007AFF', borderRadius: 20 },
  chatText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 }
});