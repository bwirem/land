import React, { useEffect, useState, useCallback, Fragment } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEdit, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { debounce } from 'lodash'; // Or your preferred debounce implementation

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

// --- Constants ---
const DEBOUNCE_DELAY = 300; // milliseconds

// --- Component ---
export default function Index({ auth, sites: sitesPagination, filters }) {
    const { data: siteEntries } = sitesPagination ?? { data: [] }; // Ensure siteEntries is always an array

    // useForm is now primarily for making the request and handling loading/errors
    // We don't need 'search' in its initial data state anymore.
    const { get, errors, processing } = useForm();

    // Local state for the controlled search input
    // Initialize directly from the filters prop
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    // State to manage expanded rows
    const [expandedRows, setExpandedRows] = useState({});

    // Debounced function to fetch data
    // Only depends on the stable 'get' function from useForm
    const debouncedGetData = useCallback(
        debounce((currentSearchTerm) => {
            get(route("investor1.index"), {
                // Pass the search term directly
                search: currentSearchTerm
            }, {
                preserveState: true, // Keep component state (like expanded rows)
                preserveScroll: true, // Keep scroll position
                replace: true, // Avoid pushing duplicate history entries
                // On success/error, Inertia will provide new props (including filters)
            });
        }, DEBOUNCE_DELAY),
        [get] // Dependency: only the stable 'get' function reference
    );

    // Effect 1: Trigger debounce when the user *types* in the search box
    useEffect(() => {
        // Only call the debounced function if the term is different
        // from what's currently reflected in the filters.
        // This prevents triggering a request when the component mounts
        // with a search term already applied via filters.
        if (searchTerm !== (filters.search || "")) {
             debouncedGetData(searchTerm);
        }

        // Cleanup function to cancel the debounce timer
        // if the component unmounts or searchTerm changes again quickly
        return () => debouncedGetData.cancel();

    }, [searchTerm, filters.search, debouncedGetData]); // Depend on searchTerm and filters.search

    // Effect 2: Synchronize local searchTerm state if filters.search changes
    // from *outside* this component (e.g., browser back/forward, external link)
    useEffect(() => {
        // If the incoming filter prop doesn't match the local state, update the local state.
        if (filters.search !== searchTerm) {
            setSearchTerm(filters.search || "");
        }
    }, [filters.search]); // Only depend on filters.search

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Group sites by site.id (Project)
    const groupedSites = (siteEntries ?? []).reduce((acc, entry) => {
        const siteId = entry?.site?.id;
        if (siteId) {
            if (!acc[siteId]) {
                acc[siteId] = {
                    projectDescription: entry.site.project_description,
                    investorEntries: [],
                };
            }
            acc[siteId].investorEntries.push(entry);
        }
        return acc;
    }, {});

    const toggleRow = (siteId) => {
        setExpandedRows(prev => ({
            ...prev,
            [siteId]: !prev[siteId],
        }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Site Interest</h2>}
        >
            <Head title="Site Interest" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            {/* Header Actions */}
                            <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="relative flex items-center">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search by land owner name..."
                                        // Use local searchTerm state for value
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className={`rounded border py-1 pl-10 pr-2 text-sm text-gray-700 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-indigo-500 ${errors.search ? "border-red-500" : "border-gray-300"}`}
                                        disabled={processing}
                                    />
                                    {processing && <span className="ml-2 animate-pulse text-sm text-gray-500">Searching...</span>}
                                    {errors.search && <p className="mt-1 text-xs text-red-500">{errors.search}</p>}
                                </div>
                            </div>

                            {/* Sites Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 text-sm shadow-md dark:border-gray-700">
                                     {/* ... thead ... */}
                                     <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="border-b p-3 text-left font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">Project Description</th>
                                            <th scope="col" className="border-b p-3 text-left font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">Investor(s)</th>
                                            <th scope="col" className="border-b p-3 text-center font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedSites).length > 0 ? (
                                            Object.entries(groupedSites).map(([siteId, groupData]) => (
                                                <Fragment key={siteId}>
                                                    {/* Main Row */}
                                                    <tr
                                                        onClick={() => toggleRow(siteId)}
                                                        className="cursor-pointer border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                                                        aria-expanded={!!expandedRows[siteId]}
                                                    >
                                                        <td className="p-3 text-gray-700 dark:text-gray-300">
                                                            <FontAwesomeIcon
                                                                icon={expandedRows[siteId] ? faChevronUp : faChevronDown}
                                                                className="mr-2 inline-block w-4 text-center text-gray-500"
                                                                fixedWidth
                                                            />
                                                            {groupData.projectDescription}
                                                        </td>
                                                        <td className="p-3 text-gray-700 dark:text-gray-300">
                                                            {groupData.investorEntries[0]?.investor?.company_name ?? 'N/A'}
                                                            {groupData.investorEntries.length > 1 && ` (+${groupData.investorEntries.length - 1} more)`}
                                                        </td>
                                                         <td className="p-3 text-center">
                                                             {/* Only show action on main row if just one investor */}
                                                            {groupData.investorEntries.length === 1 && (
                                                                <Link
                                                                    href={route("investor1.edit", groupData.investorEntries[0].id)}
                                                                    className="inline-flex items-center rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600"
                                                                    as="button"
                                                                    disabled={processing} // Disable while loading
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                                    Process
                                                                </Link>
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Sub-Rows */}
                                                    {expandedRows[siteId] && groupData.investorEntries.map((entry) => (
                                                        <tr key={entry.id} className="border-b bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
                                                            <td className="p-3 pl-10 text-gray-600 dark:text-gray-400"> {/* Indented */}
                                                                {/* Maybe investor contact person? Or leave empty */}
                                                            </td>
                                                            <td className="p-3 text-gray-700 dark:text-gray-300">
                                                                {entry.investor?.company_name ?? 'N/A'}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Link
                                                                    href={route("investor1.edit", entry.id)}
                                                                    className="inline-flex items-center rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600"
                                                                    as="button"
                                                                    disabled={processing} // Disable while loading
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                                    Process
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                   {processing ? 'Loading...' : 'No pending sites found.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Optional: Add Pagination Links */}
                            {/* <Pagination links={sitesPagination.links} /> */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Example Pagination Component (if needed)
// const Pagination = ({ links }) => ( ... );