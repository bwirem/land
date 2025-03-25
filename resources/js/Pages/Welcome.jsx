import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import MapView from '../Components/MapView';
import axios from 'axios';

export default function WelcomeSupport({ auth, initialSectors, initialSites, initialAreas }) {
    const [sector, setSector] = useState("");
    const [sites, setSites] = useState(initialSites);
    const [areas, setAreas] = useState(initialAreas);

    const handleSectorChange = (e) => {
        setSector(e.target.value);
    };

    useEffect(() => {
        if (sector) {
            axios.get(`/api/sites?sector_id=${sector}`)
                .then(response => {
                    console.log("API Response:", response.data);
                    setSites(response.data.sites);
                    setAreas(response.data.areas);
                })
                .catch(error => {
                    console.error("Error fetching sites:", error);
                });
        }
    }, [sector]);

    // const mapCenter = [-6.7857, 35.7390]; // Default map center
    // const mapZoom = 6;
    // const tileLayerURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    // const attributionText = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    // const markerHTML = `<div style="
    //                     width: 10px; height: 10px; 
    //                     background-color: black; 
    //                     border-radius: 50%;
    //                     border: 2px solid white;">
    //                 </div>`;
    // const polygonSettings = {
    //     color: "blue",
    //     fillColor: "blue",
    //     fillOpacity: 0.3,
    // };

    const mapCenter = [-6.7857, 35.7390]; // Default map center
    const mapZoom = 6;

    // Use CARTO Basemap
    const tileLayerURL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    const attributionText = '© <a href="https://carto.com/">CARTO</a> | © <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors';

    // Marker style
    const markerHTML = `<div style="
                        width: 10px; height: 10px; 
                        background-color: black; 
                        border-radius: 50%;
                        border: 2px solid white;">
                    </div>`;

    // Polygon style
    const polygonSettings = {
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.3,
    };


    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen flex flex-col items-center text-white">
                <img
                    id="background"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    src="/img/register.jpg"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

                {/* Header */}
                <header className="relative z-20 w-full max-w-7xl px-6 py-3 flex flex-col md:flex-row items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-bold text-blue-500">Land Management</h1>
                    <nav className="flex space-x-2">
                        {auth && auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route("login")} className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition">
                                    Log In
                                </Link>
                                <Link href={route("register")} className="bg-transparent text-blue-500 px-3 py-1 rounded-full hover:bg-blue-500 hover:text-white transition ring-1 ring-blue-500">
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Content - Increased Height and Closer to Header */}

                <main className="relative z-20 w-full max-w-7xl flex flex-col md:flex-row flex-grow h-[90vh]">
                    <div className="w-full md:w-1/3 p-4 h-full flex flex-col">
                        <div className="bg-white shadow-md p-4 text-gray-900">
                            <select
                                className="form-control w-full p-2 border rounded"
                                value={sector}
                                onChange={handleSectorChange}
                            >
                                <option value="" disabled>Select Sector</option>
                                {initialSectors.map((s) => (
                                    <option key={s.id} value={s.id}>{s.description}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4 flex-grow overflow-y-auto border p-4 bg-white text-gray-900">
                            {sites.length ? (
                                sites.map((site) => (
                                    <div key={site.id} className="bg-gray-100 p-3 mb-2 rounded-md">
                                        <p className="text-sm font-bold text-gray-900">{site.project_description}</p>
                                        <p className="text-sm text-gray-600">{site.street_name}</p>
                                        <Link href={`/homesite/${site.id}`} className="text-blue-600 text-sm font-semibold">
                                            View More
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">No sites found.</p>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 p-4">
                        <MapView
                            areas={areas}
                            center={mapCenter}
                            zoom={mapZoom}
                            tileLayerUrl={tileLayerURL}
                            attribution={attributionText}
                            markerHtml={markerHTML}
                            polygonOptions={polygonSettings}
                        />
                    </div>
                </main>

                
            </div>

        </>
    );
}