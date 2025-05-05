import React, {useState, useRef} from 'react';
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
  ActivityIndicator,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordEdit'>;

// Constants for colors
const COLORS = {
  primary: '#4a90e2',
  success: '#2ecc71',
  background: '#f5f5f5',
  card: '#fff',
  text: '#1a1a1a',
  textSecondary: '#666',
  border: '#e0e0e0',
  disabled: '#cccccc',
  error: '#e74c3c',
};

const RecordEditScreen: React.FC<Props> = ({navigation}) => {
  const route = useRoute();
  const note = (route.params as {note?: any})?.note;

  const [name, setName] = useState(note.name || '');
  const [description, setDescription] = useState(note.description || '');
  const [image, setImage] = useState<string | null>(note.image || null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(note.location || null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const nameInputRef = useRef<TextInput>(null);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera access to take photos.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
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
      console.error('Image save error:', error);
      return null;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to take a photo.',
      );
      return;
    }

    launchCamera({mediaType: 'photo', quality: 0.7}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        const savedPath = await saveImageToStorage(response.assets[0].uri);
        if (savedPath) {
          setImage(savedPath);
          AccessibilityInfo.announceForAccessibility(
            'Photo captured successfully',
          );
        }
      }
    });
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs location access to save GPS coordinates.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
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
        'Location access is required for GPS coordinates.',
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
        AccessibilityInfo.announceForAccessibility('GPS location captured');
      },
      error => {
        Alert.alert('Error', error.message);
        setIsFetchingLocation(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const validateInputs = () => {
    let isValid = true;
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      AccessibilityInfo.announceForAccessibility(
        'Please fill in all required fields',
      );
      return;
    }

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      name !== note.name ||
      description !== note.description ||
      image !== note.image ||
      location !== note.location
    ) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          {text: 'Keep Editing', style: 'cancel'},
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleImagePress = () => {
    Alert.alert('Image Options', 'Choose an action', [
      {text: 'View Image', onPress: () => setModalImageVisible(true)},
      {text: 'Retake Photo', onPress: pickImage},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Record</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          ref={nameInputRef}
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder="e.g., Christmas tree carpet"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={text => {
            setName(text);
            if (text.trim()) {
              setNameError('');
            }
          }}
          accessibilityLabel="Item name"
          returnKeyType="next"
          onSubmitEditing={() => validateInputs()}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        <Text style={styles.label}>Description & Location</Text>
        <TextInput
          style={[
            styles.input,
            styles.descriptionInput,
            descriptionError ? styles.inputError : null,
          ]}
          placeholder="e.g., The red carpet is on the top shelf of the left closet"
          placeholderTextColor={COLORS.textSecondary}
          value={description}
          onChangeText={text => {
            setDescription(text);
            if (text.trim()) {
              setDescriptionError('');
            }
          }}
          multiline
          accessibilityLabel="Description and location"
          returnKeyType="done"
          onSubmitEditing={() => validateInputs()}
        />
        {descriptionError ? (
          <Text style={styles.errorText}>{descriptionError}</Text>
        ) : null}

        <View style={styles.rowContainer}>
          {image ? (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={handleImagePress}
              accessibilityLabel="View or retake photo"
              accessibilityRole="button">
              <Image source={{uri: 'file://' + image}} style={styles.image} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={pickImage}
              accessibilityLabel="Take photo"
              accessibilityRole="button">
              <Icon name="add-a-photo" size={32} color={COLORS.textSecondary} />
              <Text style={styles.imagePlaceholder}>Add Photo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, isFetchingLocation && styles.disabledButton]}
            onPress={getLocation}
            disabled={isFetchingLocation}
            accessibilityLabel="Add GPS location"
            accessibilityRole="button">
            <Icon
              name="location-pin"
              size={20}
              color={isFetchingLocation ? COLORS.textSecondary : '#fff'}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isFetchingLocation ? 'Fetching...' : 'Add GPS Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {location && (
          <Text style={styles.locationText}>
            📍 Coordinates: {location.latitude.toFixed(4)},{' '}
            {location.longitude.toFixed(4)}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={handleCancel}
            accessibilityLabel="Cancel"
            accessibilityRole="button">
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityLabel="Save record"
            accessibilityRole="button">
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Record</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Record saved successfully!</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
              accessibilityLabel="OK"
              accessibilityRole="button">
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalImageVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalImageVisible(false)}>
        <View style={styles.modalImageContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalImageVisible(false)}
            accessibilityLabel="Close image preview"
            accessibilityRole="button">
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {image && (
            <Image source={{uri: 'file://' + image}} style={styles.fullImage} />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 8,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '50%',
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalImageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default RecordEditScreen;
