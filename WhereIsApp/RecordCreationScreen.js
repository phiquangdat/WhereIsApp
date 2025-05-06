import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from './components/InputField';
import CustomButton from './components/CustomButton';
import CameraView from './components/CameraView';

const RecordCreationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  const handlePhotoTaken = (uri) => {
    setPhoto(uri);
  };

  const saveRecord = async () => {
    if (!name || !description) {
      Alert.alert('Error', 'Name and description are required');
      return;
    }
    try {
      const record = { id: Date.now().toString(), name, description, photo };
      const existing = await AsyncStorage.getItem('records');
      const records = existing ? JSON.parse(existing) : [];
      records.push(record);
      await AsyncStorage.setItem('records', JSON.stringify(records));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save record');
    }
  };

  return (
    <View style={styles.container}>
      <InputField
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
      />
      <InputField
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <CameraView onPhotoTaken={handlePhotoTaken} />
      <CustomButton title="Save" onPress={saveRecord} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default RecordCreationScreen;
