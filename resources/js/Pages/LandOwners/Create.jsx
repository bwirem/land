import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Modal from '@/Components/CustomModal';

export default function Create({customerTypes,email}) {
    const { data, setData, post, errors, processing, reset } = useForm({
        landowner_type: 'individual', // Default value
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: email,
        phone:'',
        address: '',
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleModalConfirm = () => {
       
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message,
            isAlert: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSaving(true);
        post(route('landowner0.store'), {
            ...data, // Send all form data
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (error) => {
                console.error(error);
                setIsSaving(false);
                showAlert('An error occurred while saving the landowner.');
            },
        });
    };

    const resetForm = () => {
        reset();
        showAlert('landowner created successfully!');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Land Owner</h2>}
        >
            <Head title="New Landowner" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Landowner Type */}
                            <div>
                                <label htmlFor="landowner_type" className="block text-sm font-medium text-gray-700">Land Owner Type</label>
                                <select
                                    id="landowner_type"
                                    value={data.landowner_type}
                                    onChange={(e) => setData('landowner_type', e.target.value)}
                                    className="w-full border p-2 rounded text-sm"
                                >
                                    {customerTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.landowner_type && <p className="text-sm text-red-600">{errors.landowner_type}</p>}
                            </div>                            

                            {/* Individual Landowner Fields */}
                            {data.landowner_type === 'individual' && (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className={`w-full border p-2 rounded text-sm ${errors.first_name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="other_names" className="block text-sm font-medium text-gray-700">Other Names</label>
                                            <input
                                                type="text"
                                                id="other_names"
                                                value={data.other_names}
                                                onChange={(e) => setData('other_names', e.target.value)}
                                                className={`w-full border p-2 rounded text-sm ${errors.other_names ? 'border-red-500' : ''}`}
                                            />
                                            {errors.other_names && <p className="text-sm text-red-600">{errors.other_names}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                                            <input
                                                type="text"
                                                id="surname"
                                                value={data.surname}
                                                onChange={(e) => setData('surname', e.target.value)}
                                                className={`w-full border p-2 rounded text-sm ${errors.surname ? 'border-red-500' : ''}`}
                                            />
                                            {errors.surname && <p className="text-sm text-red-600">{errors.surname}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Company Landowner Fields */}
                            {data.landowner_type === 'company' && (
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.company_name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.company_name && <p className="text-sm text-red-600">{errors.company_name}</p>}
                                </div>
                            )}
                            

                            {/* Common Fields */}
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full border p-2 rounded text-sm ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={`w-full border p-2 rounded text-sm ${errors.phone ? 'border-red-500' : ''}`}
                                        />
                                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={`w-full border p-2 rounded text-sm ${errors.address ? 'border-red-500' : ''}`}
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>
                            


                            <div className="flex justify-end space-x-4 mt-6"> 
                                <Link
                                    href={route('landowner0.index')}
                                    method="get"  // Optional, if you want to define the HTTP method (GET is default)
                                    preserveState={true}  // Keep the page state (similar to `preserveState: true` in the button)
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || isSaving}
                                    className="bg-blue-600 text-white rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
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