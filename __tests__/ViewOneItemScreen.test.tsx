import React from 'react';
import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import ViewOneItemScreen from '../screens/ViewOneItemScreen';

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

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({params: {noteId: '1'}}),
}));

describe('ViewOneItemScreen', () => {
  it('renders note details', async () => {
    const {findByText} = render(
      <NavigationContainer>
        <ViewOneItemScreen navigation={navigation} />
      </NavigationContainer>,
    );
    expect(await findByText('Test Note')).toBeTruthy();
    expect(await findByText('Test Desc')).toBeTruthy();
  });
});
