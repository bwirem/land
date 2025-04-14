import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faEye, faPlus, faTrash, faTimes, faCheck , faArrowLeft} from '@fortawesome/free-solid-svg-icons';
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

export default function Submission({ site,site_coordinates,sectors, jurisdictions, opportunityTypes, activities, 
    allocationMethods, utilities, facilityBranches }) {

    // Form state using Inertia's useForm hook
    const { data, setData,put, errors, processing, reset } = useForm({
        landowner_type: site.landowner.landowner_type || 'individual', // Default to 'individual' if undefined
        first_name: site.landowner.first_name || '',
        other_names: site.landowner.other_names || '',
        surname: site.landowner.surname || '',
        company_name: site.landowner.company_name || '',
        email: site.landowner.email || '',
        phone: site.landowner.phone || '',

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

        approvals: site.approvals || [],  // Array of approvals details
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

    const [submitModalLoading, setSubmitModalLoading] = useState(false);
    const [submitModalSuccess, setSubmitModalSuccess] = useState(false);

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

   
    const handleSubmitClick = () => {
        if (data.coordinates.length === 0) {
            showAlert('Please add at least one coordinate before submitting.');
            return;
        }
    
        setSubmitModalOpen(true);
        setSubmitRemarks('');
        setRemarksError('');

        setSubmitModalLoading(false); // Reset loading state
        setSubmitModalSuccess(false); // Reset success state

    };

    const handleSubmitModalClose = () => {
        setSubmitModalOpen(false);      
        setSubmitRemarks(''); // Clear remarks when closing modal
        setRemarksError(''); // Clear any error

        setSubmitModalLoading(false); // Reset loading state
        setSubmitModalSuccess(false); // Reset success state
    };

    const handleSubmitModalConfirm = () => {      

        if (!data.remarks) {
            setRemarksError('Please enter Submit remarks.');
            return;
        }
 
        
        const formData = new FormData();
        formData.append('remarks', data.remarks);
 
         setSubmitModalLoading(true); // Set loading state
 
         put(route('management0.approve', site.id), formData, {
             forceFormData: true,
             onSuccess: () => {
                 setSubmitModalLoading(false);
                 reset(); // Reset form data
                 setSubmitModalSuccess(true); // Set success state
                 handleSubmitModalClose(); // Close the modal on success
             },
             onError: (errors) => {
                 setSubmitModalLoading(false);
                 console.error('Submission errors:', errors);
             },
         });      

    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Review</h2>}
        >
            <Head title="Review" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form className="space-y-6">
                            {/* Landowner Details Section */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Land Owner Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Land Owner Type:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.landowner_type}</p>
                                    </div>

                                    {data.landowner_type === 'individual' ? (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Project Description:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.project_description}</p>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div> 
                            </section>   

                              <section>
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Declaration Remarks</h4>
                                <div>                                    
                                    <p className="mt-1 text-sm text-gray-500">{site.submit_remarks}</p>
                                </div>
                            </section>    


                            {/* Stage Selection */}
                            <section>
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Review Details</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th> 
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>  
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>                                         
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {data.approvals
                                            .filter(approval => approval.remarks && approval.remarks.trim() !== '') // Filter out approvals with null or empty remarks
                                            .map((approval, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {approval.remarks || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {approval.approver?.user_group?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {approval.approver?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {approval.updated_at ? new Intl.DateTimeFormat('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: true
                                                        }).format(new Date(approval.updated_at)) : 'N/A'}
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
                                    href={route('management2.index')}  // Using the route for navigation
                                    method="get"
                                    preserveState={true}
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </Link>

                                 <Link
                                    href={route('management2.back', site.id)}
                                    className="bg-blue-300 text-blue-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    <span>Return</span>
                                </Link>                                
                                
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


             {/* Submit Confirmation Modal */}
             <Modal
                    isOpen={submitModalOpen}
                    onClose={handleSubmitModalClose}
                    onConfirm={handleSubmitModalConfirm}
                    title="Approval Confirmation"                  
                    confirmButtonText={submitModalLoading ? 'Loading...' : (submitModalSuccess ? "Success" : 'Submit')}
                    confirmButtonDisabled={submitModalLoading || submitModalSuccess}
                >
                    <div>
                        <p>
                            Are you sure you want to Submit <strong>
                                {data.landowner_type === 'individual' ? (
                                    `${data.first_name} ${data.other_names ? data.other_names + ' ' : ''}${data.surname}`
                                ) : (
                                    data.company_name
                                )}
                            </strong>?
                        </p>

                        <label htmlFor="Submit_remarks" className="block text-sm font-medium text-gray-700 mt-4">
                            Approval Remarks:
                        </label>
                        <textarea
                            id="Submit_remarks"
                            rows="3"
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                        {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
                    </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
