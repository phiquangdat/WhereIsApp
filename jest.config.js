module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|react-native-vector-icons|react-native-linear-gradient|react-native-image-picker|@react-native-community/geolocation|react-native-fs)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-linear-gradient$':
      '<rootDir>/__mocks__/react-native-linear-gradient.js',
    '^react-native-vector-icons/MaterialCommunityIcons$':
      '<rootDir>/__mocks__/react-native-vector-icons/MaterialCommunityIcons.js',
    '^react-native-vector-icons/MaterialIcons$':
      '<rootDir>/__mocks__/react-native-vector-icons/MaterialCommunityIcons.js',
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },
  testEnvironment: 'jsdom',
};
