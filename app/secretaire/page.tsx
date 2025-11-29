'use client';

import { useState, useEffect } from 'react';
import { Plus, FileDown, FileSpreadsheet, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentTable from '@/components/AppointmentTable';
import { Appointment, AppointmentFormData } from '@/types/appointment';
import {
    getAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fixAllACLs,
    fixRolesAndPermissions
} from '@/lib/appointmentsBack4App';
import { subscribeToAppointments, unsubscribeFromAppointments } from '@/lib/liveQueries';
import { exportToPDF } from '@/lib/exportPDF';
import * as XLSX from 'xlsx';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SecretairePage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [printSelectionOnly, setPrintSelectionOnly] = useState(false);

    // ... (existing useEffects)

    // Initial fetch and subscription
    useEffect(() => {
        let subscription: any = null;

        const fetchAndSubscribe = async () => {
            try {
                setLoading(true);
                // Initial fetch
                const data = await getAppointments();
                setAppointments(data);
                setLoading(false);

                // Subscribe to real-time updates
                subscription = await subscribeToAppointments((updatedAppointments) => {
                    setAppointments(updatedAppointments);
                });
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError('Erreur lors du chargement des rendez-vous');
                setLoading(false);
            }
        };

        fetchAndSubscribe();

        return () => {
            if (subscription) {
                unsubscribeFromAppointments(subscription);
            }
        };
    }, []);

    // Reset selection when page changes
    useEffect(() => {
        setSelectedIds([]);
    }, [currentPage]);

    const handleAddAppointment = async (formData: AppointmentFormData) => {
        try {
            // Optimistic update (temporary ID until server confirms)
            const tempId = 'temp-' + Date.now();
            const newAppointment: Appointment = {
                id: tempId,
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setAppointments(prev => [newAppointment, ...prev]);
            setIsFormOpen(false);

            await addAppointment(formData);
            // Live Query will replace the temp item with the real one
        } catch (err) {
            console.error('Error adding appointment:', err);
            alert('Erreur lors de la création du rendez-vous');
            // Rollback handled by next fetch or LiveQuery correction
        }
    };

    const handleUpdateAppointment = async (formData: AppointmentFormData) => {
        if (!editingAppointment) return;

        const previousAppointments = [...appointments];
        // Optimistic update
        setAppointments(prev => prev.map(apt =>
            apt.id === editingAppointment.id ? { ...apt, ...formData } : apt
        ));
        setIsFormOpen(false);
        setEditingAppointment(null);

        try {
            await updateAppointment(editingAppointment.id, formData);
        } catch (err) {
            console.error('Error updating appointment:', err);
            alert('Erreur lors de la modification du rendez-vous');
            // Rollback
            setAppointments(previousAppointments);
        }
    };

    const handleDeleteAppointment = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
            // Optimistic update
            const previousAppointments = [...appointments];
            setAppointments(prev => prev.filter(a => a.id !== id));

            try {
                await deleteAppointment(id);
                // Success feedback could be added here if needed, but the optimistic update makes it feel instant.
                // Live Query will confirm the deletion (or we just keep the local state).
            } catch (err) {
                console.error('Error deleting appointment:', err);
                alert('Erreur lors de la suppression du rendez-vous. Veuillez vérifier vos permissions.');
                // Rollback
                setAppointments(previousAppointments);
            }
        }
    };

    const handleExportExcel = (selectionOnly = false) => {
        const dataToExport = selectionOnly && selectedIds.length > 0
            ? appointments.filter(a => selectedIds.includes(a.id))
            : appointments;

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rendez-vous");
        XLSX.writeFile(wb, selectionOnly ? "selection-rendez-vous.xlsx" : "rendez-vous-dg.xlsx");
    };

    const handleExportPDF = async (selectionOnly = false) => {
        const dataToExport = selectionOnly && selectedIds.length > 0
            ? appointments.filter(a => selectedIds.includes(a.id))
            : appointments;
        await exportToPDF(dataToExport);
    };

    const handlePrint = (selectionOnly = false) => {
        if (selectionOnly && selectedIds.length > 0) {
            setPrintSelectionOnly(true);
            // Allow state to update before printing
            setTimeout(() => {
                window.print();
                setPrintSelectionOnly(false);
            }, 100);
        } else {
            window.print();
        }
    };

    // Pagination logic
    const itemsPerPage = 15;
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAppointments = appointments.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    return (
        <ProtectedRoute requiredRole="Secretary">
            <div className="min-h-screen bg-gray-50 pb-8">
                {/* ... (Header) ... */}

                {/* Print Header (Visible only when printing) */}
                <div className="hidden print:flex flex-col items-center justify-center mb-8">
                    <div className="mb-4">
                        <img
                            src="/logo-fdcuic.jpg"
                            alt="Logo FDCUIC"
                            className="h-24 w-auto object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-black">FDCUIC</h1>
                    <h2 className="text-xl text-center text-black">Gestion des rendez-vous du DG</h2>
                    <div className="w-full h-px bg-black my-4"></div>
                </div>

                <main className="container mx-auto px-4 py-8">
                    {/* Actions Bar */}
                    <div className="mb-6 flex flex-wrap gap-4 justify-center sm:justify-end print:hidden">
                        {/* Standard Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExportPDF(false)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                <FileDown size={20} />
                                <span>Exporter PDF</span>
                            </button>
                            <button
                                onClick={() => handleExportExcel(false)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <FileSpreadsheet size={20} />
                                <span>Exporter Excel</span>
                            </button>
                        </div>

                        {/* Selection Actions */}
                        {selectedIds.length > 0 && (
                            <div className="flex gap-2 border-l pl-4 border-gray-300">
                                <button
                                    onClick={() => handleExportPDF(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                                >
                                    <FileDown size={20} />
                                    <span>PDF (Sélection)</span>
                                </button>
                                <button
                                    onClick={() => handleExportExcel(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors shadow-sm"
                                >
                                    <FileSpreadsheet size={20} />
                                    <span>Excel (Sélection)</span>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={async () => {
                                if (confirm('Voulez-vous réparer les Rôles et Permissions ? Cela peut prendre quelques secondes.')) {
                                    try {
                                        setLoading(true);
                                        const log = await fixRolesAndPermissions();
                                        alert('Réparation terminée :\n' + log);
                                    } catch (err: any) {
                                        alert('Erreur : ' + err.message);
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm w-full sm:w-auto"
                        >
                            <span>Réparer Permissions (Complet)</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue"></div>
                        </div>
                    ) : (
                        <>
                            {/* Top Pagination Controls (Optional, but good for consistency) */}
                            {appointments.length > 0 && (
                                <div className="flex justify-end mb-4 print:hidden">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                            className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${currentPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-fdcuic-blue text-white hover:bg-fdcuic-lightblue'
                                                }`}
                                        >
                                            <ChevronLeft size={20} />
                                            <span className="hidden sm:inline ml-1">Précédent</span>
                                        </button>

                                        <span className="text-sm text-gray-600 px-2 font-medium">
                                            Page {currentPage} / {totalPages || 1}
                                        </span>

                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${currentPage === totalPages || totalPages === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-fdcuic-blue text-white hover:bg-fdcuic-lightblue'
                                                }`}
                                        >
                                            <span className="hidden sm:inline mr-1">Suivant</span>
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Appointments Table */}
                            <AppointmentTable
                                appointments={paginatedAppointments}
                                onEdit={(apt) => {
                                    setEditingAppointment(apt);
                                    setIsFormOpen(true);
                                }}
                                onDelete={handleDeleteAppointment}
                                selectable={true}
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                                printSelectionOnly={printSelectionOnly}
                            />

                            {/* Bottom Pagination Controls */}
                            {appointments.length > 0 && (
                                <div className="flex justify-center mt-6 print:hidden">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                            className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${currentPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-fdcuic-blue text-white hover:bg-fdcuic-lightblue'
                                                }`}
                                        >
                                            <ChevronLeft size={20} />
                                            <span className="hidden sm:inline ml-1">Précédent</span>
                                        </button>

                                        <span className="text-sm text-gray-600 px-2 font-medium">
                                            Page {currentPage} / {totalPages || 1}
                                        </span>

                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${currentPage === totalPages || totalPages === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-fdcuic-blue text-white hover:bg-fdcuic-lightblue'
                                                }`}
                                        >
                                            <span className="hidden sm:inline mr-1">Suivant</span>
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Modal Form */}
                {isFormOpen && (
                    <AppointmentForm
                        appointment={editingAppointment}
                        onSubmit={editingAppointment ? handleUpdateAppointment : handleAddAppointment}
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingAppointment(null);
                        }}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
