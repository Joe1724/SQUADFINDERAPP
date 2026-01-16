import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../src/config/api';

interface User {
  id: number;
  username: string;
  rank_tier: string;
  role: string;
  game_name: string;
  bio: string;
  avatar: string | null;
}

interface Game {
  id: number;
  name: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const currentUserId = params.id ? Number(params.id) : 1; 

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number>(0);

  useEffect(() => {
    fetchGames();
    fetchFeed(0); 
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
      const response = await api.get(`/feed.php?user_id=${currentUserId}&game_id=${gameId}`);
      if (response.data.status === 200 && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setCurrentIndex(0); 
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
      fetchFeed(itemValue); 
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
    } catch (error) {
      console.error("Swipe Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00d2d3" />
      </View>
    );
  }

  const renderContent = () => {
    if (!users || currentIndex >= users.length) {
       return (
        <View style={styles.centerMessage}>
            <Text style={styles.noMoreEmoji}>👾</Text>
            <Text style={styles.noMoreText}>Mission Complete</Text>
            <Text style={styles.noMoreSub}>No more players in this area.</Text>
        </View>
       );
    }

    const currentUser = users[currentIndex];
    return (
      <>
        {/* MAIN CARD - FLAT DARK MODE */}
        <View style={styles.card}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
                {currentUser.avatar ? (
                    <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.avatarText}>
                            {currentUser.username ? currentUser.username[0] : "?"}
                        </Text>
                    </View>
                )}
            </View>

            {/* User Info */}
            <View style={styles.cardInfo}>
                <Text style={styles.username}>{currentUser.username}</Text>
                <Text style={styles.gameName}>{currentUser.game_name}</Text>

                {/* Badges Row */}
                <View style={styles.badgesContainer}>
                    <View style={[styles.badge, {borderColor: '#f1c40f'}]}>
                        <Text style={[styles.badgeText, {color: '#f1c40f'}]}>🏆 {currentUser.rank_tier}</Text>
                    </View>
                    <View style={[styles.badge, {borderColor: '#00d2d3'}]}>
                        <Text style={[styles.badgeText, {color: '#00d2d3'}]}>⚔️ {currentUser.role}</Text>
                    </View>
                </View>

                <View style={styles.bioContainer}>
                    <Text style={styles.bio}>"{currentUser.bio || "No bio yet."}"</Text>
                </View>
            </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={() => handleSwipe('pass')} style={styles.btnWrapper}>
                <View style={[styles.actionButton, styles.passButton]}>
                    <Text style={styles.actionIcon}>✖</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSwipe('like')} style={styles.btnWrapper}>
                <View style={[styles.actionButton, styles.likeButton]}>
                    <Text style={styles.actionIcon}>⚡</Text>
                </View>
            </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER - FLAT DARK MODE */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/profile', params: { id: currentUserId } })}
          style={styles.iconBtn}
        >
          <Text style={styles.btnIcon}>👤</Text>
        </TouchableOpacity>

        {/* Custom Picker Wrapper */}
        <View style={styles.pickerWrapper}>
            <Picker
                selectedValue={selectedGame}
                onValueChange={handleGameChange}
                style={styles.picker}
                mode="dropdown"
                dropdownIconColor="#00d2d3"
                itemStyle={{ color: '#fff' }} 
            >
                {games.map((game) => (
                    <Picker.Item 
                        key={game.id} 
                        label={game.name} 
                        value={game.id} 
                        style={{ color: '#000' }} 
                    />
                ))}
            </Picker>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/matches', params: { id: currentUserId } })}
          style={styles.iconBtn}
        >
          <Text style={styles.btnIcon}>💬</Text>
        </TouchableOpacity>
      </View>
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    alignItems: 'center',
    paddingTop: 50,
  },
  
  // Header
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  iconBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#1a1f2e',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#252b3b',
  },
  btnIcon: { fontSize: 20 },

  pickerWrapper: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: '#1a1f2e',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#252b3b',
  },
  picker: { width: '100%', height: 48, color: '#fff' },

  // Card
  card: {
    width: '90%',
    height: '64%',
    backgroundColor: '#1a1f2e',
    borderRadius: 30,
    alignItems: 'center',
    padding: 30,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#252b3b',
    elevation: 8,
  },
  
  // Avatar
  avatarContainer: {
    marginBottom: 25,
    marginTop: 15,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderWidth: 5,
    borderColor: '#a78bfa',
  },
  avatarImage: { 
    width: 150,
    height: 150,
    borderRadius: 75, 
    borderWidth: 5,
    borderColor: '#8b5cf6',
  },
  avatarText: { fontSize: 60, fontWeight: 'bold', color: '#fff' },

  // Info
  cardInfo: { alignItems: 'center', width: '100%' },
  username: { 
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
  },
  gameName: { 
    fontSize: 12,
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 22,
  },

  // Badges
  badgesContainer: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  badge: { 
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20, 
    backgroundColor: '#252b3b',
    borderWidth: 2,
  },
  badgeText: { fontWeight: '700', fontSize: 13 },

  // Bio
  bioContainer: { 
    backgroundColor: '#252b3b',
    width: '100%',
    padding: 18,
    borderRadius: 16, 
    minHeight: 90,
    justifyContent: 'center',
  },
  bio: { 
    fontSize: 15,
    color: '#d1d5db',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Action Buttons
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  btnWrapper: {
    elevation: 8,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: { 
    backgroundColor: '#ef4444',
  }, 
  likeButton: { 
    backgroundColor: '#8b5cf6',
  },
  
  actionIcon: { fontSize: 30, color: '#fff' }, 

  centerMessage: { alignItems: 'center', marginTop: 150 },
  noMoreEmoji: { fontSize: 70, marginBottom: 15 },
  noMoreText: { 
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  noMoreSub: { color: '#6b7280', fontSize: 15 },
});