import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimesCircle, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
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

export default function Create({auth, loanTypes,facilityBranches}) {
    // Form state using Inertia's useForm hook
    const { data, setData, post, errors, processing, reset } = useForm({
        customer_type: 'individual', // Default value
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
        customer_id: null,
        loanType: '',
        loanAmount: 0,
        loanDuration: 0,
        interestRate: 0,
        interestAmount: 0,
        monthlyRepayment: 0,
        totalRepayment: 0,
        stage: 1,
        applicationForm: null, // Add applicationForm to data
        facilitybranch_id: auth?.user?.facilitybranch_id || "",
    });

    // Customer Search State
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef(null);
    const customerSearchInputRef = useRef(null);
    const [customerIDError, setCustomerIDError] = useState(null);

    // New Customer Modal State
    const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        customer_type: 'individual',
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
    });
    const [newCustomerModalLoading, setNewCustomerModalLoading] = useState(false);
    const [newCustomerModalSuccess, setNewCustomerModalSuccess] = useState(false);

    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    // Saving state
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Customers dynamically (using Inertia)
    const fetchCustomers = useCallback((query) => {
        if (!query.trim()) {
            setCustomerSearchResults([]);
            return;
        }

        axios.get(route('systemconfiguration0.customers.search'), { params: { query } })
            .then((response) => {
                setCustomerSearchResults(response.data.customers.slice(0, 5));
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
                showAlert('Failed to fetch customers. Please try again later.');
                setCustomerSearchResults([]);
            });
    }, []);

    // Debounced customer search handler
    const debouncedCustomerSearch = useMemo(() => debounce(fetchCustomers, 300), [fetchCustomers]);

    // Fetch customers on search query change
    useEffect(() => {
        if (customerSearchQuery.trim()) {
            debouncedCustomerSearch(customerSearchQuery);
        } else {
            setCustomerSearchResults([]);
        }
    }, [customerSearchQuery, debouncedCustomerSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSaving(true);

        // Create a FormData object to handle the file upload
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        post(route('loan0.store'), formData, {
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
        setCustomerIDError(null);
        showAlert('Application created successfully!');
    };
    // Handle customer search input change
    const handleCustomerSearchChange = (e) => {
        const query = e.target.value;
        setCustomerSearchQuery(query);
        setCustomerSearchResults([]); // Clear previous results
        setShowCustomerDropdown(!!query.trim());

        // Update appropriate fields based on customer type
        setData((prevData) => ({
            ...prevData,
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
            customer_id: null,
        }));
    };

    // Clear customer search
    const handleClearCustomerSearch = () => {
        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
        if (customerSearchInputRef.current) {
            customerSearchInputRef.current.focus();
        }

        setData((prevData) => ({
            ...prevData,
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
            customer_id: null,
        }));
    };


    // Handle customer selection
    const selectCustomer = (selectedCustomer) => {
        setData((prevData) => ({
            ...prevData,
            customer_type: selectedCustomer.customer_type,
            first_name: selectedCustomer.first_name || '',
            other_names: selectedCustomer.other_names || '',
            surname: selectedCustomer.surname || '',
            company_name: selectedCustomer.company_name || '',
            email: selectedCustomer.email,
            phone: selectedCustomer.phone || '',
            customer_id: selectedCustomer.id,
        }));

        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
    };

    // Function to handle new customer button click (Open the modal)
    const handleNewCustomerClick = () => {
        setNewCustomerModalOpen(true);
        setNewCustomerModalSuccess(false); //reset state in case open again
        setNewCustomer({
            customer_type: 'individual',
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
        });
    };
    // Function to close the modal
    const handleNewCustomerModalClose = () => {
        setNewCustomerModalOpen(false);
        setNewCustomerModalLoading(false);
        setNewCustomerModalSuccess(false);
    };

    // Function to confirm new customer (you should implement saving logic here)
    const handleNewCustomerModalConfirm = async () => {
        setNewCustomerModalLoading(true);
        try {
            const response = await axios.post(route('systemconfiguration0.customers.directstore'), newCustomer);

            if (response.data && response.data.id) {
                setData((prevData) => ({
                    ...prevData,
                    customer_type: response.data.customer_type,
                    first_name: response.data.first_name,
                    other_names: response.data.other_names,
                    surname: response.data.surname,
                    company_name: response.data.company_name,
                    email: response.data.email,
                    phone: response.data.phone,
                    customer_id: response.data.id,
                }));

                setNewCustomerModalSuccess(true);
            } else {
                showAlert('Error creating new customer!');
            }
        } catch (error) {
            console.error("Error creating new customer:", error);
            showAlert('Failed to create new customer. Please try again.');
        } finally {
            setNewCustomerModalLoading(false);
            setTimeout(() => {
                setNewCustomerModalOpen(false);
                setNewCustomerModalSuccess(false);
            }, 1000)

        }

    };

     const handleLoanAmountChange = (e) => {
        const loanAmount = parseFloat(e.target.value) || 0;
        setData('loanAmount', loanAmount);
    };

    const handleLoanDurationChange = (e) => {
        const loanDuration = parseInt(e.target.value, 10) || 0;
        setData('loanDuration', loanDuration);
    };

    const calculateLoanDetails = (loanAmount, loanDuration, interestRate) => {
        // Ensure loanAmount and loanDuration are valid numbers
        console.log('Calculating loan details:', { loanAmount, loanDuration, interestRate }); // Debugging
        if (typeof loanAmount !== 'number' || typeof loanDuration !== 'number' || isNaN(loanAmount) || isNaN(loanDuration) || loanAmount <= 0 || loanDuration <= 0) {
            console.warn('Invalid loan parameters. Setting to 0.');
            setData(prevData => ({
                ...prevData,
                interestAmount: 0,
                monthlyRepayment: 0,
                totalRepayment: 0,
            }));
            return;
        }

        // Simple interest calculation
        const interestRateDecimal = interestRate / 100;
        const interestAmount = loanAmount * interestRateDecimal * (loanDuration / 12);
        const totalRepayment = loanAmount + interestAmount;
        const monthlyRepayment = totalRepayment / loanDuration;

        setData(prevData => ({
            ...prevData,
            interestAmount: interestAmount,
            monthlyRepayment: monthlyRepayment,
            totalRepayment: totalRepayment,
        }));
    };

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };

    const handleNewCustomerInputChange = (e) => {
        const { id, value } = e.target;
        setNewCustomer(prevState => ({
            ...prevState,
            [id]: value,
        }));
    };

    const handleLoanTypeChange = (e) => {
        const selectedLoanType = loanTypes.find(type => type.id === parseInt(e.target.value)); // Find the selected loan type
        if (selectedLoanType) {
             console.log('Selected loan type:', selectedLoanType); //Debugging
            setData(prevData => ({
                ...prevData,
                loanType: selectedLoanType.id, // Store the ID, not the object
                interestRate: parseFloat(selectedLoanType.interest_rate), // Use parseFloat for numbers
                loanDuration: selectedLoanType.duration, // Use the duration as default
            }));


        } else {
            setData(prevData => ({
                ...prevData,
                loanType: '',
                interestRate: 0,
                loanDuration: 0,
            }));
        }
    };
    const handleApplicationFormChange = (e) => {
        setData('applicationForm', e.target.files[0]); // Store the file object
    };

     useEffect(() => {
        // Re-calculate loan details whenever loanAmount, loanDuration or interestRate changes
         console.log('useEffect triggered. Data:', { ...data }); // Debugging
        calculateLoanDetails(
            parseFloat(data.loanAmount), // Ensure number
            parseInt(data.loanDuration, 10), // Ensure integer
            parseFloat(data.interestRate)  // Ensure number
        );
    }, [data.loanAmount, data.loanDuration, data.interestRate]);


    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Application</h2>}
        >
            <Head title="New Application" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Search and New Customer Button */}
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                <div className="relative flex-1" ref={customerDropdownRef}>
                                    <div className="flex items-center justify-between h-10">
                                        <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mr-2">
                                            Customer Name
                                        </label>
                                        {/* New Customer Button Added Here */}
                                        <button
                                            type="button"
                                            onClick={handleNewCustomerClick}
                                            className="bg-green-500 text-white rounded p-2 flex items-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search customer..."
                                        value={customerSearchQuery}
                                        onChange={handleCustomerSearchChange}
                                        onFocus={() => setShowCustomerDropdown(!!customerSearchQuery.trim())}
                                        className={`w-full border p-2 rounded text-sm pr-10 ${customerIDError ? 'border-red-500' : ''}`}
                                        ref={customerSearchInputRef}
                                        autoComplete="off"
                                    />
                                    {customerIDError && <p className="text-sm text-red-600 mt-1">{customerIDError}</p>}
                                    {customerSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={handleClearCustomerSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} />
                                        </button>
                                    )}
                                    {showCustomerDropdown && (
                                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                                            {customerSearchResults.length > 0 ? (
                                                customerSearchResults.map((customer) => (
                                                    <li
                                                        key={customer.id}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => selectCustomer(customer)}
                                                    >
                                                        {customer.customer_type === 'company' ? customer.company_name : `${customer.first_name} ${customer.surname}`}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-2 text-gray-500">No customers found.</li>
                                            )}
                                        </ul>
                                    )}
                                    {/* Display Customer Details After Selection */}
                                    {data.customer_id && (
                                        <section className="border-b border-gray-200 pb-4">
                                            <h4 className="text-md font-semibold text-gray-700 mb-3">Customer Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Customer Type:</label>
                                                    <p className="mt-1 text-sm text-gray-500">{data.customer_type}</p>
                                                </div>

                                                {data.customer_type === 'individual' ? (
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

                            {/* Branch Section */}
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
                                        {errors.loanType && <p className="text-sm text-red-600">{errors.loanType}</p>}
                                    </div>                                  
                                    
                                </div>
                            </div>   

                            {/* Loan Details Section */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="loanType" className="block text-sm font-medium text-gray-700">Loan Type</label>
                                        <select
                                            id="loanType"
                                            value={data.loanType}
                                            onChange={handleLoanTypeChange}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Loan Type</option>
                                            {loanTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                        {errors.loanType && <p className="text-sm text-red-600">{errors.loanType}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount (Tsh)</label>
                                        <input
                                            type="number"
                                            id="loanAmount"
                                            value={data.loanAmount}
                                            onChange={handleLoanAmountChange}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        />
                                        {errors.loanAmount && <p className="text-sm text-red-600">{errors.loanAmount}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="loanDuration" className="block text-sm font-medium text-gray-700">Loan Duration (Months)</label>
                                        <input
                                            type="number"
                                            id="loanDuration"
                                            value={data.loanDuration}
                                            onChange={handleLoanDurationChange}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        />
                                        {errors.loanDuration && <p className="text-sm text-red-600">{errors.loanDuration}</p>}
                                    </div>
                                </div>
                            </div>                          
                            
                            {/* Loan Details Section */}
                            {data.loanType && (
                                <section className="border-b border-gray-200 pb-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">Loan Calculation Results</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Loan Type:</label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {loanTypes.find(type => type.id === data.loanType)?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Loan Amount:</label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {parseFloat(data.loanAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Loan Duration:</label>
                                            <p className="mt-1 text-sm text-gray-500">{data.loanDuration || 'N/A'} Months</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Interest Rate:</label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {parseFloat(data.interestRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Interest Amount:</label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {parseFloat(data.interestAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Monthly Repayment:</label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {parseFloat(data.monthlyRepayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Repayment:</label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {parseFloat(data.totalRepayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                            </p>
                                        </div>                                        
                                    </div>                                    
                                </section>
                            )}
                            
                            {data.loanType && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                                 
                                    {/* Upload Application Form */}
                                    <div className="relative flex-1">
                                        <label htmlFor="applicationForm" className="block text-sm font-medium text-gray-700">
                                            Filled Application Form
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
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 mt-6">                                
                                <Link
                                    href={route('loan0.index')}  // Using the route for navigation
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

            {/* New Customer Modal */}
            <Modal
                isOpen={newCustomerModalOpen}
                onClose={handleNewCustomerModalClose}
                onConfirm={handleNewCustomerModalConfirm}
                title="Create New Customer"
                confirmButtonText={newCustomerModalLoading ? 'Loading...' : (newCustomerModalSuccess ? "Success" : 'Confirm')}
                confirmButtonDisabled={newCustomerModalLoading || newCustomerModalSuccess}
            >
                <form className="space-y-4">
                    <div>
                        <label htmlFor="customer_type" className="block text-sm font-medium text-gray-700">Customer Type</label>
                        <select
                            id="customer_type"
                            value={newCustomer.customer_type}
                            onChange={handleNewCustomerInputChange}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newCustomerModalLoading || newCustomerModalSuccess}
                        >
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                        </select>
                    </div>

                    {newCustomer.customer_type === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    value={newCustomer.first_name}
                                    onChange={handleNewCustomerInputChange}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newCustomerModalLoading || newCustomerModalSuccess}
                                />
                            </div>
                            <div>
                                <label htmlFor="other_names" className="block text-sm font-medium text-gray-700">Other Names</label>
                                <input
                                    type="text"
                                    id="other_names"
                                    value={newCustomer.other_names}
                                    onChange={handleNewCustomerInputChange}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newCustomerModalLoading || newCustomerModalSuccess}
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                                <input
                                    type="text"
                                    id="surname"
                                    value={newCustomer.surname}
                                    onChange={handleNewCustomerInputChange}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newCustomerModalLoading || newCustomerModalSuccess}
                                />
                            </div>
                        </div>
                    )}

                    {newCustomer.customer_type === 'company' && (
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                id="company_name"
                                value={newCustomer.company_name}
                                onChange={handleNewCustomerInputChange}
                                className="w-full border p-2 rounded text-sm"
                                disabled={newCustomerModalLoading || newCustomerModalSuccess}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={newCustomer.email}
                            onChange={handleNewCustomerInputChange}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newCustomerModalLoading || newCustomerModalSuccess}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={newCustomer.phone}
                            onChange={handleNewCustomerInputChange}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newCustomerModalLoading || newCustomerModalSuccess}
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