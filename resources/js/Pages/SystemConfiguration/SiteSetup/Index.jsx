import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {    
    faBuilding,      // Sector    
    faTasks,        // Activities
    faExchangeAlt,  // Allocation Methods
    faMapMarkedAlt, // Jurisdiction
    faBriefcase,    // Opportunity Type
    faPlug,        // Utilities
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
                        <DashboardCard 
                            title="Sector" 
                            count={sectorCount} 
                            icon={faBuilding} 
                            color="bg-green-500"
                            routeName="systemconfiguration0.sectors.index"
                        />

                        {/* Activities */}
                        <DashboardCard 
                            title="Activities" 
                            count={feestypeCount} 
                            icon={faTasks} 
                            color="bg-purple-500"
                            routeName="systemconfiguration0.activities.index"
                        />

                        {/* Allocation Methods */}
                        <DashboardCard 
                            title="Allocation Methods" 
                            count={packageCount} 
                            icon={faExchangeAlt} 
                            color="bg-blue-500"
                            routeName="systemconfiguration0.allocationmethods.index"
                        />

                        {/* Jurisdiction */}
                        <DashboardCard 
                            title="Jurisdiction" 
                            count={packageCount} 
                            icon={faMapMarkedAlt} 
                            color="bg-red-500"
                            routeName="systemconfiguration0.jurisdictions.index"
                        />
                    </div>     

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6  mt-6">                      
                        {/* Opportunity Type */}
                        <DashboardCard 
                            title="Opportunity Type" 
                            count={sectorCount} 
                            icon={faBriefcase} 
                            color="bg-green-500"
                            routeName="systemconfiguration0.opportunitytypes.index"
                        />

                        {/* Utilities */}
                        <DashboardCard 
                            title="Utilities" 
                            count={feestypeCount} 
                            icon={faPlug} 
                            color="bg-purple-500"
                            routeName="systemconfiguration0.utilities.index"
                        />
                    </div>    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Reusable Dashboard Card Component
function DashboardCard({ title, count, icon, color, routeName }) {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center">
                <div className={`p-3 ${color} rounded-full`}>
                    <FontAwesomeIcon icon={icon} className="text-white" aria-label={title} />
                </div>
                <div className="ml-4">
                    <p className="text-gray-600">{title}</p>
                    <h3 className="text-2xl font-bold">{count}</h3>
                    <div className="mt-2">
                        <Link href={route(routeName)} className={`${color.replace('bg-', 'text-')} hover:underline`}>
                            Manage {title}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
