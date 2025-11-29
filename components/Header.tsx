import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-white border-b-4 border-fdcuic-blue py-8 mb-8 print:mb-4">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="mb-4">
                        <Image
                            src="/logo-fdcuic.jpg"
                            alt="Logo FDCUIC"
                            width={120}
                            height={120}
                            className="rounded-lg"
                            priority
                        />
                    </div>

                    {/* Titre principal */}
                    <h1 className="text-2xl md:text-3xl font-bold text-fdcuic-blue mb-2">
                        FDCUIC
                    </h1>

                    {/* Nom complet */}
                    <p className="text-sm md:text-base text-gray-700 mb-1 max-w-2xl">
                        Fonds de Développement des Cultures Urbaines
                    </p>
                    <p className="text-sm md:text-base text-gray-700 mb-4 max-w-2xl">
                        et des Industries Créatives
                    </p>

                    {/* Ligne de séparation */}
                    <div className="w-48 h-1 bg-fdcuic-blue mb-4"></div>

                    {/* Sous-titre */}
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                        Gestion des rendez-vous du DG
                    </h2>
                </div>
            </div>
        </header>
    );
}
