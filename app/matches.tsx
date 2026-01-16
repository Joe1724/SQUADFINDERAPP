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
  container: { flex: 1, backgroundColor: '#0f1419', paddingTop: 50 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 25, 
    alignItems: 'center',
    paddingBottom: 15,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#fff',
    letterSpacing: 1,
  },
  backBtn: { padding: 10 },
  backText: { color: '#8b5cf6', fontSize: 16, fontWeight: '700' },
  item: { 
    flexDirection: 'row', 
    padding: 18, 
    marginHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#252b3b',
    alignItems: 'center',
  },
  avatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#8b5cf6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  details: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
  chatBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 18, 
    backgroundColor: '#8b5cf6', 
    borderRadius: 20,
  },
  chatText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  empty: { 
    textAlign: 'center', 
    marginTop: 100, 
    color: '#6b7280', 
    fontSize: 16,
    fontWeight: '600',
  }
});