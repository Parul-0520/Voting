import '@testing-library/jest-dom';

jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mSocket);
});

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};