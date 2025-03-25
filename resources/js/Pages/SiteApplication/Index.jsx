import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

import Modal from '../../Components/CustomModal.jsx';

export default function Index({ auth, sites, filters }) {
    const { data, setData, get, errors } = useForm({
        search: filters.search || "",        
        stage: filters.stage || "",        
    });


    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        siteToDeleteId: null,
    });

    useEffect(() => {
        // Refetch the data whenever search, stage, or facility branch changes
        get(route("landowner1.index"), { preserveState: true });
    }, [data.search, data.stage, get]);

    const handleSearchChange = (e) => {
        setData("search", e.target.value);
    };

    const handleStageChange = (stage) => {
        setData("stage", stage);
    };

    const siteStageLabels = {
        1: 'Draft',  
        2: 'Coordinating',
        3: 'Documentation',      
        4: 'Submitted',            
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Applications List</h2>}
        >
            <Head title="Applications List" />
            <div className="container mx-auto p-4">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">

                        <div className="relative flex items-center">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by customer name"
                                value={data.search}
                                onChange={handleSearchChange}
                                className={`pl-10 border px-2 py-1 rounded text-sm ${errors.search ? "border-red-500" : ""}`}
                            />
                        </div>

                        <Link
                            href={route("landowner1.create")}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create
                        </Link>
                    </div>

                    <ul className="flex space-x-2 mt-2">
                        <li
                            className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center ${data.stage === "" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
                            onClick={() => handleStageChange("")}
                        >
                            All
                        </li>

                        {Object.entries(siteStageLabels).map(([key, label]) => (
                            <li
                                key={key}
                                className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center ${data.stage === key ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
                                onClick={() => handleStageChange(key)}
                            >
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Land Owner</th>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Project Description</th>  
                                <th className="border-b p-3 text-center font-medium text-gray-700">Stage</th>                           
                                <th className="border-b p-3 text-center font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.data.length > 0 ? (
                                sites.data.map((site, index) => (
                                    <tr key={site.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="border-b p-3 text-gray-700">{site.first_name ? site.first_name : site.company_name}</td>                                        
                                        <td className="border-b p-3 text-gray-700 text-right">{site.project_description}</td>                                       
                                        <td className="border-b p-3 text-center text-gray-700">{siteStageLabels[site.stage]}</td>
                                        <td className="border-b p-3 flex space-x-2 justify-center">
                                            <Link
                                                href={route("landowner1.edit", site.id)}
                                                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="mr-1" />                                              
                                                {site.stage === 2 ? "Process" : site.stage === 3 ? "Process": site.stage === 4 ? "Preview" : "Edit"}
                                            </Link>                                           
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="border-b p-3 text-center text-gray-700">No site applications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
