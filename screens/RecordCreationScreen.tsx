import React, { useState } from 'react';
import { PermissionsAndroid, View, Text, TextInput, Button, Image, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordCreation'>;

const RecordCreationScreen: React.FC<Props> = ({navigation}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
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
                }
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
            // Alert.alert('Lưu ảnh thành công!', `Đường dẫn: ${path}`);
            return path;
        } catch (error) {
            // Alert.alert('Lỗi', 'Không thể lưu ảnh');
            console.error(error);
            return null;
        }
    };
    
    const pickImage = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'You need to grant camera access to take a photo.');
            return;
        }

        launchCamera({ mediaType: 'photo', quality: 1 }, async (response) => {
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
                    message: 'The application needs location access permission to save GPS coordinates.',
                    buttonNeutral: 'Ask me later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Agree',
                }
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
            Alert.alert('Permission Denied', 'You need to grant location access to save GPS coordinates.');
            return;
        }
        setIsFetchingLocation(true);

        Geolocation.getCurrentPosition(
            (position) => {
                setIsFetchingLocation(false);
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                Alert.alert('Error', error.message);
                setIsFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleImagePress = () => {
        Alert.alert(
            'Image Options',
            'Choose an action',
            [
                { text: 'View Image', onPress: () => viewImage() },
                { text: 'Retake Photo', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
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
        const record = { id, name, description, image, location };

        try {
            const existingRecords = await AsyncStorage.getItem('records');
            const records = existingRecords ? JSON.parse(existingRecords) : [];
    
            records.push(record);
    
            await AsyncStorage.setItem('records', JSON.stringify(records));
    
            console.log('Saving record:', record);
            setModalVisible(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to save the record.');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Create New Record</Text>

            <Text style={styles.label}>Item Name:</Text>
            <TextInput style={styles.input} placeholder="Enter name..." value={name} onChangeText={setName} />

            <Text style={styles.label}>Description & Location:</Text>
            <TextInput style={styles.input} placeholder="Enter description..." value={description} onChangeText={setDescription}/>

            <View style={styles.rowContainer}>
                    {image ? (
                        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePress}>
                            <Image source={{ uri: 'file://' + image }} style={styles.image} />
                        </TouchableOpacity>  
                    ) : (
                        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                            <Icon name="add" size={40} color="#aaa" />
                        </TouchableOpacity>
                    )}
                <TouchableOpacity 
                    style={[styles.button, isFetchingLocation && styles.disabledButton]} 
                    onPress={getLocation} 
                    disabled={isFetchingLocation}
                >
                    <Text style={styles.buttonText}>{isFetchingLocation ? 'Fetching location...' : '📍 Add GPS Location'}</Text>
                </TouchableOpacity>
            </View>

            {location && (
                <Text style={styles.locationText}>Coordinates: {location.latitude}, {location.longitude}</Text>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>💾 Save Record</Text>
            </TouchableOpacity>

            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => {}}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Record has been saved successfully!</Text>
                        <TouchableOpacity style={styles.okButton} onPress={() => { setModalVisible(false); navigation.goBack(); }}>
                            <Text style={styles.okButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for viewing full image */}
            <Modal visible={modalImageVisible} transparent={true} animationType="slide">
                <View style={styles.modalImageContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalImageVisible(false)}>
                        <Icon name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {image && <Image source={{ uri: 'file://' + image }} style={styles.fullImage} />}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginVertical: 5 },
    rowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5 },
    disabledButton: { backgroundColor: '#ccc' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    imageContainer: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
    image: { width: '100%', height: '100%', borderRadius: 10 },
    locationText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 5 },
    saveButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
    modalText: { fontSize: 18, marginBottom: 10 },
    okButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center' },
    okButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalImageContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
    fullImage: { width: '100%', height: '100%', resizeMode: 'contain' }
});

export default RecordCreationScreen;