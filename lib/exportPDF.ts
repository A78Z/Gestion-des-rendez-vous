import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Function to load image as base64
const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
};

export const exportToPDF = async (appointments: Appointment[]) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    try {
        // Load and add logo
        const logoBase64 = await loadImageAsBase64('/logo-fdcuic.jpg');
        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = 148 - (logoWidth / 2); // Center horizontally
        const logoY = 10;

        doc.addImage(logoBase64, 'JPEG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        console.error('Error loading logo:', error);
        // Continue without logo if it fails to load
    }

    // Add header text (moved down to accommodate logo)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FDCUIC', 148, 42, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Fonds de Développement des Cultures Urbaines', 148, 49, { align: 'center' });
    doc.text('et des Industries Créatives', 148, 54, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Gestion des rendez-vous du DG', 148, 64, { align: 'center' });

    // Add horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 70, 277, 70);

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

    // Add table
    autoTable(doc, {
        head: [['Date', 'Heure', 'Interlocuteur', 'Motif / Objet', 'Lieu', 'Statut', 'Commentaires']],
        body: tableData,
        startY: 77,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            font: 'helvetica',
        },
        headStyles: {
            fillColor: [0, 71, 187], // FDCUIC blue
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 40 },
            3: { cellWidth: 60 },
            4: { cellWidth: 35 },
            5: { cellWidth: 30 },
            6: { cellWidth: 'auto' },
        },
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const footerText = `Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })} - Page ${i}/${pageCount}`;
        doc.text(footerText, 148, 200, { align: 'center' });
    }

    // Save the PDF
    const fileName = `Rendez-vous_DG_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
};

