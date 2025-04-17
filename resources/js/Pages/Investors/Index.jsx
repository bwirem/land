import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

import Modal from '@/Components/CustomModal';

export default function Index({ auth, investors, filters }) {
    const { data, setData, get, errors } = useForm({
        search: filters.search || "",
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        investorToDeleteId: null,
    });

    useEffect(() => {
        get(route("investor0.index"), { preserveState: true });
    }, [data.search, get]);


    const handleSearchChange = (e) => {
        setData("search", e.target.value);
    };


    const handleDelete = (id) => {
        setModalState({
            isOpen: true,
            message: "Are you sure you want to delete this investor?",
            isAlert: false,
            investorToDeleteId: id,
        });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false, investorToDeleteId: null });
    };

    const handleModalConfirm = async () => {
        try {
            await router.delete(route("investor0.destroy", modalState.investorToDeleteId));
        } catch (error) {
            console.error("Failed to delete investor:", error);
            showAlert("There was an error deleting the investor. Please try again.");
        }
        setModalState({ isOpen: false, message: '', isAlert: false, investorToDeleteId: null });
    };

    // Show alert modal
    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: true,
            investorToDeleteId: null,
        });
    };


    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Investor List</h2>}
        >
            <Head title="investor List" />
            <div className="container mx-auto p-4">
                {/* Header Actions */}
                {auth?.user?.userGroup?.name === 'Admin' && (
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="relative flex items-center">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by name or company"
                                    value={data.search}
                                    onChange={handleSearchChange}
                                    className={`pl-10 border px-2 py-1 rounded text-sm ${errors.search ? "border-red-500" : ""
                                        }`}
                                />
                            </div>


                            <Link
                                href={route("investor0.create")}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create
                            </Link>
                        </div>

                    </div>
                )}

                {/* investors Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Investor</th>                                
                                <th className="border-b p-3 text-left font-medium text-gray-700">Email</th>
                                <th className="border-b p-3 text-left font-medium text-gray-700">Phone</th>
                                <th className="border-b p-3 text-center font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investors.data.length > 0 ? (
                                investors.data.map((investor, index) => (
                                    <tr key={investor.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="border-b p-3 text-gray-700">
                                            {investor.investor_type === 'individual' ? (
                                                `${investor.first_name} ${investor.other_names ? investor.other_names + ' ' : ''}${investor.surname}`
                                            ) : (
                                                investor.company_name
                                            )}
                                        </td>
                                        <td className="border-b p-3 text-gray-700">{investor.email}</td>
                                        <td className="border-b p-3 text-gray-700">{investor.phone}</td>

                                        <td className="border-b p-3 flex space-x-2 justify-center">
                                            <Link
                                                href={route("investor0.edit", investor.id)}
                                                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                Edit
                                            </Link>
                                            {auth?.user?.userGroup?.name === 'Admin' && (
                                                <button
                                                    onClick={() => handleDelete(investor.id)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex items-center"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="border-b p-3 text-center text-gray-700">No Investors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}