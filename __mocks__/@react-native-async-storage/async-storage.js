const mockStorage = new Map();

export default {
  setItem: jest.fn((key, value) => {
    return new Promise(resolve => {
      mockStorage.set(key, value);
      resolve(null);
    });
  }),
  getItem: jest.fn(key => {
    return new Promise(resolve => {
      resolve(mockStorage.get(key) || null);
    });
  }),
  removeItem: jest.fn(key => {
    return new Promise(resolve => {
      mockStorage.delete(key);
      resolve(null);
    });
  }),
  clear: jest.fn(() => {
    return new Promise(resolve => {
      mockStorage.clear();
      resolve(null);
    });
  }),
  getAllKeys: jest.fn(() => {
    return new Promise(resolve => {
      resolve(Array.from(mockStorage.keys()));
    });
  }),
  multiGet: jest.fn(keys => {
    return new Promise(resolve => {
      resolve(keys.map(key => [key, mockStorage.get(key) || null]));
    });
  }),
  multiSet: jest.fn(keyValuePairs => {
    return new Promise(resolve => {
      keyValuePairs.forEach(([key, value]) => {
        mockStorage.set(key, value);
      });
      resolve(null);
    });
  }),
  multiRemove: jest.fn(keys => {
    return new Promise(resolve => {
      keys.forEach(key => mockStorage.delete(key));
      resolve(null);
    });
  }),
};
