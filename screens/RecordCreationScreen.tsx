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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY = '#4c669f';
const SECONDARY = '#3b5998';
const ACCENT = '#34C759';

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 24},
  backButton: {position: 'absolute', top: 24, left: 16, zIndex: 10},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: PRIMARY,
    marginVertical: 24,
  },
  label: {fontSize: 16, fontWeight: 'bold', marginTop: 10, color: PRIMARY},
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    color: SECONDARY,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  image: {width: '100%', height: '100%', borderRadius: 12},
  cameraIcon: {alignItems: 'center', justifyContent: 'center'},
  gpsButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  gpsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'left',
    marginTop: 8,
    color: SECONDARY,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    width: 300,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 18,
    color: SECONDARY,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  okButtonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  modalImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {position: 'absolute', top: 40, right: 24, zIndex: 10},
  fullImage: {width: 320, height: 320, borderRadius: 16},
});

type Props = NativeStackScreenProps<RootStackParamList, 'RecordCreation'>;

const RecordCreationScreen: React.FC<Props> = ({navigation}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalImageVisible, setModalImageVisible] = useState(false);

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
        // User cancelled
      } else if (response.errorMessage) {
        Alert.alert('Image picker error', response.errorMessage);
      } else if (response.assets && response.assets[0]?.uri) {
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
    Alert.alert('Image Options', 'Choose an action', [
      {text: 'View Image', onPress: () => viewImage()},
      {text: 'Retake Photo', onPress: pickImage},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const viewImage = () => {
    setModalImageVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Name and Description are required!');
      return;
    }
    const id = new Date().toISOString();
    const record = {id, name, description, image, location};
    try {
      const existingRecords = await AsyncStorage.getItem('records');
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(record);
      await AsyncStorage.setItem('records', JSON.stringify(records));
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the record.');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Note</Text>
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
        />
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={image ? handleImagePress : pickImage}>
            {image ? (
              <Image source={{uri: 'file://' + image}} style={styles.image} />
            ) : (
              <Icon
                name="camera-plus"
                size={38}
                color={SECONDARY}
                style={styles.cameraIcon}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gpsButton,
              isFetchingLocation && {backgroundColor: '#ccc'},
            ]}
            onPress={getLocation}
            disabled={isFetchingLocation}>
            <Icon name="map-marker" size={22} color="#fff" />
            <Text style={styles.gpsButtonText}>
              {isFetchingLocation ? 'Fetching...' : 'Add GPS Location'}
            </Text>
          </TouchableOpacity>
        </View>
        {location && (
          <Text style={styles.locationText}>
            Coordinates: {location.latitude}, {location.longitude}
          </Text>
        )}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Icon name="content-save" size={22} color="#fff" />
          <Text style={styles.saveButtonText}> Save Record</Text>
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
        <Modal
          visible={modalImageVisible}
          transparent={true}
          animationType="slide">
          <View style={styles.modalImageContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalImageVisible(false)}>
              <Icon name="close" size={32} color="#fff" />
            </TouchableOpacity>
            {image && (
              <Image
                source={{uri: 'file://' + image}}
                style={styles.fullImage}
              />
            )}
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RecordCreationScreen;
