import React from 'react';
import {render} from '@testing-library/react-native';
import App from '../App'; // Ensure this matches your project structure
import {describe, expect, test} from '@jest/globals';
describe('App', () => {
  it('renders without crashing', () => {
    const {getByText} = render(<App />);
    expect(getByText('Where Is App')).toBeTruthy();
  });
});
