import * as XLSX from 'xlsx';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const exportToExcel = (appointments: Appointment[]) => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare header data
    const headerData = [
        ['FDCUIC'],
        ['Fonds de Développement des Cultures Urbaines et des Industries Créatives'],
        ['Gestion des rendez-vous du DG'],
        [''],
        [`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`],
        [''],
    ];

    // Prepare table headers
    const tableHeaders = [
        ['Date', 'Heure', 'Interlocuteur', 'Motif / Objet du rendez-vous', 'Lieu', 'Statut', 'Commentaires / Préparation'],
    ];

    // Prepare table data
    const tableData = appointments.map(apt => [
        apt.date,
        apt.heure,
        apt.interlocuteur,
        apt.motif,
        apt.lieu,
        apt.statut,
        apt.commentaires,
    ]);

    // Combine all data
    const wsData = [...headerData, ...tableHeaders, ...tableData];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 12 },  // Date
        { wch: 10 },  // Heure
        { wch: 25 },  // Interlocuteur
        { wch: 40 },  // Motif
        { wch: 20 },  // Lieu
        { wch: 15 },  // Statut
        { wch: 35 },  // Commentaires
    ];

    // Merge cells for header
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // FDCUIC
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Full name
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Subtitle
        { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } }, // Generated date
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Rendez-vous');

    // Generate file name
    const fileName = `Rendez-vous_DG_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
};
