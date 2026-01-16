import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView, Platform, SafeAreaView,
    StyleSheet, Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import api from '../src/config/api';

interface Message {
  id: number;
  sender_id: number;
  message_text: string;
  created_at: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const myId = Number(params.sender_id);
  const theirId = Number(params.receiver_id);
  const theirName = params.username as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    
    // Optional: Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/get_messages.php?user_1=${myId}&user_2=${theirId}`);
      if (response.data.status === 200) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.log("Chat load error", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const textToSend = inputText;
    setInputText(""); // Clear input immediately for speed

    try {
      await api.post('/send_message.php', {
        sender_id: myId,
        receiver_id: theirId,
        message: textToSend
      });
      // Refresh list to show the new message
      fetchMessages();
    } catch (error) {
      console.error("Send error", error);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[
        styles.messageBubble, 
        isMe ? styles.myBubble : styles.theirBubble
      ]}>
        <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
          {item.message_text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{theirName}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* Chat List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1419' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 15, backgroundColor: '#1a1f2e', borderBottomWidth: 2, borderBottomColor: '#252b3b',
    paddingTop: Platform.OS === 'android' ? 40 : 15,
  },
  backBtn: { padding: 5 },
  backText: { fontSize: 16, color: '#8b5cf6', fontWeight: '700' },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#fff',
    letterSpacing: 0.5,
  },
  listContent: { padding: 15, paddingBottom: 20 },
  
  messageBubble: { 
    maxWidth: '75%', 
    padding: 14, 
    borderRadius: 18, 
    marginBottom: 12,
  },
  myBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#8b5cf6', 
    borderBottomRightRadius: 4,
  },
  theirBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#1a1f2e', 
    borderBottomLeftRadius: 4,
    borderWidth: 2,
    borderColor: '#252b3b',
  },
  messageText: { fontSize: 15, fontWeight: '500' },
  myText: { color: '#fff' },
  theirText: { color: '#fff' },

  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#1a1f2e', 
    alignItems: 'center', 
    borderTopWidth: 2, 
    borderTopColor: '#252b3b',
    paddingBottom: 30, 
    marginBottom: 10,
  },
  input: { 
    flex: 1, 
    backgroundColor: '#252b3b', 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingVertical: 12, 
    fontSize: 15, 
    marginRight: 10,
    color: '#fff',
  },
  sendBtn: { 
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 14,
    letterSpacing: 0.5,
  }
});