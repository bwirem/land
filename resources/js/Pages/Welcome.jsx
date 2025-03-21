import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingUsd, faUsers, faRocket } from "@fortawesome/free-solid-svg-icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const MapView = ({ initialSectors, initialSites, initialAreas }) => {
    const [sector, setSector] = useState("");
    const [sites, setSites] = useState(initialSites);
    const [areas, setAreas] = useState(initialAreas);

    useEffect(() => {
        if (sector) {
            axios.get(`/api/sites?sector_id=${sector}`).then((response) => {
                setSites(response.data.sites);
                setAreas(response.data.areas);
            });
        }
    }, [sector]);

    useEffect(() => {
        if (!areas || areas.length === 0) {
            console.warn("No areas available for mapping.");
            return;
        }
    
        const mapContainer = document.getElementById("map");
        if (!mapContainer) {
            console.error("Map container not found.");
            return;
        }
    
        const map = L.map("map").setView([-6.7857, 35.7390], 6);
    
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    
        let allBounds = [];
    
        areas.forEach((area) => {
            if (!area.coordinates || area.coordinates.length === 0) {
                console.warn(`Skipping area "${area.name}" due to missing coordinates.`);
                return;
            }
    
            // Draw the area polygon
            let polygon = L.polygon(area.coordinates, {
                color: area.color || "blue",
                fillColor: area.color || "blue",
                fillOpacity: 0.3,
            }).addTo(map);
    
            // Get the center of the polygon
            let center = polygon.getBounds().getCenter();
    
            // Create a clickable marker
            let marker = L.marker(center, {
                icon: L.divIcon({
                    className: "custom-marker",
                    html: `<div style="
                        width: 10px; height: 10px; 
                        background-color: black; 
                        border-radius: 50%;
                        border: 2px solid white;">
                    </div>`,
                }),
            }).addTo(map);
    
            // Bind a popup to the marker
            marker.bindPopup(`
                <strong>${area.name} Center</strong><br>
                Lat: ${center.lat.toFixed(6)}<br>
                Lng: ${center.lng.toFixed(6)}
            `);
    
            allBounds.push(polygon.getBounds());
        });
    
        // Adjust map view to fit all areas
        if (allBounds.length) {
            let combinedBounds = allBounds.reduce((bounds, b) => bounds.extend(b), L.latLngBounds(allBounds[0]));
            map.fitBounds(combinedBounds);
        }
    
        return () => {
            map.remove();
        };
    }, [areas]);
    
    

    return (
        <main className="mt-1 md:mt-1"> {/* Reduced margin */}
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 p-4">
                    <div className="bg-white shadow-md p-4">
                        <select
                            className="form-control w-full p-2 border rounded"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                        >
                            <option value="" disabled>Select Sector</option>
                            {initialSectors.map((s) => (
                                <option key={s.id} value={s.id}>{s.description}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4 h-72 overflow-y-auto border p-4 bg-white">
                        {sites.length ? (
                            sites.map((site) => (
                                <div key={site.id} className="bg-gray-100 p-3 mb-2 rounded-md">
                                    <p className="text-sm font-bold">{site.project_description}</p>
                                    <p className="text-xs text-gray-500">{site.street_name}</p>
                                    <Link href={`/homesite/${site.id}`} className="text-blue-500 text-xs">View More</Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No sites found.</p>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-2/3">
                    <div id="map" className="h-96 md:h-[500px] w-full rounded shadow-md"></div>
                </div>
            </div>
        </main>
    );
    
};

export default function WelcomeSupport({ auth, initialSectors, initialSites, initialAreas }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen flex items-center justify-center text-white">
                <img
                    id="background"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    src="/img/register.jpg"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
                    <div className="relative z-20 w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-1 md:grid-cols-3 items-center gap-1 py-2 text-center md:text-left">
                            <div className="md:col-start-2 flex flex-col items-center">
                                <h1 className="text-xl md:text-2xl font-bold text-blue-500">Land Management</h1>
                            </div>
                            <nav className="flex justify-center md:justify-end">
                                {auth && auth.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex space-x-1">
                                        <Link href={route("login")} className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition">
                                            Log In
                                        </Link>
                                        <Link href={route("register")} className="bg-transparent text-blue-500 px-3 py-1 rounded-full hover:bg-blue-500 hover:text-white transition ring-1 ring-blue-500">
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </header>
                        <MapView initialSectors={initialSectors} initialSites={initialSites} initialAreas={initialAreas} className="mt-0" />                 
                    </div>
            </div>
        </>
    );
}
