import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from 'react-native-paper';

const {width} = Dimensions.get('window');

const ViewOneItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [note, setNote] = useState(null);

  const {noteId} = route.params;

  const loadNote = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('records');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNote = notes.find(n => n.id === noteId);
      if (updatedNote) {
        setNote(updatedNote);
      }
    } catch (error) {
      console.error('Error loading note:', error);
    }
  };

  useEffect(() => {
    loadNote();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadNote();
    }, []),
  );

  const confirmDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: deleteNote},
      ],
    );
  };

  const deleteNote = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('records');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = notes.filter(n => n.id !== note.id);
      await AsyncStorage.setItem('records', JSON.stringify(updatedNotes));
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#4c669f" />
        </TouchableOpacity>
        <Text style={styles.title}>{note?.name || ''}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('RecordEdit', {note: note})}>
            <Icon name="pencil" size={24} color="#4c669f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={confirmDelete}>
            <Icon name="delete" size={24} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{note?.description || ''}</Text>
        {note?.image && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Image</Text>
            <Image
              source={{uri: 'file://' + note.image}}
              style={styles.image}
            />
          </View>
        )}
        {note?.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationText}>
              <Icon name="map-marker" size={20} color="#3b5998" />
              <Text style={styles.location}>
                {note.location.latitude.toFixed(6)},{' '}
                {note.location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}
      </View>
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
    flex: 1,
    color: '#4c669f',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 22,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(76, 102, 159, 0.07)',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  sectionTitle: {
    color: '#192f6a',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
  },
  description: {
    color: '#333',
    marginBottom: 20,
    fontSize: 16,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  locationContainer: {
    marginTop: 10,
  },
  locationText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  location: {
    color: '#3b5998',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default ViewOneItemScreen;
