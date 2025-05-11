export default {
  getCurrentPosition: jest.fn((success, error, options) => {
    // Simulate a successful geolocation response
    const position = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
    success && success(position);
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
};
