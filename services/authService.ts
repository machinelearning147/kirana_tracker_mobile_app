import { User } from '../types';
import { db } from './db';

const USER_KEY = 'kirana_tracker_user';

export const signup = async (email: string, password: string): Promise<User> => {
    // In a real app, the password would be hashed and verified. Here we ignore it for simplicity.
    const existingUser = await db.users.get(email);
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }

    const newUser: User = { id: email, email };
    
    await db.users.add(newUser, email); // Add user to IndexedDB

    localStorage.setItem(USER_KEY, JSON.stringify(newUser)); // Maintain session
    return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
    const user = await db.users.get(email);
    // Mock password check
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user)); // Maintain session
    return user;
};

export const logout = () => {
    localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) as User : null;
};

export const updateUser = async (userData: Partial<Omit<User, 'id' | 'email'>>): Promise<User> => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        throw new Error('No user is currently logged in.');
    }
    
    const userToUpdate = await db.users.get(currentUser.email);
    if (!userToUpdate) {
        throw new Error('User not found in database.');
    }
    
    await db.users.update(currentUser.email, userData);
    
    const updatedUserSession: User = { ...currentUser, ...userData };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUserSession));
    
    return updatedUserSession;
};