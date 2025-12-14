import ExcelJS from 'exceljs';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const exportToExcel = async (appointments: Appointment[], fileName?: string) => {
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Gestion RDV DG';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Rendez-vous');

    // Defines columns
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Heure', key: 'heure', width: 12 },
        { header: 'Interlocuteur', key: 'interlocuteur', width: 30 },
        { header: 'Motif', key: 'motif', width: 45 },
        { header: 'Lieu', key: 'lieu', width: 25 },
        { header: 'Statut', key: 'statut', width: 15 },
        { header: 'Commentaires', key: 'commentaires', width: 40 },
    ];

    // Add Header Rows
    worksheet.spliceRows(1, 0,
        ['FDCUIC'],
        ['Fonds de Développement des Cultures Urbaines et des Industries Créatives'],
        ['Gestion des rendez-vous du DG'],
        [''],
        [`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`],
        ['']
    );

    // Merge Cells
    worksheet.mergeCells('A1:G1');
    worksheet.mergeCells('A2:G2');
    worksheet.mergeCells('A3:G3');
    worksheet.mergeCells('A5:G5');

    // Style the title rows
    const centerStyle: Partial<ExcelJS.Style> = {
        alignment: { horizontal: 'center', vertical: 'middle' },
        font: { bold: true, size: 12, name: 'Arial' }
    };

    worksheet.getCell('A1').style = { ...centerStyle, font: { ...centerStyle.font, size: 14 } };
    worksheet.getCell('A2').style = centerStyle;
    worksheet.getCell('A3').style = { ...centerStyle, font: { ...centerStyle.font, italic: true } };
    worksheet.getCell('A5').style = { alignment: { horizontal: 'left' }, font: { italic: true, size: 10 } };

    // Format headers
    const headerRow = worksheet.getRow(7);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Add data
    appointments.forEach((apt) => {
        worksheet.addRow([
            apt.date,
            apt.heure,
            apt.interlocuteur,
            apt.motif,
            apt.lieu,
            apt.statut,
            apt.commentaires,
        ]);
    });

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 7) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { wrapText: true, vertical: 'top' };
            });
        }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Download
    const finalFileName = fileName || `Rendez-vous_DG_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
