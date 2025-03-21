import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {    
    faCreditCard,   // Sector    
    faLayerGroup,   // Billing Item Group
    faListAlt,      // Packages   
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';

export default function Index() {
    // Placeholder counts (replace with actual values from props or data fetching)  
    const sectorCount = 0;
    const feestypeCount = 0;
    const packageCount = 0;    

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Site Setup Dashboard
                </h2>
            }
        >
            <Head title="Site Setup Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">                 

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">                      

                        {/* Sector */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faCreditCard} className="text-white" aria-label="Sector" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Sector</p>
                                    <h3 className="text-2xl font-bold">{sectorCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.sectors.index')} className="text-green-500 hover:underline">Manage Sector</Link>
                                    </div>
                                </div>
                            </div>
                        </div>                       

                        {/* Fees Types */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-full">
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-white" aria-label="Fees Types" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Fees Types</p>
                                    <h3 className="text-2xl font-bold">{feestypeCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.feestypes.index')} className="text-purple-500 hover:underline">Manage Fees Types</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faListAlt} className="text-white" aria-label="Packages" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Packages</p>
                                    <h3 className="text-2xl font-bold">{packageCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.loanpackages.index')} className="text-green-500 hover:underline">Manage Packages</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>     
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

