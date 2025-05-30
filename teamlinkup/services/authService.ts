
import { User } from '../types';
import { getItem, setItem, removeItem } from './storageService';
import { MOCK_API_DELAY } from '../constants';

const USERS_KEY = 'mock_users';
const CURRENT_USER_KEY = 'mock_current_user';

// In a real app, passwords would be hashed. This is a mock.
const getMockUsers = (): User[] => getItem<User[]>(USERS_KEY) || [];
const saveMockUsers = (users: User[]): void => setItem(USERS_KEY, users);

export const login = (email: string, _pass: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.email === email); // Simplified: no password check for mock
      if (user) {
        setItem(CURRENT_USER_KEY, user);
        resolve(user);
      } else {
        reject(new Error('Invalid credentials or user not found.'));
      }
    }, MOCK_API_DELAY);
  });
};

export const register = (email: string, _pass: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let users = getMockUsers();
      if (users.some(u => u.email === email)) {
        reject(new Error('User with this email already exists.'));
        return;
      }
      const newUser: User = { id: Date.now().toString(), email };
      users.push(newUser);
      saveMockUsers(users);
      setItem(CURRENT_USER_KEY, newUser);
      resolve(newUser);
    }, MOCK_API_DELAY);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      removeItem(CURRENT_USER_KEY);
      resolve();
    }, MOCK_API_DELAY / 2);
  });
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getItem<User>(CURRENT_USER_KEY);
      resolve(user);
    }, MOCK_API_DELAY / 3);
  });
};
