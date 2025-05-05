import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewOneItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {noteId} = route.params;
  const [note, setNote] = useState(null);

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
      'Confirm Deletion',
      'Are you sure you want to delete this note?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: deleteNote},
      ],
    );
  };

  const confirmEdit = () => {
    Alert.alert('Confirm Edit', 'Are you sure you want to edit this note?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Edit',
        style: 'default',
        onPress: () => navigation.navigate('RecordEdit', {note: note}),
      },
    ]);
  };

  const deleteNote = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('records');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = notes.filter(n => n.id !== note.id);
      await AsyncStorage.setItem('records', JSON.stringify(updatedNotes));
      Alert.alert('Deleted', 'The note has been deleted successfully.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{note?.name || ''}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={confirmEdit}>
            <Icon name="edit" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Icon name="delete" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title_description}>Description: </Text>
        <Text style={styles.description}>{note?.description || ''}</Text>
        {note?.image && (
          <View>
            <Text style={styles.title_description}>Image: </Text>
            <Image
              source={{uri: 'file://' + note.image}}
              style={styles.image}
            />
          </View>
        )}
        {note?.location && (
          <Text style={styles.location}>
            📍 {note.location.latitude}, {note.location.longitude}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center'},
  iconContainer: {flexDirection: 'row', gap: 10},
  content: {flex: 1},
  title_description: {fontSize: 16, marginBottom: 10},
  description: {fontSize: 16, marginStart: 20, marginBottom: 10},
  image: {width: '100%', height: 300, borderRadius: 10, marginBottom: 10},
  location: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ViewOneItemScreen;
