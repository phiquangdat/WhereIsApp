import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';

const EntryScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <CustomButton
        title="Add New"
        onPress={() => navigation.navigate('RecordCreation')}
      />
      <CustomButton
        title="List Items"
        onPress={() => navigation.navigate('FlatList')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default EntryScreen;
