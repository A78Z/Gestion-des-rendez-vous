'use client';

import { useState, useEffect } from 'react';
import { Appointment, AppointmentFormData, AppointmentStatus } from '@/types/appointment';
import { X } from 'lucide-react';

interface AppointmentFormProps {
    appointment?: Appointment | null;
    onSubmit: (data: AppointmentFormData) => void;
    onCancel: () => void;
}

export default function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
    const [formData, setFormData] = useState<AppointmentFormData>({
        date: '',
        heure: '',
        duree: '',
        interlocuteur: '',
        motif: '',
        lieu: '',
        statut: 'À valider',
        commentaires: '',
    });

    useEffect(() => {
        if (appointment) {
            setFormData({
                date: appointment.date,
                heure: appointment.heure,
                duree: appointment.duree || '',
                interlocuteur: appointment.interlocuteur,
                motif: appointment.motif,
                lieu: appointment.lieu,
                statut: appointment.statut,
                commentaires: appointment.commentaires,
            });
        }
    }, [appointment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-fdcuic-blue text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-fdcuic-lightblue rounded transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                            />
                        </div>

                        {/* Heure */}
                        <div>
                            <label htmlFor="heure" className="block text-sm font-semibold text-gray-700 mb-1">
                                Heure <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="heure"
                                name="heure"
                                value={formData.heure}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                            />
                        </div>

                        {/* Durée (optionnel) */}
                        <div>
                            <label htmlFor="duree" className="block text-sm font-semibold text-gray-700 mb-1">
                                Durée
                            </label>
                            <input
                                type="text"
                                id="duree"
                                name="duree"
                                value={formData.duree || ''}
                                onChange={handleChange}
                                placeholder="Ex: 1h, 30min"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Interlocuteur */}
                    <div>
                        <label htmlFor="interlocuteur" className="block text-sm font-semibold text-gray-700 mb-1">
                            Interlocuteur <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="interlocuteur"
                            name="interlocuteur"
                            value={formData.interlocuteur}
                            onChange={handleChange}
                            required
                            placeholder="Nom de l'interlocuteur"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                        />
                    </div>

                    {/* Motif */}
                    <div>
                        <label htmlFor="motif" className="block text-sm font-semibold text-gray-700 mb-1">
                            Motif / Objet du rendez-vous <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="motif"
                            name="motif"
                            value={formData.motif}
                            onChange={handleChange}
                            required
                            rows={2}
                            placeholder="Objet du rendez-vous"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                        />
                    </div>

                    {/* Lieu */}
                    <div>
                        <label htmlFor="lieu" className="block text-sm font-semibold text-gray-700 mb-1">
                            Lieu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="lieu"
                            name="lieu"
                            value={formData.lieu}
                            onChange={handleChange}
                            required
                            placeholder="Lieu du rendez-vous"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                        />
                    </div>

                    {/* Statut */}
                    <div>
                        <label htmlFor="statut" className="block text-sm font-semibold text-gray-700 mb-1">
                            Statut <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="statut"
                            name="statut"
                            value={formData.statut}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                        >
                            <option value="À valider">À valider</option>
                            <option value="Validé">Validé</option>
                            <option value="Confirmé">Confirmé</option>
                            <option value="En attente">En attente</option>
                            <option value="Annulé">Annulé</option>
                            <option value="Reporté">Reporté</option>
                        </select>
                    </div>

                    {/* Commentaires */}
                    <div>
                        <label htmlFor="commentaires" className="block text-sm font-semibold text-gray-700 mb-1">
                            Commentaires / Préparation
                        </label>
                        <textarea
                            id="commentaires"
                            name="commentaires"
                            value={formData.commentaires}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Notes, préparation nécessaire..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fdcuic-blue focus:border-transparent"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-fdcuic-blue text-white rounded-md hover:bg-fdcuic-lightblue transition-colors font-semibold"
                        >
                            {appointment ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
