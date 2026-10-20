import shortcuts from '../src/content-scripts/shortcuts';

let originalConnection;
beforeAll(() => {
  originalConnection = navigator.connection;
  Object.defineProperty(navigator, 'connection', { value: { downlink: 1, rtt: 50 }, writable: true });
});

afterAll(() => {
  Object.defineProperty(navigator, 'connection', { value: originalConnection, writable: true });
});

test('should disable shortcuts if internet connection becomes unstable', () => {
  const mockEvent = new KeyboardEvent('keydown', { key: 'a' });

  // Simulate stable connection
  navigator.connection.downlink = 1;
  navigator.connection.rtt = 50;
  shortcuts.handleConnectivityChange();
  global.console.warn = jest.fn();
  document.dispatchEvent(mockEvent);
  expect(console.warn).not.toHaveBeenCalled();

  // Simulate unstable connection
  navigator.connection.downlink = 0.3;
  navigator.connection.rtt = 400;
  shortcuts.handleConnectivityChange();
  document.dispatchEvent(mockEvent);
  expect(console.warn).toHaveBeenCalledWith('Shortcuts are disabled due to unstable internet connection.');
});