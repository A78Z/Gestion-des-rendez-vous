'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        const user = getCurrentUser();
        if (user?.role === 'Secretary') {
            router.push('/secretaire');
        } else if (user?.role === 'Director') {
            router.push('/directeur');
        } else {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Redirection...</p>
            </div>
        </div>
    );
}
