import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';

const CameraView = ({ onPhotoTaken }) => {
  const [photo, setPhoto] = useState(null);

  const takePicture = async (camera) => {
    try {
      const data = await camera.takePictureAsync();
      setPhoto(data.uri);
      onPhotoTaken(data.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera style={styles.camera} captureAudio={false}>
        {({ camera }) => (
          <Button title="Take Photo" onPress={() => takePicture(camera)} />
        )}
      </RNCamera>
      {photo && <Image source={{ uri: photo }} style={styles.preview} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  camera: {
    height: 200,
  },
  preview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
});

export default CameraView;
