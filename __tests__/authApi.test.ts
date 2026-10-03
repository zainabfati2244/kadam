import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('authApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('stores the access token returned by the login response', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Signed in successfully.',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        role: 'customer',
        user: {
          id: 1,
          email: 'user@example.com',
          fullName: 'User Name',
          role: 'customer',
          username: 'user',
          phone: '1234567890',
          avatarUrl: null,
        },
      }),
    });
    (globalThis as any).fetch = fetchMock as any;

    const result = await authApi.login('user@example.com', 'Password123');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password123',
        }),
      })
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@kadam_auth_access_token', 'access-token-123');
    expect(result.accessToken).toBe('access-token-123');
    expect(result.refreshToken).toBe('refresh-token-456');
  });

  it('includes the required registration profile fields', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Account created successfully.',
        role: 'customer',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        user: {
          id: 3,
          email: 'user@example.com',
          fullName: 'user',
          role: 'customer',
          username: 'user',
          phone: '',
          avatarUrl: null,
        },
      }),
    });
    (globalThis as any).fetch = fetchMock as any;

    await authApi.register('user@example.com', 'Password123');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password123',
          fullName: 'user',
          username: 'user',
          phone: '',
        }),
      })
    );
  });

  it('refreshes an expired access token and stores the rotated session', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('refresh-token-old');
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Access token refreshed successfully.',
        accessToken: 'access-token-new',
        refreshToken: 'refresh-token-new',
        expiresIn: 3600,
        role: 'admin',
        user: { id: 1, email: 'admin@example.com', role: 'admin' },
      }),
    });
    (globalThis as any).fetch = fetchMock as any;

    const result = await authApi.refreshToken();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh-token'),
      expect.objectContaining({ body: JSON.stringify({ refreshToken: 'refresh-token-old' }) })
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@kadam_auth_access_token', 'access-token-new');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@kadam_auth_refresh_token', 'refresh-token-new');
    expect(result.role).toBe('admin');
  });
});
