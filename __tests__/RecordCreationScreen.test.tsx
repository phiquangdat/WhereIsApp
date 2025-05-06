import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import RecordCreationScreen from '../screens/RecordCreationScreen'; // Fixed import path
import * as RNImagePicker from 'react-native-image-picker';
import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {describe, expect, test} from '@jest/globals';
interface ImagePickerResponse {
  didCancel?: boolean;
  errorMessage?: string;
  assets?: {uri: string}[];
}

type RecordCreationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RecordCreation'
>;
type RecordCreationScreenRouteProp = RouteProp<
  RootStackParamList,
  'RecordCreation'
>;

interface Props {
  navigation: RecordCreationScreenNavigationProp;
  route: RecordCreationScreenRouteProp;
}

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
}));
jest.mock('react-native-fs', () => ({
  ExternalDirectoryPath: '/mock/path',
  copyFile: jest.fn().mockResolvedValue(true),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(true),
}));

describe('RecordCreationScreen', () => {
  const mockNavigation: Partial<RecordCreationScreenNavigationProp> = {
    goBack: jest.fn(),
  };

  const mockRoute: RecordCreationScreenRouteProp = {
    key: 'RecordCreation',
    name: 'RecordCreation',
    params: undefined,
  };

  it('validates inputs and shows errors', async () => {
    const {getByPlaceholderText, getByText} = render(
      <RecordCreationScreen
        navigation={mockNavigation as RecordCreationScreenNavigationProp}
        route={mockRoute}
      />,
    );
    const nameInput = getByPlaceholderText('e.g., Christmas tree carpet');
    const descriptionInput = getByPlaceholderText(
      'e.g., The red carpet is on the top shelf of the left closet',
    );
    const saveButton = getByText('Save Record');

    fireEvent.changeText(nameInput, '');
    fireEvent.changeText(descriptionInput, '');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
      expect(getByText('Description is required')).toBeTruthy();
    });
  });

  it('allows saving with valid inputs', async () => {
    const {getByPlaceholderText, getByText} = render(
      <RecordCreationScreen
        navigation={mockNavigation as RecordCreationScreenNavigationProp}
        route={mockRoute}
      />,
    );
    fireEvent.changeText(
      getByPlaceholderText('e.g., Christmas tree carpet'),
      'Test Item',
    );
    fireEvent.changeText(
      getByPlaceholderText(
        'e.g., The red carpet is on the top shelf of the left closet',
      ),
      'Test Description',
    );
    fireEvent.press(getByText('Save Record'));

    await waitFor(() => {
      expect(getByText('Record saved successfully!')).toBeTruthy();
    });
  });

  it('handles image pick successfully', async () => {
    const mockResponse: ImagePickerResponse = {
      didCancel: false,
      assets: [{uri: 'mock-uri'}],
    };
    (RNImagePicker.launchCamera as jest.Mock).mockImplementation(
      (options, callback) => callback(mockResponse),
    );
    (RNFS.copyFile as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(
      <RecordCreationScreen
        navigation={mockNavigation as RecordCreationScreenNavigationProp}
        route={mockRoute}
      />,
    );
    fireEvent.press(getByText('Add Photo'));

    await waitFor(() => {
      expect(RNImagePicker.launchCamera).toHaveBeenCalled();
      expect(RNFS.copyFile).toHaveBeenCalled();
    });
  });

  it('shows error on image pick failure', async () => {
    const mockResponse: ImagePickerResponse = {
      didCancel: false,
      errorMessage: 'Camera error',
    };
    (RNImagePicker.launchCamera as jest.Mock).mockImplementation(
      (options, callback) => callback(mockResponse),
    );

    const {getByText} = render(
      <RecordCreationScreen
        navigation={mockNavigation as RecordCreationScreenNavigationProp}
        route={mockRoute}
      />,
    );
    fireEvent.press(getByText('Add Photo'));

    await waitFor(() => {
      expect(getByText('Error')).toBeTruthy();
    });
  });
});
