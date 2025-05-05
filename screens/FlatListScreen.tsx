import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        console.debug('Loaded notes:', storedNotes);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>WhereIs Items</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search items..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.itemContainer}
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
                <Icon name="image" size={40} color="#aaa" />
              </View>
            )}
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  searchBar: {
    height: 42,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default FlatListScreen;
