import React, {useEffect} from 'react';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {Button, Card, Text, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Entry'>;

const {width, height} = Dimensions.get('window');

const EntryScreen: React.FC<Props> = ({navigation}) => {
  const theme = useTheme();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon
              name="map-marker"
              size={60}
              color="#3b5998"
              style={styles.icon}
            />
            <Text variant="displaySmall" style={styles.title}>
              Welcome to
            </Text>
            <Text variant="displayMedium" style={styles.appName}>
              Where Is App
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Your Location-Based Notes App
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[styles.button, styles.primaryButton]}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('RecordCreation')}
            icon="plus-circle">
            Add New Note
          </Button>
          <Button
            mode="contained"
            style={[styles.button, styles.secondaryButton]}
            labelStyle={styles.secondaryButtonLabel}
            onPress={() => navigation.navigate('FlatList')}
            icon="format-list-bulleted">
            View Notes
          </Button>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width * 0.9,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 30,
  },
  cardContent: {
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    color: '#3b5998',
    marginBottom: 5,
    fontWeight: '300',
  },
  appName: {
    textAlign: 'center',
    color: '#192f6a',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
  },
  buttonContainer: {
    width: width * 0.9,
    gap: 15,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#4c669f',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    paddingVertical: 4,
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b5998',
  },
});

export default EntryScreen;
