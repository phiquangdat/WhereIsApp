import React from 'react';
import {View, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {Button, Card, Text} from 'react-native-paper';

type Props = NativeStackScreenProps<RootStackParamList, 'Entry'>;

const EntryScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.title}>
            Where Is App
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Keep track of important items with ease
          </Text>
        </Card.Content>
      </Card>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.primaryButton}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('RecordCreation')}>
          Add New
        </Button>
        <Button
          mode="outlined"
          style={styles.secondaryButton}
          labelStyle={styles.secondaryButtonLabel}
          onPress={() => navigation.navigate('FlatList')}>
          List Items
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  card: {
    width: '90%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: 'gray',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
    width: '90%',
  },
  primaryButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    marginVertical: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6200EE',
    marginVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
  },
});

export default EntryScreen;
