import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import EntryScreen from '../screens/EntryScreen';

const mockNavigate = jest.fn();

const navigation = {navigate: mockNavigate};

describe('EntryScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders welcome text', () => {
    const {getByText} = render(<EntryScreen navigation={navigation} />);
    expect(getByText('Welcome to')).toBeTruthy();
    expect(getByText('Where Is App')).toBeTruthy();
  });

  it('navigates to RecordCreation on Add New Note button press', () => {
    const {getByText} = render(<EntryScreen navigation={navigation} />);
    fireEvent.press(getByText('Add New Note'));
    expect(mockNavigate).toHaveBeenCalledWith('RecordCreation');
  });

  it('navigates to FlatList on View Notes button press', () => {
    const {getByText} = render(<EntryScreen navigation={navigation} />);
    fireEvent.press(getByText('View Notes'));
    expect(mockNavigate).toHaveBeenCalledWith('FlatList');
  });
});
