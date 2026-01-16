import { useRouter } from 'expo-router'; // <--- 1. ADD THIS IMPORT
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../src/config/api';

export default function LoginScreen() {
  const router = useRouter(); // <--- 2. ADD THIS LINE
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/login.php', {
        email: email,
        password: password
      });

      console.log("API Response:", response.data);

     if (response.data.status === 200) {
   const realId = response.data.user.id;
   router.replace({ pathname: '/feed', params: { id: realId } });
}

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Could not connect. Check your IP/Network.');
    } finally {
      setLoading(false);
    }
  };

  // ... (The rest of your Return/Styles code stays exactly the same)
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🎮</Text>
        <Text style={styles.title}>SQUADFINDER</Text>
        <Text style={styles.subtitle}>Find Your Perfect Teammate</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#6b7280"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#6b7280"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "CONNECTING..." : "START PLAYING"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    fontSize: 70,
    marginBottom: 15,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#1a1f2e',
    borderRadius: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#252b3b',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});