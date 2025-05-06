import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FlatListScreen from '../screens/FlatListScreen';
import ViewOneItemScreen from '../screens/ViewOneItemScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

interface Note {
  id: string;
  name: string;
  description: string;
  image: string | null;
}

type FlatListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FlatList'
>;
type FlatListScreenRouteProp = RouteProp<RootStackParamList, 'FlatList'>;

interface Props {
  navigation: FlatListScreenNavigationProp;
  route: FlatListScreenRouteProp;
}

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

const Stack = createNativeStackNavigator<RootStackParamList>();

describe('FlatListScreen', () => {
  const mockNavigation: Partial<FlatListScreenNavigationProp> = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockRoute: FlatListScreenRouteProp = {
    key: 'FlatList',
    name: 'FlatList',
    params: undefined,
  };

  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        {
          id: '1',
          name: 'Test Item 1',
          description: 'Description 1',
          image: null,
        },
        {
          id: '2',
          name: 'Test Item 2',
          description: 'Description 2',
          image: null,
        },
      ] as Note[]),
    );
  });

  it('loads and displays notes from AsyncStorage', async () => {
    const {getByText} = render(
      <FlatListScreen
        navigation={mockNavigation as FlatListScreenNavigationProp}
        route={mockRoute}
      />,
    );
    await waitFor(() => {
      expect(getByText('Test Item 1')).toBeTruthy();
      expect(getByText('Test Item 2')).toBeTruthy();
    });
  });

  it('filters notes based on search text', async () => {
    const {getByPlaceholderText, getByText, queryByText} = render(
      <FlatListScreen
        navigation={mockNavigation as FlatListScreenNavigationProp}
        route={mockRoute}
      />,
    );
    await waitFor(() => expect(getByText('Test Item 1')).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText('Search items...'), 'Item 2');
    await waitFor(() => {
      expect(getByText('Test Item 2')).toBeTruthy();
      expect(queryByText('Test Item 1')).toBeNull();
    });
  });

  it('navigates to ViewOneItem on item press', () => {
    const {getByText} = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="FlatList" component={FlatListScreen} />
          <Stack.Screen name="ViewOneItem" component={ViewOneItemScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
    fireEvent.press(getByText('Test Item 1'));
    expect(getByText('Test Item 1')).toBeTruthy();
  });
});
