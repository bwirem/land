import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';  // Import Link
import {
    faCog,        // Settings
    faLayerGroup, // Expense Item Group
    faListAlt,    // Expense Items
} from '@fortawesome/free-solid-svg-icons';

export default function Index() {
    // Placeholder counts (replace with actual values from props or data fetching)
    const itemGroupCount = 0;
    const expenseItemCount = 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Facility Setup Dashboard
                </h2>
            }
        >
            <Head title="Facility Setup Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {/* Facility Option */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-full">
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-white" aria-label="Facility Option" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Facility Option</p>
                                    <h3 className="text-2xl font-bold">{itemGroupCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration2.facilityoptions.index')} className="text-purple-500 hover:underline">Manage Facility Option</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Facility Branches */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faListAlt} className="text-white" aria-label="Facility Branches" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Facility Branches</p>
                                    <h3 className="text-2xl font-bold">{expenseItemCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration2.facilitybranches.index')} className="text-purple-500 hover:underline">Manage Facility Branches</Link>
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
