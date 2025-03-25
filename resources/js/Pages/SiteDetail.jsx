import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faIndustry, faLocationDot, faLocation, faGavel, faMountain, faSpa, 
faRulerCombined, faLandmark, faLightbulb, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import MapView from "../components/MapView";

export default function SiteDetail({ site, area }) {
    const [mapData, setMapData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [formData, setFormData] = useState({
        investorName: "",
        investorEmail: "",
        investorPhone: "",
        description: ""
    });
    const [formErrors, setFormErrors] = useState({}); 

    useEffect(() => {
        if (area) {
            setMapData({
                center: area.coordinates.length ? area.coordinates[0] : [-6.7857, 35.7390], 
                zoom: 10,
                tileLayerURL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                attributionText: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                markerHTML: `<div style="width: 10px; height: 10px; background-color: black; border-radius: 50%; border: 2px solid white;"></div>`,
                polygonSettings: {
                    color: area.color || "blue",
                    fillColor: area.color || "blue",
                    fillOpacity: 0.3,
                }
            });
        }
    }, [area]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name]: "" }); 
    };

    
    const handleModalSubmit = async () => {
        const errors = {};
    
        // Validation logic
        if (!formData.investorName) {
            errors.investorName = "Investor name is required.";
        }
    
        if (!formData.investorEmail) {
            errors.investorEmail = "Investor email is required.";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.investorEmail)) {
            errors.investorEmail = "Invalid email address.";
        }
    
        if (!formData.investorPhone) {
            errors.investorPhone = "Investor Phone is required.";
        }
    
        if (!formData.description) {
            errors.description = "Description is required.";
        }
    
        // Check for validation errors
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors); 
            return; 
        }
    
        try {
            const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
            if (!csrfMetaTag) {
                throw new Error('CSRF meta tag not found.');
            }
            const csrfToken = csrfMetaTag.getAttribute('content');
    
            const response = await fetch(`/interest/${site.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken, // Include CSRF token
                    'X-Requested-With': 'XMLHttpRequest', // Indicate it's an AJAX request
                },
                body: JSON.stringify({
                    investorName: formData.investorName,
                    investorEmail: formData.investorEmail,
                    investorPhone: formData.investorPhone,
                    description: formData.description,
                }),
            });
    
            // Check if the response is ok
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Network response was not ok');
            }
    
            const data = await response.json();
            console.log(data.message);
            setIsModalOpen(false);
            setFormData({ investorName: "", investorEmail: "", investorPhone: "", description: "" }); // Reset form data
            setFormErrors({}); // Clear any previous errors
        } catch (error) {
            console.error('Error:', error);
            setFormErrors({ general: error.message }); // Set a general error message
        }
    };
    

    return (
        <>
            <Head title="Site Details" />
            <div className="relative min-h-screen flex flex-col items-center text-white">
                <img id="background" className="absolute inset-0 w-full h-full object-cover z-0" src="/img/register.jpg" alt="Background" />
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

                <header className="relative z-20 w-full max-w-7xl px-6 py-3 flex flex-col md:flex-row items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-bold text-blue-500">Site Details</h1>
                </header>

                <main className="relative z-20 w-full max-w-7xl flex flex-col md:flex-row flex-grow h-[90vh]">
                    <div className="w-full md:w-1/3 p-4 h-full flex flex-col overflow-y-auto">
                        <div className="bg-white shadow-md p-4 text-gray-900 rounded-md">
                            <div className="bg-gray-100 p-3 mb-2 rounded-md">
                                <p className="text-sm font-bold text-gray-900">{site.project_description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Card 1: Sector */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faIndustry} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Sector</p>
                                        <small>{site.sector ? site.sector.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 2: Location */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLocationDot} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Location</p>
                                        <small>{site.street_name}</small>
                                    </div>
                                </div>

                                {/* Card 3: Zone */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLocation} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Zone</p>
                                        <small>{site.branch ? site.branch.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 4: Land Allocation Method */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faGavel} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Land Allocation Method</p>
                                        <small>{site.allocationmethod ? site.allocationmethod.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 5: Opportunity Type */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faMountain} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Opportunity Type</p>
                                        <small>{site.opportunitytype ? site.opportunitytype.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 6: Activity */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faSpa} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Activity</p>                                            
                                        <small>{site.activity ? site.activity.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 7: Utilities */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLightbulb} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Utilities</p>
                                        <small>{site.utility ? site.utility.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 8: Jurisdiction */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLandmark} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Jurisdiction</p>
                                        <small>{site.jurisdiction ? site.jurisdiction.name : "N/A"}</small>
                                    </div>
                                </div>

                                {/* Card 9: Land Area */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faRulerCombined} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Land Area</p>
                                        <small>{site.landarea} m²</small>
                                    </div>
                                </div>

                                {/* Card 10: Price of Land */}
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Price of Land</p>
                                        <small>{site.priceofland}</small>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="bg-green-500 text-white rounded p-2 flex items-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mt-4"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Submit Site Interest</span>
                            </button>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="w-full md:w-2/3 p-4">
                        {mapData && (
                            <MapView
                                areas={[area]}
                                center={mapData.center}
                                zoom={mapData.zoom}
                                tileLayerUrl={mapData.tileLayerURL}
                                attribution={mapData.attributionText}
                                markerHtml={mapData.markerHTML}
                                polygonOptions={mapData.polygonSettings}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Submit Site Interest</h2>
                        <div className="mb-2">
                            <label className="block text-gray-600 text-sm font-semibold">Investor Name</label>
                            <input
                                type="text"
                                name="investorName"
                                value={formData.investorName}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-500 ${formErrors.investorName ? 'border-red-500' : ''}`}
                            />
                            {formErrors.investorName && <p className="text-red-500 text-xs">{formErrors.investorName}</p>}
                        </div>
                        <div className="mb-2">
                            <label className="block text-gray-600 text-sm font-semibold">Investor Email</label>
                            <input
                                type="email"
                                name="investorEmail"
                                value={formData.investorEmail}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-500 ${formErrors.investorEmail ? 'border-red-500' : ''}`}
                            />
                            {formErrors.investorEmail && <p className="text-red-500 text-xs">{formErrors.investorEmail}</p>}
                        </div>

                        <div className="mb-2">
                            <label className="block text-gray-600 text-sm font-semibold">Investor Phone</label>
                            <input
                                type="text"
                                name="investorPhone"
                                value={formData.investorPhone}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-500 ${formErrors.investorPhone ? 'border-red-500' : ''}`}
                            />
                            {formErrors.investorPhone && <p className="text-red-500 text-xs">{formErrors.investorPhone}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-semibold">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-500 ${formErrors.description ? 'border-red-500' : ''}`}
                            />
                            {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setFormData({ investorName: "", investorEmail: "", investorPhone: "",  description: "" }); // Reset form data
                                }}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalSubmit}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
