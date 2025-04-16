import React, { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faIndustry, faLocationDot, faLocation, faGavel, faMountain, faSpa,
faRulerCombined, faLandmark, faLightbulb, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import MapView from '../Components/MapView';
import InputLabel from '@/Components/InputLabel';      
import TextInput from '@/Components/TextInput';        
import InputError from '@/Components/InputError';      
import PrimaryButton from '@/Components/PrimaryButton';  
import SecondaryButton from '@/Components/SecondaryButton';

const FlashMessage = ({ message, type = 'success' }) => {
    if (!message) return null;

    const baseStyle = "p-4 mb-4 text-sm rounded-lg";
    const styles = {
        success: `${baseStyle} text-green-800 bg-green-100 dark:bg-gray-800 dark:text-green-400`,
        error: `${baseStyle} text-red-800 bg-red-100 dark:bg-gray-800 dark:text-red-400`,
        warning: `${baseStyle} text-yellow-800 bg-yellow-100 dark:bg-gray-800 dark:text-yellow-300`,
        info: `${baseStyle} text-blue-800 bg-blue-100 dark:bg-gray-800 dark:text-blue-400`,
    };

    const typeKey = type.toLowerCase();
    const typeName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);

    return (
        <div className={styles[typeKey] || styles.info} role="alert">
            <span className="font-medium">{typeName}!</span> {message}
        </div>
    );
};


export default function SiteDetail({ site, area }) {
    const { props } = usePage();
    const { flash } = props; // Destructure flash 

    const successMessage = flash?.success || null;
    const errorMessage = flash?.error || null;
    const infoMessage = flash?.info || null;


    const [mapData, setMapData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, put, processing, errors, reset, clearErrors, recentlySuccessful } = useForm({
        investorName: "",
        investorEmail: "",
        investorPhone: "",
        description: ""
    });
    

    useEffect(() => {
        if (area) {
            setMapData({
                center: area.coordinates.length ? area.coordinates[0] : [-6.7857, 35.7390],
                zoom: 10,
                tileLayerURL: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                attributionText: '© <a href="https://carto.com/">CARTO</a> | © <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
                markerHTML: `<div style="width: 10px; height: 10px; background-color: black; border-radius: 50%; border: 2px solid white;"></div>`,
                polygonSettings: {
                    color: area.color || "blue",
                    fillColor: area.color || "blue",
                    fillOpacity: 0.3,
                }
            });
        }
    }, [area]);

    const handleModalSubmit = (e) => {
        e.preventDefault();
        const url = route('interest', { id: site.id });

        put(url, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Interest submitted successfully!");
                closeModal();
            },
            onError: (errorObject) => {
                console.error('Error submitting interest:', errorObject);
                const firstErrorKey = Object.keys(errorObject)[0];
                if (firstErrorKey) {
                    const errorInput = document.getElementsByName(firstErrorKey)[0];
                    errorInput?.focus();
                }
            },
        });
    };

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        closeModal();
    };

    useEffect(() => {
        if (recentlySuccessful) {
            const timer = setTimeout(() => {
                closeModal();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful]);

    return (
        <>
            <Head title="Site Details" />

            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-xl px-4">
                <FlashMessage message={successMessage} type="success" />
                <FlashMessage message={errorMessage} type="error" />
                <FlashMessage message={infoMessage} type="info" />
            </div>

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
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faIndustry} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Sector</p>
                                        <small>{site.sector ? site.sector.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLocationDot} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Location</p>
                                        <small>{site.street_name}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLocation} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Zone</p>
                                        <small>{site.branch ? site.branch.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faGavel} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Land Allocation Method</p>
                                        <small>{site.allocationmethod ? site.allocationmethod.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faMountain} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Opportunity Type</p>
                                        <small>{site.opportunitytype ? site.opportunitytype.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faSpa} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Activity</p>
                                        <small>{site.activity ? site.activity.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLightbulb} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Utilities</p>
                                        <small>{site.utility ? site.utility.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faLandmark} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Jurisdiction</p>
                                        <small>{site.jurisdiction ? site.jurisdiction.name : "N/A"}</small>
                                    </div>
                                </div>
                                <div className="card card-stats">
                                    <div className="card-header">
                                        <FontAwesomeIcon icon={faRulerCombined} size="2x" />
                                    </div>
                                    <div className="card-content">
                                        <p className="category">Land Area</p>
                                        <small>{site.landarea} m²</small>
                                    </div>
                                </div>
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
                            <button
                                type="button"
                                onClick={openModal}
                                className="bg-green-500 text-white rounded p-2 flex items-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mt-4"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Submit Site Interest</span>
                            </button>
                        </div>
                    </div>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <form onSubmit={handleModalSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Submit Site Interest</h2>
                        <div className="mb-2">
                            <InputLabel htmlFor="investorName" value="Investor Name" />
                            <TextInput
                                id="investorName"
                                name="investorName"
                                value={data.investorName}
                                onChange={(e) => setData('investorName', e.target.value)}
                                className="w-full mt-1"
                                required
                            />
                            <InputError message={errors.investorName} className="mt-1 text-xs" />
                        </div>
                        <div className="mb-2">
                            <InputLabel htmlFor="investorEmail" value="Investor Email" />
                            <TextInput
                                id="investorEmail"
                                type="email"
                                name="investorEmail"
                                value={data.investorEmail}
                                onChange={(e) => setData('investorEmail', e.target.value)}
                                className="w-full mt-1"
                                required
                            />
                            <InputError message={errors.investorEmail} className="mt-1 text-xs" />
                        </div>
                        <div className="mb-2">
                            <InputLabel htmlFor="investorPhone" value="Investor Phone" />
                            <TextInput
                                id="investorPhone"
                                name="investorPhone"
                                value={data.investorPhone}
                                onChange={(e) => setData('investorPhone', e.target.value)}
                                className="w-full mt-1"
                                required
                            />
                            <InputError message={errors.investorPhone} className="mt-1 text-xs" />
                        </div>
                        <div className="mb-4">
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className={`mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${errors.description ? 'border-red-500' : ''}`}
                                required
                            />
                            <InputError message={errors.description} className="mt-1 text-xs" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <SecondaryButton type="button" onClick={handleCancel} disabled={processing}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing} className={processing ? 'opacity-25' : ''}>
                                {processing ? 'Submitting...' : 'Submit'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
