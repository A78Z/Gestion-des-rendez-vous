'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import AppointmentTable from '@/components/AppointmentTable';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { getAppointments, updateAppointmentStatus } from '@/lib/appointmentsBack4App';
import { subscribeToAppointments, unsubscribeFromAppointments } from '@/lib/liveQueries';
import { format, isToday, isFuture, isPast, parseISO, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DirecteurPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'upcoming' | 'past'>('all');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

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

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
        // Optimistic update
        const previousAppointments = [...appointments];
        setAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, statut: newStatus } : apt
        ));

        try {
            await updateAppointmentStatus(id, newStatus);
            // Live Query will confirm the update later
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut : ' + error.message);
            // Rollback on error
            setAppointments(previousAppointments);
        }
    };

    // Filter appointments
    const sortedAppointments = useMemo(() => {
        let filtered = appointments;
        const now = new Date();

        switch (filter) {
            case 'today':
                filtered = appointments.filter(apt => isToday(parseISO(apt.date)));
                break;
            case 'week':
                filtered = appointments.filter(apt => isSameWeek(parseISO(apt.date), now, { locale: fr }));
                break;
            case 'upcoming':
                filtered = appointments.filter(apt => isFuture(parseISO(apt.date + 'T' + apt.heure)));
                break;
            case 'past':
                filtered = appointments.filter(apt => isPast(parseISO(apt.date + 'T' + apt.heure)) && !isToday(parseISO(apt.date)));
                break;
        }

        return filtered.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.heure);
            const dateB = new Date(b.date + 'T' + b.heure);
            return filter === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        });
    }, [appointments, filter]);

    // Pagination logic
    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAppointments = sortedAppointments.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    // Statistics
    const stats = {
        total: sortedAppointments.length,
        validated: sortedAppointments.filter(a => a.statut === 'Validé').length,
        confirmed: sortedAppointments.filter(a => a.statut === 'Confirmé').length,
        pending: sortedAppointments.filter(a => a.statut === 'En attente' || a.statut === 'À valider').length,
        cancelled: sortedAppointments.filter(a => a.statut === 'Annulé').length,
        postponed: sortedAppointments.filter(a => a.statut === 'Reporté').length,
    };

    return (
        <ProtectedRoute requiredRole="Director">
            <div className="min-h-screen bg-gray-50 pb-8">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-10 print:hidden">
                    <div className="container mx-auto px-4 py-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Tableau de bord Directeur Général
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
                        </p>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 print:hidden">
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                                </div>
                                <Calendar className="text-gray-400" size={24} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Validés</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.validated}</p>
                                </div>
                                <CheckCircle className="text-purple-400" size={24} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Confirmés</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                                </div>
                                <CheckCircle className="text-green-400" size={24} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">À valider</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="text-yellow-400" size={24} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Annulés</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                                </div>
                                <XCircle className="text-red-400" size={24} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Reportés</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.postponed}</p>
                                </div>
                                <RefreshCw className="text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Filters and Pagination */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
                        {/* Filter buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setFilter('today')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'today'
                                    ? 'bg-fdcuic-blue text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Aujourd'hui
                            </button>
                            <button
                                onClick={() => setFilter('week')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'week'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Cette semaine
                            </button>
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                À venir
                            </button>
                            <button
                                onClick={() => setFilter('past')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'past'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Passés
                            </button>
                        </div>

                        {/* Pagination buttons */}
                        {sortedAppointments.length > 0 && (
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
                        )}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fdcuic-blue"></div>
                        </div>
                    ) : sortedAppointments.length > 0 ? (
                        <AppointmentTable
                            appointments={paginatedAppointments}
                            onStatusChange={handleStatusChange}
                            readOnly={false} // Director can change status
                            isDirector={true}
                        />
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Aucun rendez-vous</h3>
                            <p className="text-gray-500">Aucun rendez-vous ne correspond aux critères sélectionnés.</p>
                        </div>
                    )}
                </main>

                {/* Bottom Pagination */}
                {sortedAppointments.length > 0 && (
                    <div className="container mx-auto px-4 pb-8 print:hidden flex justify-center">
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
            </div>
        </ProtectedRoute>
    );
}
