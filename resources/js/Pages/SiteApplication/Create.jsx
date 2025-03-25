import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimesCircle, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import axios from 'axios';

import Modal from '../../Components/CustomModal.jsx';
import InputField from '../../Components/CustomInputField.jsx';

// Utility function for debouncing
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function Create({auth,sectors,activities,allocationMethods,
    jurisdictions,opportunityTypes,utilities,facilityBranches}) {
    // Form state using Inertia's useForm hook
    const { data, setData, post, errors, processing, reset } = useForm({
        owner_type: 'individual', // Default value
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
        landowner_id: null,
        sector_id: '',
        activity_id: '',        
        allocationmethod_id: '',    
        jurisdiction_id: '',
        opportunitytype_id: '',
        utility_id: '',
        project_description: '',      
        stage: 1,
        applicationForm: null, // Add applicationForm to data
        facilitybranch_id: auth?.user?.facilitybranch_id || "",
    });

    // Landowner Search State
    const [landownerSearchQuery, setLandownerSearchQuery] = useState('');
    const [landownerSearchResults, setLandownerSearchResults] = useState([]);
    const [showLandownerDropdown, setShowLandownerDropdown] = useState(false);
    const landownerDropdownRef = useRef(null);
    const landownerSearchInputRef = useRef(null);
    const [landownerIDError, setLandownerIDError] = useState(null);

    // New Landowner Modal State
    const [newLandownerModalOpen, setNewLandownerModalOpen] = useState(false);
    const [newLandowner, setNewLandowner] = useState({
        owner_type: 'individual',
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
    });
    const [newLandownerModalLoading, setNewLandownerModalLoading] = useState(false);
    const [newLandownerModalSuccess, setNewLandownerModalSuccess] = useState(false);

    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    // Saving state
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Landowners dynamically (using Inertia)
    const fetchLandowners = useCallback((query) => {
        if (!query.trim()) {
            setLandownerSearchResults([]);
            return;
        }

        axios.get(route('landowner0.search'), { params: { query } })
            .then((response) => {
                setLandownerSearchResults(response.data.landowners.slice(0, 5));
            })
            .catch((error) => {
                console.error('Error fetching landowners:', error);
                showAlert('Failed to fetch landowners. Please try again later.');
                setLandownerSearchResults([]);
            });
    }, []);

    // Debounced landowner search handler
    const debouncedLandownerSearch = useMemo(() => debounce(fetchLandowners, 300), [fetchLandowners]);

    // Fetch landowners on search query change
    useEffect(() => {
        if (landownerSearchQuery.trim()) {
            debouncedLandownerSearch(landownerSearchQuery);
        } else {
            setLandownerSearchResults([]);
        }
    }, [landownerSearchQuery, debouncedLandownerSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSaving(true);

        // Create a FormData object to handle the file upload
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        post(route('landowner1.store'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (error) => {
                console.error(error);
                setIsSaving(false);
                showAlert('An error occurred while saving the application.');
            },
        });
    };
    // Reset the form
    const resetForm = () => {
        reset();
        setLandownerIDError(null);
        showAlert('Application created successfully!');
    };
    // Handle landowner search input change
    const handleLandownerSearchChange = (e) => {
        const query = e.target.value;
        setLandownerSearchQuery(query);
        setLandownerSearchResults([]); // Clear previous results
        setShowLandownerDropdown(!!query.trim());

        // Update appropriate fields based on landowner type
        setData((prevData) => ({
            ...prevData,
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
            landowner_id: null,
        }));
    };

    // Clear landowner search
    const handleClearLandownerSearch = () => {
        setLandownerSearchQuery('');
        setLandownerSearchResults([]);
        setShowLandownerDropdown(false);
        if (landownerSearchInputRef.current) {
            landownerSearchInputRef.current.focus();
        }

        setData((prevData) => ({
            ...prevData,
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
            landowner_id: null,
        }));
    };


    // Handle landowner selection
    const selectLandowner = (selectedLandowner) => {
        setData((prevData) => ({
            ...prevData,
            owner_type: selectedLandowner.owner_type,
            first_name: selectedLandowner.first_name || '',
            other_names: selectedLandowner.other_names || '',
            surname: selectedLandowner.surname || '',
            company_name: selectedLandowner.company_name || '',
            email: selectedLandowner.email,
            phone: selectedLandowner.phone || '',
            landowner_id: selectedLandowner.id,
        }));

        setLandownerSearchQuery('');
        setLandownerSearchResults([]);
        setShowLandownerDropdown(false);
    };

    // Function to handle new landowner button click (Open the modal)
    const handleNewLandownerClick = () => {
        setNewLandownerModalOpen(true);
        setNewLandownerModalSuccess(false); //reset state in case open again
        setNewLandowner({
            owner_type: 'individual',
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
        });
    };
    // Function to close the modal
    const handleNewLandownerModalClose = () => {
        setNewLandownerModalOpen(false);
        setNewLandownerModalLoading(false);
        setNewLandownerModalSuccess(false);
    };

    // Function to confirm new landowner (you should implement saving logic here)
    const handleNewLandownerModalConfirm = async () => {
        setNewLandownerModalLoading(true);
        try {
            const response = await axios.post(route('landowner0.directstore'), newLandowner);

            if (response.data && response.data.id) {
                setData((prevData) => ({
                    ...prevData,
                    owner_type: response.data.owner_type,
                    first_name: response.data.first_name,
                    other_names: response.data.other_names,
                    surname: response.data.surname,
                    company_name: response.data.company_name,
                    email: response.data.email,
                    phone: response.data.phone,
                    landowner_id: response.data.id,
                }));

                setNewLandownerModalSuccess(true);
            } else {
                showAlert('Error creating new landowner!');
            }
        } catch (error) {
            console.error("Error creating new landowner:", error);
            showAlert('Failed to create new landowner. Please try again.');
        } finally {
            setNewLandownerModalLoading(false);
            setTimeout(() => {
                setNewLandownerModalOpen(false);
                setNewLandownerModalSuccess(false);
            }, 1000)

        }

    };
     
    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };

    const handleNewLandownerInputChange = (e) => {
        const { id, value } = e.target;
        setNewLandowner(prevState => ({
            ...prevState,
            [id]: value,
        }));
    };
  
    const handleApplicationFormChange = (e) => {
        setData('applicationForm', e.target.files[0]); // Store the file object
    };

    
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Application</h2>}
        >
            <Head title="New Application" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Landowner Search and New Landowner Button */}
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                <div className="relative flex-1" ref={landownerDropdownRef}>
                                    <div className="flex items-center justify-between h-10">
                                        <label htmlFor="landowner_name" className="block text-sm font-medium text-gray-700 mr-2">
                                            Landowner Name
                                        </label>
                                        {/* New Landowner Button Added Here */}
                                        <button
                                            type="button"
                                            onClick={handleNewLandownerClick}
                                            className="bg-green-500 text-white rounded p-2 flex items-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search landowner..."
                                        value={landownerSearchQuery}
                                        onChange={handleLandownerSearchChange}
                                        onFocus={() => setShowLandownerDropdown(!!landownerSearchQuery.trim())}
                                        className={`w-full border p-2 rounded text-sm pr-10 ${landownerIDError ? 'border-red-500' : ''}`}
                                        ref={landownerSearchInputRef}
                                        autoComplete="off"
                                    />
                                    {landownerIDError && <p className="text-sm text-red-600 mt-1">{landownerIDError}</p>}
                                    {landownerSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={handleClearLandownerSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} />
                                        </button>
                                    )}
                                    {showLandownerDropdown && (
                                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                                            {landownerSearchResults.length > 0 ? (
                                                landownerSearchResults.map((landowner) => (
                                                    <li
                                                        key={landowner.id}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => selectLandowner(landowner)}
                                                    >
                                                        {landowner.owner_type === 'company' ? landowner.company_name : `${landowner.first_name} ${landowner.surname}`}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-2 text-gray-500">No Land owners found.</li>
                                            )}
                                        </ul>
                                    )}
                                    {/* Display Landowner Details After Selection */}
                                    {data.landowner_id && (
                                        <section className="border-b border-gray-200 pb-4">
                                            <h4 className="text-md font-semibold text-gray-700 mb-3">Landowner Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Landowner Type:</label>
                                                    <p className="mt-1 text-sm text-gray-500">{data.owner_type}</p>
                                                </div>

                                                {data.owner_type === 'individual' ? (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                                            <p className="mt-1 text-sm text-gray-500">{data.first_name || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Other Names:</label>
                                                            <p className="mt-1 text-sm text-gray-500">{data.other_names || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Surname:</label>
                                                            <p className="mt-1 text-sm text-gray-500">{data.surname || 'N/A'}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Company Name:</label>
                                                        <p className="mt-1 text-sm text-gray-500">{data.company_name || 'N/A'}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Email:</label>
                                                    <p className="mt-1 text-sm text-gray-500">{data.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Phone:</label>
                                                    <p className="mt-1 text-sm text-gray-500">{data.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>

                            {/* Location Deatils Section */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Location Information</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="facilitybranch" className="block text-sm font-medium text-gray-700">Branch</label>
                                            <select
                                                id="facilitybranch"
                                                value={data.facilitybranch_id}    
                                                onChange={(e) => setData('facilitybranch_id', e.target.value)}                                    
                                                className="w-full border p-2 rounded text-sm"
                                                required
                                            >
                                                <option value="" disabled>Select Branch</option>
                                                {facilityBranches.map(branch => (
                                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                ))}
                                            </select>
                                            {errors.facilitybranch && <p className="text-sm text-red-600">{errors.facilitybranch}</p>}
                                        </div>                                                                        
                                    </div>
                                </div> 
                            </section>                            

                            {/* Site Details Section */}
                            <section className="border-b border-gray-200 pb-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Site Information</h4>

                                {/* First Row: Sector, Jurisdiction, Opportunity Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    {/* Sector */}
                                    <div>
                                        <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
                                        <select
                                            id="sector"
                                            value={data.sector_id}
                                            onChange={(e) => setData('sector_id', e.target.value)}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Sector</option>
                                            {sectors.map(sector => (
                                                <option key={sector.id} value={sector.id}>{sector.name}</option>
                                            ))}
                                        </select>
                                        {errors.sector && <p className="text-sm text-red-600">{errors.sector}</p>}
                                    </div>

                                    {/* Jurisdiction */}
                                    <div>
                                        <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">Jurisdiction</label>
                                        <select
                                            id="jurisdiction"
                                            value={data.jurisdiction_id}
                                            onChange={(e) => setData('jurisdiction_id', e.target.value)}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Jurisdiction</option>
                                            {jurisdictions.map(jurisdiction => (
                                                <option key={jurisdiction.id} value={jurisdiction.id}>{jurisdiction.name}</option>
                                            ))}
                                        </select>
                                        {errors.jurisdiction && <p className="text-sm text-red-600">{errors.jurisdiction}</p>}
                                    </div>

                                    {/* Opportunity Type */}
                                    <div>
                                        <label htmlFor="opportunitytype" className="block text-sm font-medium text-gray-700">Opportunity Type</label>
                                        <select
                                            id="opportunitytype"
                                            value={data.opportunitytype_id}
                                            onChange={(e) => setData('opportunitytype_id', e.target.value)}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Opportunity</option>
                                            {opportunityTypes.map(opportunitytype => (
                                                <option key={opportunitytype.id} value={opportunitytype.id}>{opportunitytype.name}</option>
                                            ))}
                                        </select>
                                        {errors.opportunitytype && <p className="text-sm text-red-600">{errors.opportunitytype}</p>}
                                    </div>
                                </div>

                                {/* Second Row: Activities, Allocation Methods, Utilities */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    {/* Activities */}
                                    <div>
                                        <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Activities</label>
                                        <select
                                            id="activity"
                                            value={data.activity_id}
                                            onChange={(e) => setData('activity_id', e.target.value)}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Activity</option>
                                            {activities.map(activity => (
                                                <option key={activity.id} value={activity.id}>{activity.name}</option>
                                            ))}
                                        </select>
                                        {errors.activity && <p className="text-sm text-red-600">{errors.activity}</p>}
                                    </div>

                                    {/* Allocation Methods */}
                                    <div>
                                        <label htmlFor="allocationmethod" className="block text-sm font-medium text-gray-700">Allocation Methods</label>
                                        <select
                                            id="allocationmethod"
                                            value={data.allocationmethod_id}
                                            onChange={(e) => setData('allocationmethod_id', e.target.value)}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Allocation Method</option>
                                            {allocationMethods.map(allocationmethod => (
                                                <option key={allocationmethod.id} value={allocationmethod.id}>{allocationmethod.name}</option>
                                            ))}
                                        </select>
                                        {errors.allocationmethod && <p className="text-sm text-red-600">{errors.allocationmethod}</p>}
                                    </div>

                                    {/* Utilities */}
                                    <div>
                                        <label htmlFor="utility" className="block text-sm font-medium text-gray-700">Utilities</label>
                                        <select
                                            id="utility"
                                            value={data.utility_id}
                                            onChange={(e) => setData('utility_id', e.target.value)}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Utility</option>
                                            {utilities.map(utility => (
                                                <option key={utility.id} value={utility.id}>{utility.name}</option>
                                            ))}
                                        </select>
                                        {errors.utility && <p className="text-sm text-red-600">{errors.utility}</p>}
                                    </div>
                                </div>

                                {/* Project Description */}
                                <div className="mb-6">
                                    <label htmlFor="project_description" className="block text-sm font-medium text-gray-700">Project Description</label>
                                    <textarea
                                        id="project_description"
                                        value={data.project_description}
                                        onChange={(e) => setData('project_description', e.target.value)}
                                        className="w-full border p-2 rounded text-sm resize-none"
                                        rows="4"
                                        required
                                    />
                                    {errors.project_description && <p className="text-sm text-red-600">{errors.project_description}</p>}
                                </div>
                            </section>  

                            {/* Upload Title Deed */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                                 
                                {/* Upload Title Deed */}
                                <div className="relative flex-1">
                                    <label htmlFor="applicationForm" className="block text-sm font-medium text-gray-700">
                                        Filled Title Deed
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <label htmlFor="applicationForm" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <span>Upload</span>
                                            <FontAwesomeIcon icon={faFileUpload} className="ml-2" />
                                            <input
                                                id="applicationForm"
                                                name="applicationForm"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleApplicationFormChange}
                                            />
                                        </label>
                                        {data.applicationForm && (
                                            <span className="ml-3 text-gray-500 text-sm">
                                                {data.applicationForm.name}
                                            </span>
                                        )}
                                        {errors.applicationForm && <p className="text-sm text-red-600 mt-1">{errors.applicationForm}</p>}
                                    </div>
                                </div>                                                               
                            </div>                            

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 mt-6">                                
                                <Link
                                    href={route('landowner1.index')}  // Using the route for navigation
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

            {/* New Landowner Modal */}
            <Modal
                isOpen={newLandownerModalOpen}
                onClose={handleNewLandownerModalClose}
                onConfirm={handleNewLandownerModalConfirm}
                title="Create New Landowner"
                confirmButtonText={newLandownerModalLoading ? 'Loading...' : (newLandownerModalSuccess ? "Success" : 'Confirm')}
                confirmButtonDisabled={newLandownerModalLoading || newLandownerModalSuccess}
            >
                <form className="space-y-4">
                    <div>
                        <label htmlFor="owner_type" className="block text-sm font-medium text-gray-700">Landowner Type</label>
                        <select
                            id="owner_type"
                            value={newLandowner.owner_type}
                            onChange={handleNewLandownerInputChange}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newLandownerModalLoading || newLandownerModalSuccess}
                        >
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                        </select>
                    </div>

                    {newLandowner.owner_type === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    value={newLandowner.first_name}
                                    onChange={handleNewLandownerInputChange}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newLandownerModalLoading || newLandownerModalSuccess}
                                />
                            </div>
                            <div>
                                <label htmlFor="other_names" className="block text-sm font-medium text-gray-700">Other Names</label>
                                <input
                                    type="text"
                                    id="other_names"
                                    value={newLandowner.other_names}
                                    onChange={handleNewLandownerInputChange}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newLandownerModalLoading || newLandownerModalSuccess}
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                                <input
                                    type="text"
                                    id="surname"
                                    value={newLandowner.surname}
                                    onChange={handleNewLandownerInputChange}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newLandownerModalLoading || newLandownerModalSuccess}
                                />
                            </div>
                        </div>
                    )}

                    {newLandowner.owner_type === 'company' && (
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                id="company_name"
                                value={newLandowner.company_name}
                                onChange={handleNewLandownerInputChange}
                                className="w-full border p-2 rounded text-sm"
                                disabled={newLandownerModalLoading || newLandownerModalSuccess}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={newLandowner.email}
                            onChange={handleNewLandownerInputChange}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newLandownerModalLoading || newLandownerModalSuccess}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={newLandowner.phone}
                            onChange={handleNewLandownerInputChange}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newLandownerModalLoading || newLandownerModalSuccess}
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null })}
                onConfirm={() => setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null })}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}