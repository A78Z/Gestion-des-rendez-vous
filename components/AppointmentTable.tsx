'use client';

import StatusSelector from './StatusSelector';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Pencil, Trash2 } from 'lucide-react';

interface AppointmentTableProps {
    appointments: Appointment[];
    onEdit?: (appointment: Appointment) => void;
    onDelete?: (id: string) => void;
    onStatusChange?: (id: string, status: AppointmentStatus) => void;
    readOnly?: boolean;
    isDirector?: boolean;
    selectable?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    printSelectionOnly?: boolean;
}

export default function AppointmentTable({
    appointments,
    onEdit,
    onDelete,
    onStatusChange,
    readOnly = false,
    isDirector = false,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    printSelectionOnly = false
}: AppointmentTableProps) {
    // Create array of 25 rows (either with data or empty)
    const rows = Array.from({ length: 25 }, (_, index) => appointments[index] || null);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked && onSelectionChange) {
            onSelectionChange(appointments.map(a => a.id));
        } else if (onSelectionChange) {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'Validé':
                return 'bg-purple-100 text-purple-800';
            case 'Confirmé':
                return 'bg-green-100 text-green-800';
            case 'En attente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Annulé':
                return 'bg-red-100 text-red-800';
            case 'Reporté':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-fdcuic-blue text-white">
                        {selectable && (
                            <th className="px-4 py-3 text-center font-bold border-r border-white w-10 print:hidden">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    checked={appointments.length > 0 && selectedIds.length === appointments.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        )}
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Date</th>
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Heure</th>
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Interlocuteur</th>
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Motif / Objet du rendez-vous</th>
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Lieu</th>
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Statut</th>
                        <th className="px-4 py-3 text-left font-bold border-r border-white">Commentaires / Préparation</th>
                        {!readOnly && (
                            <th className="px-4 py-3 text-center font-bold print:hidden">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((appointment, index) => {
                        const isSelected = appointment ? selectedIds.includes(appointment.id) : false;
                        // Hide row in print mode if we are printing selection only and this row is NOT selected
                        // OR if it's an empty row (optional, but cleaner for "Print Selection")
                        // Actually, user said "keep layout exactly as now", so empty rows might be needed to fill page?
                        // But "Imprimer la sélection" usually implies a list of selected items.
                        // Let's hide unselected items. Empty rows should probably remain if we want to keep the "table" look, 
                        // but if we print 2 items, do we want 23 empty rows? Probably not for "Selection".
                        // However, the user said "La mise en page PDF et impression doit rester exactement comme maintenant".
                        // Let's assume hiding unselected rows is the goal.
                        const isHiddenForPrint = printSelectionOnly && !isSelected && appointment !== null;

                        return (
                            <tr
                                key={appointment?.id || `empty-${index}`}
                                className={`
                border-b border-gray-200
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                ${appointment ? 'hover:bg-blue-50' : ''}
                transition-colors
                ${isHiddenForPrint ? 'print:hidden' : ''}
              `}
                            >
                                {selectable && (
                                    <td className="px-4 py-3 border-r border-gray-200 text-center print:hidden">
                                        {appointment && (
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                checked={isSelected}
                                                onChange={() => handleSelectOne(appointment.id)}
                                            />
                                        )}
                                    </td>
                                )}
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment?.date || ''}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment?.heure || ''}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment?.interlocuteur || ''}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment?.motif || ''}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment?.lieu || ''}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment && (
                                        isDirector && onStatusChange ? (
                                            <StatusSelector
                                                currentStatus={appointment.statut}
                                                appointmentId={appointment.id}
                                                onStatusChange={onStatusChange}
                                            />
                                        ) : (
                                            <span className={`
                                            px-3 py-1 rounded-full text-xs font-semibold
                                            ${getStatusColor(appointment.statut)}
                                        `}>
                                                {appointment.statut}
                                            </span>
                                        )
                                    )}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {appointment?.commentaires || ''}
                                </td>
                                {!readOnly && (
                                    <td className="px-4 py-3 text-center print:hidden">
                                        {appointment && onEdit && onDelete && (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => onEdit(appointment)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(appointment.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
