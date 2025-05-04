import React, {useEffect} from 'react';
import {View, Image, StyleSheet, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, Card, Text} from 'react-native-paper';

type Props = NativeStackScreenProps<RootStackParamList, 'Entry'>;

const EntryScreen: React.FC<Props> = ({navigation}) => {
  const safePadding = '5%';
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to
          </Text>
          <Text variant="headlineLarge" style={styles.title}>
            Notes App
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Manage your notes efficiently
          </Text>
        </Card.Content>
      </Card>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={[styles.button, styles.primaryButton]}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('RecordCreation')}  
        >
          Add New
        </Button>
        <Button
          mode="contained"
          style={[styles.button, styles.secondaryButton]}
          labelStyle={styles.secondaryButtonLabel}
          onPress={() => navigation.navigate('FlatList')}  
          >
          List Items
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: 'black',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: 'gray',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    marginVertical: 10,
  },
});

export default EntryScreen;
