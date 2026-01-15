import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../src/config/api';

interface User {
  id: number;
  username: string;
  rank_tier: string;
  role: string;
  game_name: string;
  bio: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const currentUserId = params.id ? Number(params.id) : 1; 

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); 

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      console.log("Fetching feed for User ID:", currentUserId); 
      const response = await api.get(`/feed.php?user_id=${currentUserId}`);
      
      if (response.data.status === 200 && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]); 
      }

    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Could not fetch players.");
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (!users || currentIndex >= users.length) return;

    const targetUser = users[currentIndex];
    setCurrentIndex(prev => prev + 1);

    try {
      console.log(`Sending swipe: Me(${currentUserId}) -> ${direction} -> ${targetUser.username}`);

      const response = await api.post('/swipe.php', {
        swiper_id: currentUserId,
        target_id: targetUser.id,
        action: direction
      });

      console.log("Swipe API Response:", response.data);

      if (response.data.is_match === true) {
        Alert.alert(
          "IT'S A MATCH! 🎉", 
          `You and ${targetUser.username} both want to squad up!`,
          [{ text: "Let's Go!", onPress: () => console.log("Match acknowledged") }]
        );
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

  if (!users || currentIndex >= users.length) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
            <Text style={styles.header}>SquadFinder</Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/matches', params: { id: currentUserId } })}
              style={styles.matchesBtn}
            >
              <Text style={styles.matchesText}>💬 Squads</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.centerMessage}>
            <Text style={styles.noMoreText}>No more players in your area!</Text>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.logoutBtn}>
            <Text style={styles.btnText}>Logout</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <View style={styles.container}>
      {/* <--- NEW HEADER WITH BUTTON ---> */}
      <View style={styles.topBar}>
        <Text style={styles.header}>SquadFinder</Text>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/matches', params: { id: currentUserId } })}
          style={styles.matchesBtn}
        >
          <Text style={styles.matchesText}>💬 Squads</Text>
        </TouchableOpacity>
      </View>
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    paddingTop: 60,
  },
  // <--- NEW STYLES START --->
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  matchesBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
  },
  matchesText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  // <--- NEW STYLES END --->
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
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
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#555',
  },
  cardInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  details: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  role: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 20,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    width: '80%',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 120,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#ff4d4d',
  },
  likeButton: {
    backgroundColor: '#4cd137',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerMessage: {
    alignItems: 'center',
    marginTop: 100,
  },
  noMoreText: {
    fontSize: 20,
    marginBottom: 20,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5
  },
  btnText: { color: '#fff' }
});