/**
 * Script d'import des rendez-vous du DG
 * À exécuter avec: node scripts/import-appointments.cjs
 */

const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
    process.env.PARSE_APP_ID || 'NnQP2PMl2U9O2u82xzZC8HN0qQQWnRLK8HgUXmle',
    process.env.PARSE_JS_KEY || 'FN6llR4kRJv0MACz75FTNVIQoZvEMNrwkKmRdOLe'
);
Parse.serverURL = process.env.PARSE_SERVER_URL || 'https://parseapi.back4app.com';

// Données des rendez-vous à importer (à partir de novembre)
const appointmentsToImport = [
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

    // Jeudi 08 janvier 2026 (corrigé - le 07 janvier 2026 est un mercredi)
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

async function importAppointments() {
    console.log('🚀 Démarrage de l\'import des rendez-vous...\n');

    const Appointment = Parse.Object.extend('Appointment');
    let successCount = 0;
    let errorCount = 0;

    for (const data of appointmentsToImport) {
        try {
            // Vérifier si le rendez-vous existe déjà (doublon)
            const query = new Parse.Query(Appointment);
            query.equalTo('date', data.date);
            query.equalTo('heure', data.heure);
            query.equalTo('interlocuteur', data.interlocuteur);

            const existing = await query.first();

            if (existing) {
                console.log(`⏭️  Doublon ignoré: ${data.date} ${data.heure} - ${data.interlocuteur}`);
                continue;
            }

            // Créer le rendez-vous
            const appointment = new Appointment();
            appointment.set('date', data.date);
            appointment.set('heure', data.heure);
            appointment.set('interlocuteur', data.interlocuteur);
            appointment.set('motif', data.motif);
            appointment.set('lieu', data.lieu);
            appointment.set('statut', data.statut);
            appointment.set('commentaires', data.commentaires);

            if (data.duree) {
                appointment.set('duree', data.duree);
            }

            // Set ACL - Public read, roles can write
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setRoleWriteAccess('Secretary', true);
            acl.setRoleWriteAccess('Secretaire', true);
            acl.setRoleWriteAccess('Director', true);
            acl.setRoleWriteAccess('Directeur', true);
            acl.setRoleWriteAccess('Admin', true);
            appointment.setACL(acl);

            await appointment.save();
            successCount++;
            console.log(`✅ Importé: ${data.date} ${data.heure} - ${data.interlocuteur || '(sans interlocuteur)'}`);
        } catch (error) {
            errorCount++;
            console.error(`❌ Erreur: ${data.date} ${data.heure} - ${error.message}`);
        }
    }

    console.log('\n📊 Résumé de l\'import:');
    console.log(`   ✅ ${successCount} rendez-vous importés`);
    console.log(`   ❌ ${errorCount} erreurs`);
    console.log(`   📅 Total traités: ${appointmentsToImport.length}`);
}

// Exécuter l'import
importAppointments()
    .then(() => {
        console.log('\n✨ Import terminé!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Erreur fatale:', error);
        process.exit(1);
    });
