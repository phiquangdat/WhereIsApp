import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import RecordEditScreen from '../screens/RecordEditScreen';
import {Alert} from 'react-native';

const mockNavigate = jest.fn();
const navigation = {navigate: mockNavigate, goBack: mockNavigate};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() =>
    Promise.resolve(
      JSON.stringify([
        {
          id: '1',
          name: 'Test Note',
          description: 'Test Desc',
          image: null,
          location: null,
        },
      ]),
    ),
  ),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-fs', () => ({
  ExternalDirectoryPath: '/mock/path',
  copyFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    params: {
      note: {
        id: '1',
        name: 'Test Note',
        description: 'Test Desc',
        image: null,
        location: null,
      },
    },
  }),
}));

describe('RecordEditScreen', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockClear();
  });

  it('renders form fields', () => {
    const {getByPlaceholderText} = render(
      <RecordEditScreen navigation={navigation} />,
    );
    expect(getByPlaceholderText('Enter name...')).toBeTruthy();
    expect(getByPlaceholderText('Enter description...')).toBeTruthy();
  });

  it('shows error if trying to save with empty fields', () => {
    jest.spyOn(Alert, 'alert');
    const {getByText, getByPlaceholderText} = render(
      <RecordEditScreen navigation={navigation} />,
    );
    fireEvent.changeText(getByPlaceholderText('Enter name...'), '');
    fireEvent.changeText(getByPlaceholderText('Enter description...'), '');
    fireEvent.press(getByText(' Save Record'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Name and Description are required!',
    );
  });
});
