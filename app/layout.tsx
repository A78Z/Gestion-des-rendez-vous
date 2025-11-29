import type { Metadata } from "next";
import "./globals.css";
import "./print.css"; // Import print styles
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
    title: "Gestion des rendez-vous du DG - FDCUIC",
    description: "Système de gestion des rendez-vous du Directeur Général - Fonds de Développement des Cultures Urbaines et des Industries Créatives",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className="bg-gray-50 min-h-screen">
                <Navigation />
                <main>{children}</main>
            </body>
        </html>
    );
}
