import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function LandPortfolioReport({ auth, sites, filters }) {
    const { data, setData, get, errors } = useForm({
        search: filters?.search || "",
    });

    useEffect(() => {
        get(route("reportingAnalytics0.land-portfolio"), { preserveState: true });
    }, [data.search]);

    const handleSearchChange = (e) => {
        setData("search", e.target.value);
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="text-2xl font-bold mb-4">📄 Land Portfolio Report</h2>}
        >
            <Head title="Land Portfolio Report" />

            <div className="container mx-auto p-4">
                {/* Search Filter */}
                <div className="flex justify-between items-center mb-4">
                    <div className="relative flex items-center">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by land owner name"
                            value={data.search}
                            onChange={handleSearchChange}
                            className={`pl-10 border px-2 py-1 rounded text-sm ${errors.search ? "border-red-500" : ""}`}
                        />
                    </div>
                </div>

                {/* Report Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Land Owner</th>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Sector</th>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Activity</th>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Area</th>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Price</th>                               
                                <th className="border-b p-3 text-left font-medium text-gray-700">Branch</th>
                                <th className="border-b p-3 text-center font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.length > 0 ? (
                                sites.map((site, index) => (
                                    <tr key={site.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                        <td className="border-b p-3 text-gray-700">
                                            {site.landowner?.landowner_type === "individual"
                                                ? `${site.landowner?.first_name ?? ""} ${site.landowner?.other_names ?? ""} ${site.landowner?.surname ?? ""}`
                                                : site.landowner?.company_name}
                                        </td>
                                        <td className="border-b p-3 text-gray-700">{site.sector?.name}</td>
                                        <td className="border-b p-3 text-gray-700">{site.activity?.name}</td>
                                        <td className="border-b p-3 text-gray-700">{site.landarea}</td>
                                        <td className="border-b p-3 text-gray-700">{Number(site.priceofland).toLocaleString()}</td>                                        
                                        <td className="border-b p-3 text-gray-700">{site.branch?.name}</td>
                                        <td className="border-b p-3 text-center">
                                            <Link
                                                href={route("reportingAnalytics0.view", site.id)}
                                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs inline-flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="border-b p-3 text-center text-gray-700">
                                        No land portfolio data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
