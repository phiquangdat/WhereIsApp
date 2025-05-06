import {render, fireEvent} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EntryScreen from '../screens/EntryScreen';
import RecordCreationScreen from '../screens/RecordCreationScreen';
import FlatListScreen from '../screens/FlatListScreen';
import {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

type EntryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Entry'
>;
type EntryScreenRouteProp = RouteProp<RootStackParamList, 'Entry'>;

interface Props {
  navigation: EntryScreenNavigationProp;
  route: EntryScreenRouteProp;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Entry" component={EntryScreen} />
      <Stack.Screen name="RecordCreation" component={RecordCreationScreen} />
      <Stack.Screen name="FlatList" component={FlatListScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('EntryScreen', () => {
  const mockNavigation: Partial<EntryScreenNavigationProp> = {
    navigate: jest.fn(),
  };
  const mockRoute: EntryScreenRouteProp = {
    key: 'Entry',
    name: 'Entry',
    params: undefined,
  };

  it('renders correctly', () => {
    const {getByText} = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Entry">
            {() => (
              <EntryScreen
                navigation={mockNavigation as EntryScreenNavigationProp}
                route={mockRoute}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>,
    );
    expect(getByText('Where Is App')).toBeTruthy();
    expect(getByText('Add New')).toBeTruthy();
    expect(getByText('List Items')).toBeTruthy();
  });

  it('navigates to RecordCreation on Add New button press', () => {
    const {getByText} = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Entry">
            {() => (
              <EntryScreen
                navigation={mockNavigation as EntryScreenNavigationProp}
                route={mockRoute}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RecordCreation"
            component={RecordCreationScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>,
    );
    fireEvent.press(getByText('Add New'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecordCreation');
  });

  it('navigates to FlatList on List Items button press', () => {
    const {getByText} = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Entry">
            {() => (
              <EntryScreen
                navigation={mockNavigation as EntryScreenNavigationProp}
                route={mockRoute}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="FlatList" component={FlatListScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
    fireEvent.press(getByText('List Items'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FlatList');
  });
});
