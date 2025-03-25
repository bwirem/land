import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faEye, faPlus, faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import Modal from '../../Components/CustomModal.jsx';
import proj4 from 'proj4';


// Define the UTM Zone 37S projection
const utm37S = '+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs';
const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';

function convertUTMToLatLong(northing, easting) {
    // Convert UTM to WGS84
    const [longitude, latitude] = proj4(utm37S, wgs84, [easting, northing]);
    return { latitude, longitude };
}

export default function Coordinating({ site,site_coordinates,sectors, jurisdictions, opportunityTypes, activities, 
    allocationMethods, utilities, facilityBranches }) {

    // Form state using Inertia's useForm hook
    const { data, setData, errors, processing, reset } = useForm({
        owner_type: site.owner_type,
        first_name: site.first_name || '',
        other_names: site.other_names || '',
        surname: site.surname || '',
        company_name: site.company_name || '',
        email: site.email,
        phone: site.phone || '',
        landowner_id: site.landowner_id,
        sector_id: site.sector_id || '',
        activity_id: site.activity_id || '',        
        allocationmethod_id: site.allocationmethod_id || '',    
        jurisdiction_id: site.jurisdiction_id || '',
        opportunitytype_id: site.opportunitytype_id || '',
        utility_id: site.utility_id || '',
        project_description: site.project_description || '',
        facilitybranch_id: site.facilitybranch_id || "",
        stage: site.stage,
        coordinate_type: '', // Set the default value to an empty string
        coordinates: site_coordinates || [],
    });
    

    // State for new coordinates
    const [newLatitude, setNewLatitude] = useState('');
    const [newLongitude, setNewLongitude] = useState('');
    const [northing, setNorthing] = useState('');
    const [easting, setEasting] = useState('');

    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    // Saving state
    const [isSaving, setIsSaving] = useState(false); 
    const [submitModalOpen, setSubmitModalOpen] = useState(false); 
    const [submitRemarks, setSubmitRemarks] = useState(''); // State for the remarks
    const [remarksError, setRemarksError] = useState(''); // State to display remarks error

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };

    const handlAddCoordinateClick = () => {
        if (newLatitude && newLongitude) {
            setData(prevData => ({
                ...prevData,
                coordinates: [...prevData.coordinates, { latitude: newLatitude, longitude: newLongitude }]
            }));
            // Clear input fields after adding
            setNewLatitude('');
            setNewLongitude('');
        } else {
            showAlert('Please enter both latitude and longitude.');
        }
    };

    const handleConvertClick = () => {
        // Validate Northing and Easting inputs
        const parsedNorthing = parseFloat(northing);
        const parsedEasting = parseFloat(easting);
    
        if (isNaN(parsedNorthing) || isNaN(parsedEasting)) {
            showAlert('Please enter valid numeric values for Northing and Easting.');
            return;
        }
    
        // Proceed with conversion if inputs are valid
        try {
            const { latitude, longitude } = convertUTMToLatLong(parsedNorthing, parsedEasting);
            console.log(`Converted Latitude: ${latitude}, Longitude: ${longitude}`); // Debug log
            setData(prevData => ({
                ...prevData,
                coordinates: [...prevData.coordinates, { latitude, longitude }]
            }));
            // Clear input fields after conversion
            setNorthing('');
            setEasting('');
        } catch (error) {
            console.error('Conversion error:', error);
            showAlert('An error occurred during conversion. Please check your inputs.');
        }
    };    
    

    const removeCoordinate = (index) => {
        setModalState({ isOpen: true, message: 'Are you sure you want to remove this coordinate?', isAlert: false, itemToRemoveIndex: index });
    };

    // Modal confirmations
    const handleModalConfirm = () => {
        if (modalState.itemToRemoveIndex !== null) {
            setData(prevData => {
                const updatedCoordinates = prevData.coordinates.filter((_, index) => index !== modalState.itemToRemoveIndex);
                return { ...prevData, coordinates: updatedCoordinates };
            });
        }
        setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
    
        const formData = new FormData();
        formData.append('stage', data.stage || '');

        // Append Coordinates
        data.coordinates.forEach((coordinate, index) => {
            formData.append(`coordinates[${index}][latitude]`, coordinate.latitude);
            formData.append(`coordinates[${index}][longitude]`, coordinate.longitude);
        });
    
        formData.append('_method', 'PUT'); // Method Spoofing
    
        try {
            const response = await axios.post(route('landowner1.coordinating', site.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            setIsSaving(false);            
            showAlert(response.data.message);

            setTimeout(() => {  // Introduce a short delay
                resetForm();
            }, 100); // Adjust the timeout as needed
                
        } catch (error) {
            setIsSaving(false);
            console.error('Full error object:', error);
            if (error.response && error.response.data) {
                console.error('Error data:', error.response.data);
                setData('errors', error.response.data.errors);
            } else {
                console.error("Error updating site:", error);
                showAlert('An error occurred while saving the application.');
            }
        }
    };    

    // Reset the form
    const resetForm = () => {
        reset('', {
            onSuccess: () => {
                Inertia.reload({ 
                    only: ['site.site_guarantors'],
                    preserveScroll: true
                });
            }
        });
    };

    const handleSubmitClick = () => {
        if (data.coordinates.length === 0) {
            showAlert('Please add at least one coordinate before submitting.');
            return;
        }
    
        setSubmitModalOpen(true);
        setSubmitRemarks('');
        setRemarksError('');
    };

    const handleSubmitModalClose = () => {
        setSubmitModalOpen(false);      
        setSubmitRemarks(''); // Clear remarks when closing modal
        setRemarksError(''); // Clear any error
    };

    const handleSubmitModalConfirm = () => {
        if (!submitRemarks.trim()) {
            setRemarksError('Please enter Submit remarks.');
            return;
        }

        const submitData = {          
            remarks: submitRemarks,
        };
    
        axios.post(route('landowner1.submit', site.id), submitData)
            .then(response => {
                console.log("Submit successful:", response);
                if (response.data && response.data.message) {
                    showAlert(response.data.message);
                }

                if (response.status === 200) {
                    Inertia.get(route('landowner1.index'));
                } else {
                    console.error("Submit failed (non-200 status):", response);
                    showAlert('Submit failed. Please check the console for details.');
                }
            })
            .catch(error => {
                console.error("Error Submitting Site:", error);
                let errorMessage = 'Failed to Submit site. Please try again.';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                showAlert(errorMessage);
            });

        setSubmitModalOpen(false);      
        setSubmitRemarks(''); // Clear remarks after confirming
        setRemarksError(''); // Clear error after confirming
    };
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Submitted Application</h2>}
        >
            <Head title="Submitted Application" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Landowner Details Section */}
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
                                                <p className="mt-1 text-sm text-gray-500">{data.first_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Other Names:</label>
                                                <p className="mt-1 text-sm text-gray-500">{data.other_names || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Surname:</label>
                                                <p className="mt-1 text-sm text-gray-500">{data.surname}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Company Name:</label>
                                            <p className="mt-1 text-sm text-gray-500">{data.company_name}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.phone}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Site Details Section */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Location Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Zone:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {facilityBranches.find(facilitybranch => facilitybranch.id === site.facilitybranch_id)?.name || 'N/A'}
                                        </p>
                                    </div>                               
                                </div>
                            </section>

                            {/* Site Details Section */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Site Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Sector:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {sectors.find(sector => sector.id === site.sector_id)?.name || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Jurisdiction:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {jurisdictions.find(jurisdiction => jurisdiction.id === site.jurisdiction_id)?.name || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Opportunity Type:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {opportunityTypes.find(opportunitytype => opportunitytype.id === site.opportunitytype_id)?.name || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Activities:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {activities.find(activity => activity.id === site.activity_id)?.name || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Allocation Methods:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {allocationMethods.find(allocationmethod => allocationmethod.id === site.allocationmethod_id)?.name || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Utilities:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {utilities.find(utility => utility.id === site.utility_id)?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Title Deed Display */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Title Deed</h4>
                                {site.application_form ? (
                                    <div className="mt-2">
                                        <a
                                            href={`/storage/${site.application_form}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md font-semibold text-xs uppercase tracking-widest focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition ease-in-out duration-150"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="mr-2" />
                                            View Title Deed
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No title deed available.</p>
                                )}
                            </section> 

                            {/* Site Coordinates Section */}                          
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Site Coordinates</h4>
                                <div className="flex items-center space-x-4 mb-2 py-1">
                                    <div className="relative flex-1">
                                        <select
                                            id="coordinate_type"
                                            value={data.coordinate_type}
                                            onChange={(e) => setData('coordinate_type', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.coordinate_type ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="" disabled>Select Coordinate Systems</option> {/* Default option */}
                                            <option value="1">Geographic Coordinate System (GCS)</option>
                                            <option value="2">Projected Coordinate System (PCS)</option>
                                        </select>
                                        {errors.coordinate_type && <p className="text-sm text-red-600 mt-1">{errors.coordinate_type}</p>}
                                    </div>
                                </div>

                                {/* Conditional Input Fields */}
                                {data.coordinate_type === '1' && ( // For GCS
                                    <>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Latitude:</label>
                                                <input
                                                    type="text"
                                                    value={newLatitude}
                                                    onChange={(e) => setNewLatitude(e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter Latitude"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Longitude:</label>
                                                <input
                                                    type="text"
                                                    value={newLongitude}
                                                    onChange={(e) => setNewLongitude(e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter Longitude"
                                                />
                                            </div>
                                        </div>

                                        {/* Add Coordinate Button for GCS */}
                                        <div className="flex justify-end mb-4">
                                            <button
                                                type="button"
                                                onClick={handlAddCoordinateClick}
                                                className="bg-green-500 text-white rounded p-2 flex items-center space-x-2"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                <span>Add Coordinate</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {data.coordinate_type === '2' && ( // For PCS
                                    <>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Northing:</label>
                                                <input
                                                    type="text"
                                                    value={northing}
                                                    onChange={(e) => setNorthing(e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter Northing"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Easting:</label>
                                                <input
                                                    type="text"
                                                    value={easting}
                                                    onChange={(e) => setEasting(e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter Easting"
                                                />
                                            </div>
                                        </div>

                                        {/* Convert Button for PCS */}
                                        <div className="flex justify-end mb-4">
                                            <button
                                                type="button"
                                                onClick={handleConvertClick}
                                                className="bg-blue-500 text-white rounded p-2 flex items-center space-x-2"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                <span>Convert Northing/Easting</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Coordinates Table */}
                                <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Latitude
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Longitude
                                                </th>                                            
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {data.coordinates.map((coordinateData, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {coordinateData.latitude}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {coordinateData.longitude}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCoordinate(index)}
                                                            className="ml-2 text-red-600 hover:text-red-800"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div> 
                            </section>                           

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                    href={route('landowner1.index')}  // Using the route for navigation
                                    method="get"
                                    preserveState={true}
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

                                <button
                                    type="button"
                                    onClick={handleSubmitClick}
                                    className="bg-green-500 text-white rounded p-2 flex items-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span>Submit</span>
                                </button>
                            </div>
                        </form>
                    </div>
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
