import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { faUsers, faLandmark, faBuilding, faHandshake, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function DashboardInvestor({ stats }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Investor Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">   

                        {/* Site Interests */}
                        <DashboardCard 
                            title="Total Site Interests" 
                            count={stats.site_interests} 
                            icon={faHandshake} 
                            color="red"
                            linkText="View Site Interests"
                            linkUrl={route('investor1.index')}
                        />
                    </div>
                   
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* Reusable Card Component */
const DashboardCard = ({ title, count, icon, color, linkText, linkUrl }) => (
    <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center">
            <div className={`p-3 bg-${color}-500 rounded-full`}>
                <FontAwesomeIcon icon={icon} className="text-white" />
            </div>
            <div className="ml-4">
                <p className="text-gray-600">{title}</p>
                <h3 className="text-2xl font-bold">{count}</h3>
                <div className="mt-2">
                    <Link href={linkUrl} className={`text-${color}-500 hover:underline`}>{linkText}</Link>
                </div>
            </div>
        </div>
    </div>
);

/* Financial Transaction Card */
const TransactionCard = ({ title, value }) => (
    <div className="bg-white shadow-md rounded-lg p-6">
        <h4 className="text-xl font-bold">{title}</h4>
        <p className="text-gray-600">{value}</p>
    </div>
);


