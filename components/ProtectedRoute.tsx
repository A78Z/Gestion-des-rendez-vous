'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { UserRole } from '@/types/appointment';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Small delay to ensure Parse SDK session is loaded
            await new Promise(resolve => setTimeout(resolve, 50));

            try {
                // Check if user is authenticated
                if (!isAuthenticated()) {
                    router.replace('/login');
                    return;
                }

                const user = getCurrentUser();

                // If a specific role is required, check it
                if (requiredRole && user?.role !== requiredRole) {
                    // Redirect to appropriate page based on user's actual role
                    if (user?.role === 'Secretary') {
                        router.replace('/secretaire');
                    } else if (user?.role === 'Director') {
                        router.replace('/directeur');
                    } else {
                        router.replace('/login');
                    }
                    return;
                }

                setAuthorized(true);
            } catch (error) {
                console.error('Auth check error:', error);
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, requiredRole]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirection...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

