import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EntryScreen from './screens/EntryScreen';
import RecordCreationScreen from './screens/RecordCreationScreen';
import FlatListScreen from './screens/FlatListScreen';
import ViewOneItemScreen from './screens/ViewOneItemScreen';
import RecordEditScreen from './screens/RecordEditScreen';

import { enableScreens } from 'react-native-screens';

export type RootStackParamList = {
  Entry: undefined;
  RecordCreation: undefined;
  FlatList: undefined;
  ViewOneItem: undefined;
  RecordEdit: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  enableScreens();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false}}>
        <Stack.Screen name='Entry' component={EntryScreen}/>
        <Stack.Screen name='RecordCreation' component={RecordCreationScreen}/>
        <Stack.Screen name='FlatList' component={FlatListScreen}/>
        <Stack.Screen name='ViewOneItem' component={ViewOneItemScreen}/>
        <Stack.Screen name='RecordEdit' component={RecordEditScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
