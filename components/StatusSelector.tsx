'use client';

import { AppointmentStatus } from '@/types/appointment';
import { useState } from 'react';

interface StatusSelectorProps {
    currentStatus: AppointmentStatus;
    appointmentId: string;
    onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export default function StatusSelector({
    currentStatus,
    appointmentId,
    onStatusChange,
}: StatusSelectorProps) {
    const [isChanging, setIsChanging] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as AppointmentStatus;
        setIsChanging(true);

        try {
            await onStatusChange(appointmentId, newStatus);
            // Optional: Success feedback (can be annoying if frequent, but requested)
            // alert('Statut mis à jour avec succès !'); 
        } catch (error: any) {
            console.error('Error changing status:', error);
            alert('Erreur lors de la mise à jour du statut : ' + (error.message || 'Erreur inconnue'));
        } finally {
            setIsChanging(false);
        }
    };

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'Validé':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Confirmé':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'En attente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Annulé':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Reporté':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="relative">
            <select
                value={currentStatus}
                onChange={handleChange}
                disabled={isChanging}
                className={`
          px-3 py-1 rounded-full text-xs font-semibold border-2 cursor-pointer
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${getStatusColor(currentStatus)}
          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fdcuic-blue
        `}
            >
                <option value="Validé">Validé</option>
                <option value="Confirmé">Confirmé</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulé</option>
                <option value="Reporté">Reporté</option>
            </select>

            {isChanging && (
                <div className="absolute right-0 top-0 mt-1 mr-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-fdcuic-blue"></div>
                </div>
            )}
        </div>
    );
}
