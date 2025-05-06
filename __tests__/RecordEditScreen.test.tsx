import {render, fireEvent, waitFor} from '@testing-library/react-native';
import RecordEditScreen from '../screens/RecordEditScreen'; // Fixed import path
import * as RNImagePicker from 'react-native-image-picker';
import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {describe, expect, test} from '@jest/globals';
interface Note {
  id: string;
  name: string;
  description: string;
  image: string | null;
}

type RecordEditScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RecordEdit'
>;
type RecordEditScreenRouteProp = RouteProp<RootStackParamList, 'RecordEdit'>;

interface Props {
  navigation: RecordEditScreenNavigationProp;
  route: RecordEditScreenRouteProp;
}

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
}));
jest.mock('react-native-fs', () => ({
  ExternalDirectoryPath: '/mock/path',
  copyFile: jest.fn().mockResolvedValue(true),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest
    .fn()
    .mockResolvedValue(
      JSON.stringify([{id: '1', name: 'Old Item', description: 'Old Desc'}]),
    ),
  setItem: jest.fn().mockResolvedValue(true),
}));

describe('RecordEditScreen', () => {
  const mockNote: Note = {
    id: '1',
    name: 'Old Item',
    description: 'Old Desc',
    image: null,
  };
  const mockNavigation: Partial<RecordEditScreenNavigationProp> = {
    goBack: jest.fn(),
  };
  const route: RecordEditScreenRouteProp = {
    key: 'RecordEdit',
    name: 'RecordEdit',
    params: {note: mockNote},
  };

  it('loads existing note data', () => {
    const {getByPlaceholderText} = render(
      <RecordEditScreen
        navigation={mockNavigation as RecordEditScreenNavigationProp}
        route={route}
      />,
    );
    expect(
      getByPlaceholderText('e.g., Christmas tree carpet').props.value,
    ).toBe('Old Item');
    expect(
      getByPlaceholderText(
        'e.g., The red carpet is on the top shelf of the left closet',
      ).props.value,
    ).toBe('Old Desc');
  });

  it('validates and shows errors on empty inputs', async () => {
    const {getByPlaceholderText, getByText} = render(
      <RecordEditScreen
        navigation={mockNavigation as RecordEditScreenNavigationProp}
        route={route}
      />,
    );
    fireEvent.changeText(
      getByPlaceholderText('e.g., Christmas tree carpet'),
      '',
    );
    fireEvent.changeText(
      getByPlaceholderText(
        'e.g., The red carpet is on the top shelf of the left closet',
      ),
      '',
    );
    fireEvent.press(getByText('Save Record'));

    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
      expect(getByText('Description is required')).toBeTruthy();
    });
  });

  it('saves updated record', async () => {
    const {getByPlaceholderText, getByText} = render(
      <RecordEditScreen
        navigation={mockNavigation as RecordEditScreenNavigationProp}
        route={route}
      />,
    );
    fireEvent.changeText(
      getByPlaceholderText('e.g., Christmas tree carpet'),
      'New Item',
    );
    fireEvent.press(getByText('Save Record'));

    await waitFor(() => {
      expect(getByText('Record saved successfully!')).toBeTruthy();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
