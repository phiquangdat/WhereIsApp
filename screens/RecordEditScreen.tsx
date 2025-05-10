import React, {useState} from 'react';
import {
  PermissionsAndroid,
  View,
  Text,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordEdit'>;

const RecordEditScreen: React.FC<Props> = ({navigation}) => {
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageVisible, setModalImageVisible] = useState(false);

  const route = useRoute();
  const note = (route.params as {note?: any})?.note;

  const [name, setName] = useState(note.name);
  const [description, setDescription] = useState(note.description);
  const [image, setImage] = useState<string | null>(note.image);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(note.location);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'The application needs access to the camera.',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Agree',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const saveImageToStorage = async (imageUri: string) => {
    const fileName = `image_${Date.now()}.jpg`;
    const path = `${RNFS.ExternalDirectoryPath}/${fileName}`;

    try {
      await RNFS.copyFile(imageUri, path);
      return path;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'You need to grant camera access to take a photo.',
      );
      return;
    }

    launchCamera({mediaType: 'photo', quality: 1}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('Image picker error: ', response.errorMessage);
      } else {
        const savedPath = await saveImageToStorage(response.assets[0].uri);
        if (savedPath) {
          setImage(savedPath);
        }
      }
    });
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Permission',
          message:
            'The application needs location access permission to save GPS coordinates.',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Agree',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'You need to grant location access to save GPS coordinates.',
      );
      return;
    }
    setIsFetchingLocation(true);

    Geolocation.getCurrentPosition(
      position => {
        setIsFetchingLocation(false);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        Alert.alert('Error', error.message);
        setIsFetchingLocation(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handleImagePress = () => {
    setModalImageVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Name and Description are required!');
      return;
    }

    try {
      const storedNotes = await AsyncStorage.getItem('records');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];

      const updatedNotes = notes.map(n =>
        n.id === note.id ? {...n, name, description, image, location} : n,
      );
      await AsyncStorage.setItem('records', JSON.stringify(updatedNotes));
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the record.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#4c669f" />
      </TouchableOpacity>

      <Text style={styles.title}>Edit Record</Text>

      <Text style={styles.label}>Item Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name..."
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description & Location:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter description..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.rowContainer}>
        {image ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImagePress}>
            <Image source={{uri: 'file://' + image}} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            <Icon name="camera-plus" size={40} color="#3b5998" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            isFetchingLocation && styles.disabledButton,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          onPress={getLocation}
          disabled={isFetchingLocation}>
          <Icon
            name="map-marker"
            size={20}
            color="#fff"
            style={{marginRight: 8}}
          />
          <Text style={styles.buttonText}>
            {isFetchingLocation ? 'Fetching location...' : 'Add GPS Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {location && (
        <Text style={styles.locationText}>
          Coordinates: {location.latitude}, {location.longitude}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        onPress={handleSave}>
        <Icon
          name="content-save"
          size={20}
          color="#fff"
          style={{marginRight: 8}}
        />
        <Text style={styles.saveButtonText}>Save Record</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => {}}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Record has been saved successfully!
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for viewing full image */}
      <Modal
        visible={modalImageVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalImageContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalImageVisible(false)}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {image && (
            <Image source={{uri: 'file://' + image}} style={styles.fullImage} />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  backButton: {marginBottom: 10},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4c669f',
  },
  label: {fontSize: 16, fontWeight: 'bold', marginTop: 10},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f7f7f7',
    color: '#3b5998',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#3b5998',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  disabledButton: {backgroundColor: '#ccc'},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 89, 152, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  image: {width: '100%', height: '100%', borderRadius: 10},
  locationText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {fontSize: 18, marginBottom: 10},
  okButton: {
    backgroundColor: '#3b5998',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  okButtonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  modalImageContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {position: 'absolute', top: 40, right: 20, zIndex: 10},
  fullImage: {width: '100%', height: '100%', resizeMode: 'contain'},
});

export default RecordEditScreen;
