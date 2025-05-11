import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import RecordCreationScreen from '../screens/RecordCreationScreen';
import {Alert} from 'react-native';

const mockNavigate = jest.fn();
const navigation = {navigate: mockNavigate, goBack: mockNavigate};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('[]')),
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

describe('RecordCreationScreen', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockClear();
  });

  it('renders form fields', () => {
    const {getByPlaceholderText} = render(
      <RecordCreationScreen navigation={navigation} />,
    );
    expect(getByPlaceholderText('Enter name...')).toBeTruthy();
    expect(getByPlaceholderText('Enter description...')).toBeTruthy();
  });

  it('shows error if trying to save with empty fields', () => {
    jest.spyOn(Alert, 'alert');
    const {getByText} = render(
      <RecordCreationScreen navigation={navigation} />,
    );
    fireEvent.press(getByText(' Save Record'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Name and Description are required!',
    );
  });
});
