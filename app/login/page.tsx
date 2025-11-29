'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import Image from 'next/image';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(username, password);

            // Redirect based on role
            if (user.role === 'Secretary') {
                router.push('/secretaire');
            } else if (user.role === 'Director') {
                router.push('/directeur');
            } else {
                setError('Rôle utilisateur non reconnu');
            }
        } catch (err: any) {
            setError(err.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-fdcuic-blue to-fdcuic-lightblue flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <Image
                            src="/logo-fdcuic.jpg"
                            alt="Logo FDCUIC"
                            width={100}
                            height={100}
                            className="rounded-lg"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-fdcuic-blue mb-2">
                        FDCUIC
                    </h1>
                    <p className="text-sm text-gray-600">
                        Gestion des rendez-vous du DG
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent transition-all"
                            placeholder="Entrez votre nom d'utilisateur"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent transition-all"
                            placeholder="Entrez votre mot de passe"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-fdcuic-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-fdcuic-lightblue transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Connexion...</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Se connecter</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Fonds de Développement des Cultures Urbaines</p>
                    <p>et des Industries Créatives</p>
                </div>
            </div>
        </div>
    );
}
