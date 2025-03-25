import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ areas, center, zoom, tileLayerUrl, attribution, markerHtml, polygonOptions }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof L !== 'undefined') {
            if (!areas || areas.length === 0) {
                console.warn("No areas available for mapping.");
                return;
            }

            if (!mapRef.current && mapContainerRef.current) {
                mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

                L.tileLayer(tileLayerUrl, {
                    attribution: attribution
                }).addTo(mapRef.current);
            }

            if (mapRef.current) {
                mapRef.current.eachLayer((layer) => {
                    if (layer instanceof L.Polygon || layer instanceof L.Marker) {
                        mapRef.current.removeLayer(layer);
                    }
                });

                let allBounds = [];

                areas.forEach((area) => {
                    if (!area.coordinates || area.coordinates.length === 0) {
                        console.warn(`Skipping area "${area.name}" due to missing coordinates.`);
                        return;
                    }

                    try {
                        let polygon = L.polygon(area.coordinates, polygonOptions).addTo(mapRef.current);
                        let center = polygon.getBounds().getCenter();

                        let marker = L.marker(center, {
                            icon: L.divIcon({
                                className: "custom-marker",
                                html: markerHtml,
                            }),
                        }).addTo(mapRef.current);

                        marker.bindPopup(`
                            <strong>${area.name} Center</strong><br>
                            Lat: ${center.lat.toFixed(6)}<br>
                            Lng: ${center.lng.toFixed(6)}
                        `);

                        allBounds.push(polygon.getBounds());

                    } catch (error) {
                        console.error(`Error drawing area "${area.name}":`, error);
                    }
                });

                if (allBounds.length) {
                    let combinedBounds = allBounds.reduce((bounds, b) => bounds.extend(b), L.latLngBounds(allBounds[0]));
                    mapRef.current.fitBounds(combinedBounds);
                }
            }

            return () => {
                if (mapRef.current) {
                    console.log("Map is being removed.");
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
        }
    }, [areas, center, zoom, tileLayerUrl, attribution, markerHtml, polygonOptions]); // React when any of these props change

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default MapView;