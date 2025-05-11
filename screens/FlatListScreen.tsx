import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from 'react-native-paper';

type Props = NativeStackScreenProps<RootStackParamList, 'FlatList'>;

type Note = {
  id: string;
  name: string;
  description: string;
  image?: string;
  location?: {latitude: number; longitude: number} | null;
};

const FlatListScreen: React.FC<Props> = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('records');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, []),
  );

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#4c669f" />
        </TouchableOpacity>
        <Text style={styles.title}>My Notes</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search notes..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#666"
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('ViewOneItem', {noteId: item.id})
            }>
            {item.image ? (
              <Image
                source={{uri: 'file://' + item.image}}
                style={styles.thumbnail}
              />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="image" size={40} color="#3b5998" />
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#3b5998" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="note-text-outline" size={60} color="#4c669f" />
            <Text style={styles.emptyText}>No notes found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: '#4c669f',
    fontWeight: 'bold',
    fontSize: 22,
    flex: 1,
    textAlign: 'center',
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    color: '#3b5998',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 102, 159, 0.07)',
    marginBottom: 12,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 89, 152, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    color: '#192f6a',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  itemDescription: {
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#4c669f',
    marginTop: 10,
    fontSize: 18,
  },
});

export default FlatListScreen;
