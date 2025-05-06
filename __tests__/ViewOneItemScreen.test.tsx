import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewOneItemScreen from './ViewOneItemScreen';
import RecordEditScreen from './RecordEditScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {describe, expect, test} from '@jest/globals';
interface Note {
  id: string;
  name: string;
  description: string;
  image: string | null;
}

type ViewOneItemScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ViewOneItem'
>;
type ViewOneItemScreenRouteProp = RouteProp<RootStackParamList, 'ViewOneItem'>;

interface Props {
  navigation: ViewOneItemScreenNavigationProp;
  route: ViewOneItemScreenRouteProp;
}

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

const Stack = createNativeStackNavigator<RootStackParamList>();

describe('ViewOneItemScreen', () => {
  const mockNavigation: Partial<ViewOneItemScreenNavigationProp> = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockRoute: ViewOneItemScreenRouteProp = {
    key: 'ViewOneItem',
    name: 'ViewOneItem',
    params: {noteId: '1'},
  };

  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        {id: '1', name: 'Test Item', description: 'Test Desc', image: null},
      ] as Note[]),
    );
  });

  it('loads and displays note details', async () => {
    const {getByText} = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="ViewOneItem"
            component={ViewOneItemScreen}
            initialParams={{noteId: '1'}}
          />
        </Stack.Navigator>
      </NavigationContainer>,
    );
    await waitFor(() => {
      expect(getByText('Test Item')).toBeTruthy();
      expect(getByText('Description:')).toBeTruthy();
      expect(getByText('Test Desc')).toBeTruthy();
    });
  });

  it('shows delete confirmation dialog', () => {
    const {getByText} = render(
      <ViewOneItemScreen
        navigation={mockNavigation as ViewOneItemScreenNavigationProp}
        route={mockRoute}
      />,
    );
    fireEvent.press(getByText('delete'));
    expect(getByText('Confirm Deletion')).toBeTruthy();
  });

  it('navigates to RecordEdit on edit press', () => {
    const {getByText} = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="ViewOneItem"
            component={ViewOneItemScreen}
            initialParams={{noteId: '1'}}
          />
          <Stack.Screen name="RecordEdit" component={RecordEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
    fireEvent.press(getByText('edit'));
    expect(getByText('Edit Record')).toBeTruthy();
  });
});
