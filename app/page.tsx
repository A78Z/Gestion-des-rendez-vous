'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

export default function Home() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Small delay to ensure Parse SDK is initialized
        const timer = setTimeout(() => {
            try {
                if (!isAuthenticated()) {
                    router.replace('/login');
                    return;
                }

                const user = getCurrentUser();
                if (user?.role === 'Secretary') {
                    router.replace('/secretaire');
                } else if (user?.role === 'Director') {
                    router.replace('/directeur');
                } else {
                    router.replace('/login');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                router.replace('/login');
            } finally {
                setChecking(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
            </div>
        </div>
    );
}

