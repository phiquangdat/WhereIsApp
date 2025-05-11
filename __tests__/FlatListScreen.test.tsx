import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import FlatListScreen from '../screens/FlatListScreen';

const mockNavigate = jest.fn();
const navigation = {navigate: mockNavigate, goBack: jest.fn()};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() =>
    Promise.resolve(
      JSON.stringify([
        {id: '1', name: 'Test Note', description: 'Test Desc'},
        {id: '2', name: 'Another Note', description: 'Another Desc'},
      ]),
    ),
  ),
}));

describe('FlatListScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders notes and allows searching', async () => {
    const {findByText, getByPlaceholderText} = render(
      <NavigationContainer>
        <FlatListScreen navigation={navigation} />
      </NavigationContainer>,
    );
    expect(await findByText('Test Note')).toBeTruthy();
    expect(await findByText('Another Note')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Search notes...'), 'Test');
    expect(await findByText('Test Note')).toBeTruthy();
  });

  it('navigates to ViewOneItem on note press', async () => {
    const {findByText} = render(
      <NavigationContainer>
        <FlatListScreen navigation={navigation} />
      </NavigationContainer>,
    );
    fireEvent.press(await findByText('Test Note'));
    expect(mockNavigate).toHaveBeenCalledWith('ViewOneItem', {noteId: '1'});
  });
});
