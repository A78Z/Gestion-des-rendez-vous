'use client';

import { useState } from 'react';
import { addAppointment } from '@/lib/appointmentsBack4App';
import { AppointmentFormData } from '@/types/appointment';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';

// Données des rendez-vous à importer (à partir de novembre)
const appointmentsToImport: AppointmentFormData[] = [
    // Vendredi 07 novembre 2025
    {
        date: '2025-11-07',
        heure: '15:00',
        interlocuteur: 'KOCCGA (Tél: 77 832 12 46)',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },
    {
        date: '2025-11-07',
        heure: '16:00',
        interlocuteur: 'Papa Ousmane Sall (Tél: 78 110 59 92)',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },

    // Mardi 11 novembre 2025
    {
        date: '2025-11-11',
        heure: '17:00',
        interlocuteur: 'El Mohamed Kouta',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },

    // Jeudi 13 novembre 2025
    {
        date: '2025-11-13',
        heure: '17:00',
        interlocuteur: 'Vieux Ndiaye Gounass',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },
    {
        date: '2025-11-13',
        heure: '12:30',
        interlocuteur: 'Centre Culturel Blaise Senghor',
        motif: 'Invitation',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },

    // Vendredi 14 novembre 2025
    {
        date: '2025-11-14',
        heure: '16:00',
        interlocuteur: 'Agence Saphila',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },
    {
        date: '2025-11-14',
        heure: '17:00',
        interlocuteur: 'Collectif FaceOutfit',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },

    // Date non précisée (novembre) - utilise le 30 novembre par défaut
    {
        date: '2025-11-30',
        heure: '16:00',
        interlocuteur: 'Mr Thiame',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: 'Date à confirmer'
    },

    // Mercredi 07 janvier 2026 - Annulé
    {
        date: '2026-01-07',
        heure: '16:00',
        interlocuteur: '',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'Annulé',
        commentaires: 'Rendez-vous annulé'
    },

    // Jeudi 08 janvier 2026
    {
        date: '2026-01-08',
        heure: '16:00',
        duree: '1h',
        interlocuteur: 'DJ Taff / Mr Dione (Tél: 77 451 16 34)',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },

    // Mardi 13 janvier 2026
    {
        date: '2026-01-13',
        heure: '16:00',
        interlocuteur: 'Mr Kane / Kéba Seydi (Tél: 77 371 65 44)',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    },

    // Mercredi 14 janvier 2026
    {
        date: '2026-01-14',
        heure: '16:00',
        interlocuteur: 'Amadou Fall BA5545 / Mr Diallo',
        motif: 'Audience',
        lieu: 'FDCUIC',
        statut: 'À valider',
        commentaires: ''
    }
];

interface ImportResult {
    appointment: AppointmentFormData;
    status: 'pending' | 'success' | 'error';
    message?: string;
}

export default function ImportPage() {
    const [results, setResults] = useState<ImportResult[]>(
        appointmentsToImport.map(apt => ({ appointment: apt, status: 'pending' as const }))
    );
    const [importing, setImporting] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleImport = async () => {
        setImporting(true);
        setCompleted(false);

        for (let i = 0; i < appointmentsToImport.length; i++) {
            const apt = appointmentsToImport[i];

            try {
                await addAppointment(apt);
                setResults(prev => {
                    const newResults = [...prev];
                    newResults[i] = { ...newResults[i], status: 'success' };
                    return newResults;
                });
            } catch (error: any) {
                setResults(prev => {
                    const newResults = [...prev];
                    newResults[i] = {
                        ...newResults[i],
                        status: 'error',
                        message: error.message
                    };
                    return newResults;
                });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setImporting(false);
        setCompleted(true);
    };

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return (
        <ProtectedRoute requiredRole="Secretary">
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            📥 Import des rendez-vous
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Cette page permet d'importer les {appointmentsToImport.length} rendez-vous
                            à partir de novembre dans la base de données.
                        </p>

                        {!importing && !completed && (
                            <button
                                onClick={handleImport}
                                className="flex items-center gap-2 px-6 py-3 bg-fdcuic-blue text-white rounded-lg hover:bg-fdcuic-lightblue transition-colors font-semibold"
                            >
                                <Upload size={20} />
                                Lancer l'import
                            </button>
                        )}

                        {importing && (
                            <div className="flex items-center gap-2 text-fdcuic-blue">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Import en cours... ({successCount}/{appointmentsToImport.length})</span>
                            </div>
                        )}

                        {completed && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-green-800">✅ Import terminé</h3>
                                <p className="text-green-700">
                                    {successCount} rendez-vous importés avec succès.
                                    {errorCount > 0 && ` ${errorCount} erreur(s).`}
                                </p>
                            </div>
                        )}

                        {/* Results Table */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interlocuteur</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.map((result, index) => (
                                        <tr key={index} className={
                                            result.status === 'success' ? 'bg-green-50' :
                                                result.status === 'error' ? 'bg-red-50' : ''
                                        }>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {result.status === 'pending' && (
                                                    <span className="text-gray-400">⏳</span>
                                                )}
                                                {result.status === 'success' && (
                                                    <CheckCircle className="text-green-600" size={18} />
                                                )}
                                                {result.status === 'error' && (
                                                    <XCircle className="text-red-600" size={18} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {result.appointment.date}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {result.appointment.heure}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {result.appointment.interlocuteur || <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {result.appointment.motif}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
