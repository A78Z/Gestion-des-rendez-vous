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
        const checkAuth = () => {
            // Check if user is authenticated
            if (!isAuthenticated()) {
                router.push('/login');
                return;
            }

            // If a specific role is required, check it
            if (requiredRole) {
                const user = getCurrentUser();
                if (!user || user.role !== requiredRole) {
                    // Redirect to appropriate page based on user's actual role
                    if (user?.role === 'Secretary') {
                        router.push('/secretaire');
                    } else if (user?.role === 'Director') {
                        router.push('/directeur');
                    } else {
                        router.push('/login');
                    }
                    return;
                }
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, requiredRole]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
