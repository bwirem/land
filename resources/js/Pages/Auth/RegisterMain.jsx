import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLifeRing, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function RegisterMain({ auth }) {
    return (
        <>
            <Head title="Welcome to SysPos" />
            <div className="relative min-h-screen flex items-center justify-center bg-black text-white">
                {/* Background Image */}
                <img
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    src="/img/register.jpg"
                    alt="Background"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-60 z-10" />

                {/* Main Container */}
                <div className="relative z-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-500 drop-shadow-lg">
                            Registration
                        </h1>
                    </header>

                    <main className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {/* LANDOWNER */}
                        <RegisterCard
                            title="Land Owner"
                            description="Register as a Land Owner."
                            icon={faShieldAlt}
                            color="blue"
                            href={route("registerlandowner")}
                        />

                        {/* INVESTOR */}
                        <RegisterCard
                            title="Investor"
                            description="Register as an Investor."
                            icon={faLifeRing}
                            color="emerald"
                            href={route("registerinvestor")}
                        />

                        {/* ADMIN */}
                        <RegisterCard
                            title="Administrator"
                            description="Register as an Administrator."
                            icon={faShieldAlt}
                            color="rose"
                            href={route("registeradmin")}
                        />
                    </main>

                    <footer className="mt-16 text-center text-sm text-white/80">
                        © {new Date().getFullYear()} TIC
                    </footer>
                </div>
            </div>
        </>
    );
}

// Subcomponent: RegisterCard
function RegisterCard({ title, description, icon, color, href }) {
    return (
        <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-xl ring-1 ring-white/10 hover:scale-[1.02] transition-transform">
            <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-${color}-100 mb-4`}>
                <FontAwesomeIcon icon={icon} className={`text-${color}-600 text-xl`} />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">{title}</h2>
            <p className="text-gray-700 text-sm mb-4">{description}</p>
            <Link
                href={href}
                className={`inline-block bg-transparent text-${color}-600 border border-${color}-600 hover:bg-${color}-600 hover:text-white px-4 py-2 rounded-full transition`}
            >
                Register
            </Link>
        </div>
    );
}
