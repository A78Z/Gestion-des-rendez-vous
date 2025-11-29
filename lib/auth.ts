import Parse from '@/lib/parse';
import { User, UserRole } from '@/types/appointment';

/**
 * Login user with username and password
 */
export const login = async (username: string, password: string): Promise<User> => {
    try {
        const user = await Parse.User.logIn(username, password);

        return {
            id: user.id || '',
            username: user.get('username'),
            role: user.get('role') as UserRole,
            fullName: user.get('fullName') || username,
        };
    } catch (error: any) {
        throw new Error(error.message || 'Login failed');
    }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
    try {
        await Parse.User.logOut();
    } catch (error: any) {
        throw new Error(error.message || 'Logout failed');
    }
};

/**
 * Get current logged in user
 */
export const getCurrentUser = (): User | null => {
    const currentUser = Parse.User.current();

    if (!currentUser) {
        return null;
    }

    return {
        id: currentUser.id || '',
        username: currentUser.get('username'),
        role: currentUser.get('role') as UserRole,
        fullName: currentUser.get('fullName') || currentUser.get('username'),
    };
};

/**
 * Check if current user has required role
 */
export const checkRole = (requiredRole: UserRole): boolean => {
    const user = getCurrentUser();
    return user?.role === requiredRole;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return Parse.User.current() !== null;
};
