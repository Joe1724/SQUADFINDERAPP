import { Picker } from '@react-native-picker/picker'; // <--- NEW IMPORT
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../src/config/api';

interface User {
  id: number;
  username: string;
  rank_tier: string;
  role: string;
  game_name: string;
  bio: string;
}

interface Game {
  id: number; // Note: IDs from PHP might come as strings, but we can cast them
  name: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const currentUserId = params.id ? Number(params.id) : 1; 

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // <--- NEW STATES FOR FILTERING --->
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number>(0);

  useEffect(() => {
    fetchGames();
    fetchFeed(0); // Load "All Games" initially
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get('/get_games.php');
      if (response.data.status === 200) {
        setGames(response.data.games);
      }
    } catch (error) {
      console.error("Game fetch error", error);
    }
  };

  const fetchFeed = async (gameId: number) => {
    setLoading(true);
    try {
      console.log(`Fetching feed for User ID: ${currentUserId}, Game ID: ${gameId}`); 
      // Pass the game_id param here
      const response = await api.get(`/feed.php?user_id=${currentUserId}&game_id=${gameId}`);
      
      if (response.data.status === 200 && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setCurrentIndex(0); // Reset stack when filter changes
      } else {
        setUsers([]); 
      }

    } catch (error) {
      console.error("API Error:", error);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleGameChange = (itemValue: number) => {
      setSelectedGame(itemValue);
      fetchFeed(itemValue); // Reload feed immediately
  };

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (!users || currentIndex >= users.length) return;

    const targetUser = users[currentIndex];
    setCurrentIndex(prev => prev + 1);

    try {
      await api.post('/swipe.php', {
        swiper_id: currentUserId,
        target_id: targetUser.id,
        action: direction
      });

      if (direction === 'like') {
         // Check match logic (simplified for speed)
         // You can add the match alert check here if needed
      }
    } catch (error) {
      console.error("Swipe Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (!users || currentIndex >= users.length) {
       return (
        <View style={styles.centerMessage}>
            <Text style={styles.noMoreText}>No more players found!</Text>
            <Text style={{color: '#888'}}>Try changing the filter.</Text>
        </View>
       );
    }

    const currentUser = users[currentIndex];
    return (
      <>
        <View style={styles.card}>
            <View style={styles.imagePlaceholder}>
                <Text style={styles.avatarText}>
                    {currentUser.username ? currentUser.username[0] : "?"}
                </Text>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.username}>{currentUser.username}</Text>
                <Text style={styles.details}>{currentUser.game_name} • {currentUser.rank_tier}</Text>
                <Text style={styles.role}>{currentUser.role}</Text>
                <Text style={styles.bio}>"{currentUser.bio}"</Text>
            </View>
        </View>

        <View style={styles.buttonsContainer}>
            <TouchableOpacity 
                style={[styles.actionButton, styles.passButton]} 
                onPress={() => handleSwipe('pass')}
            >
                <Text style={styles.actionText}>PASS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionButton, styles.likeButton]} 
                onPress={() => handleSwipe('like')}
            >
                <Text style={styles.actionText}>SQUAD UP</Text>
            </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/profile', params: { id: currentUserId } })}
          style={styles.profileBtn}
        >
          <Text style={styles.btnIcon}>👤</Text>
        </TouchableOpacity>

        {/* <--- NEW DROPDOWN ---> */}
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedGame}
                onValueChange={handleGameChange}
                style={styles.picker}
                mode="dropdown"
            >
                {games.map((game) => (
                    <Picker.Item 
                        key={game.id} 
                        label={game.name} 
                        value={game.id} 
                        style={{fontSize: 14}}
                    />
                ))}
            </Picker>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/matches', params: { id: currentUserId } })}
          style={styles.matchesBtn}
        >
          <Text style={styles.matchesText}>💬</Text>
        </TouchableOpacity>
      </View>
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    paddingTop: 50,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    zIndex: 10,
  },
  profileBtn: {
    padding: 10,
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
  },
  btnIcon: { fontSize: 18 },
  matchesBtn: {
    padding: 10,
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
  },
  matchesText: { fontSize: 18 },
  
  // Picker Styles
  pickerContainer: {
      flex: 1, // Take up remaining space
      marginHorizontal: 10,
      backgroundColor: '#fff',
      borderRadius: 15,
      height: 40,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ddd'
  },
  picker: {
      width: '100%',
      height: 40,
  },

  // Card Styles
  card: {
    width: '90%',
    height: '60%',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, 
    alignItems: 'center',
    padding: 20,
    marginTop: 10
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#555' },
  cardInfo: { alignItems: 'center' },
  username: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  details: { fontSize: 18, color: '#666', marginBottom: 10 },
  role: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginBottom: 20 },
  bio: { fontSize: 16, color: '#444', fontStyle: 'italic', textAlign: 'center' },
  
  buttonsContainer: {
    flexDirection: 'row', marginTop: 30, width: '80%', justifyContent: 'space-between',
  },
  actionButton: {
    width: 120, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center',
  },
  passButton: { backgroundColor: '#ff4d4d' },
  likeButton: { backgroundColor: '#4cd137' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  centerMessage: { alignItems: 'center', marginTop: 100 },
  noMoreText: { fontSize: 20, marginBottom: 10, fontWeight: 'bold' },
});