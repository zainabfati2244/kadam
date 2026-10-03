import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staging-ecom-admin-qge2.encr.app';

export const AUTH_STORAGE_KEYS = {
  accessToken: '@kadam_auth_access_token',
  refreshToken: '@kadam_auth_refresh_token',
  role: '@kadam_auth_role',
  user: '@kadam_auth_user',
};

export type AuthUser = {
  id: string | number | null;
  email: string;
  fullName?: string | null;
  role?: string | null;
  username?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type LoginResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: 'admin' | 'customer';
  user: AuthUser;
  token?: string;
  email?: string;
};

export type RegisterResponse = LoginResponse;

export type MessageResponse = {
  message: string;
};

export type UserProfileResponse = AuthUser;

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  role: 'admin' | 'customer';
  user: AuthUser;
};

type ApiErrorResponse = {
  code?: string;
  message?: string;
  details?: any;
};

const TOKEN_STORAGE_KEY = AUTH_STORAGE_KEYS.accessToken;

/** Generic HTTP Request Helper for Custom Encore API */
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, any>,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data: T | ApiErrorResponse | null = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      (data as ApiErrorResponse)?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const authApi = {
  async saveSession(session: AuthSession): Promise<void> {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken);
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken);
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.role, session.role);
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user));
  },

  async getStoredSession(): Promise<AuthSession | null> {
    const [accessToken, refreshToken, role, userData] = await Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken),
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.refreshToken),
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.role),
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.user),
    ]);

    if (!accessToken || !refreshToken || !role || !userData) {
      return null;
    }

    try {
      return {
        accessToken,
        refreshToken,
        role: role === 'admin' ? 'admin' : 'customer',
        user: JSON.parse(userData) as AuthUser,
      };
    } catch {
      return null;
    }
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshTokenValue = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
    if (!refreshTokenValue) {
      throw new Error('No refresh token found');
    }

    const data = await request<LoginResponse>('/auth/refresh-token', 'POST', {
      refreshToken: refreshTokenValue,
    });

    const accessToken = data.accessToken || data.token;
    if (!accessToken || !data.refreshToken) {
      throw new Error('Refresh token response missing token data');
    }

    await authApi.saveSession({
      accessToken,
      refreshToken: data.refreshToken,
      role: data.role || 'customer',
      user: data.user || {
        id: null,
        email: '',
      },
    });

    return data;
  },

  /** 1. POST /auth/register */
  async register(
    email: string,
    password: string,
    fullName?: string,
    username?: string,
    phone?: string
  ): Promise<RegisterResponse> {
    const normalizedFullName = (fullName || email.split('@')[0] || 'Customer').trim();
    const normalizedUsername = (username || normalizedFullName).trim();

    const response = await request<RegisterResponse>('/auth/register', 'POST', {
      email: email.trim(),
      password,
      fullName: normalizedFullName,
      username: normalizedUsername,
      phone: phone ?? '',
    });

    const accessToken = response.accessToken || response.token;
    if (accessToken && response.refreshToken) {
      await authApi.saveSession({
        accessToken,
        refreshToken: response.refreshToken,
        role: response.role || 'customer',
        user: response.user || {
          id: null,
          email: email.trim(),
          fullName: normalizedFullName,
          username: normalizedUsername,
          phone: phone ?? '',
        },
      });
    }

    return response;
  },

  /** 2. POST /auth/login */
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>('/auth/login', 'POST', {
      email: email.trim(),
      password,
    });
    const accessToken = data.accessToken || data.token;
    if (accessToken && data.refreshToken) {
      await authApi.saveSession({
        accessToken,
        refreshToken: data.refreshToken,
        role: data.role || 'customer',
        user: data.user || {
          id: null,
          email: email.trim(),
        },
      });
    }
    return data;
  },

  /** 3. POST /auth/forgot-password */
  async forgotPassword(email: string): Promise<MessageResponse> {
    return request<MessageResponse>('/auth/forgot-password', 'POST', {
      email: email.trim(),
    });
  },

  /** 4. POST /auth/reset-password */
  async resetPassword(
    email: string,
    newPassword: string,
    otp: string
  ): Promise<MessageResponse> {
    return request<MessageResponse>('/auth/reset-password', 'POST', {
      email: email.trim(),
      newPassword,
      otp: otp.trim(),
    });
  },

  /** 5. GET /auth/me */
  async getMe(token?: string): Promise<UserProfileResponse> {
    const activeToken = token || (await AsyncStorage.getItem(TOKEN_STORAGE_KEY));
    if (!activeToken) {
      throw new Error('Unauthenticated user');
    }
    return request<UserProfileResponse>('/auth/me', 'GET', undefined, activeToken);
  },

  /** 6. POST /auth/profile/change-password */
  async changePassword(
    oldPassword: string,
    newPassword: string,
    token?: string
  ): Promise<MessageResponse> {
    const activeToken = token || (await AsyncStorage.getItem(TOKEN_STORAGE_KEY));
    if (!activeToken) {
      throw new Error('Unauthenticated user');
    }
    return request<MessageResponse>(
      '/auth/profile/change-password',
      'POST',
      { oldPassword, newPassword },
      activeToken
    );
  },

  /** Token helper methods */
  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  },

  async getStoredRole(): Promise<'admin' | 'customer' | null> {
    const role = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.role);
    return role === 'admin' || role === 'customer' ? role : null;
  },

  async logout(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.accessToken),
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken),
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.role),
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.user),
    ]);
  },
};
