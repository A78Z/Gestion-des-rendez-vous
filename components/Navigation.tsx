'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@/types/appointment';

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Don't show navigation on login page
    if (pathname === '/login') {
        return null;
    }

    return (
        <nav className="bg-white shadow-md print:hidden">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex space-x-4">
                        {/* Show Secretary link only for Secretary */}
                        {user?.role === 'Secretary' && (
                            <Link
                                href="/secretaire"
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${pathname === '/secretaire'
                                        ? 'bg-fdcuic-blue text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Gestion des rendez-vous
                            </Link>
                        )}

                        {/* Show Director link for both roles */}
                        <Link
                            href="/directeur"
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${pathname === '/directeur'
                                    ? 'bg-fdcuic-blue text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Tableau de bord DG
                        </Link>
                    </div>

                    {/* User info and logout */}
                    {user && (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user.fullName} ({user.role === 'Secretary' ? 'Secrétaire' : 'Directeur'})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
