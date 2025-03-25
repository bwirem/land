<?php
namespace App\Http\Controllers;

use App\Models\SiteJurisdiction;
use Illuminate\Http\Request;

class SiteJurisdictionController extends Controller
{
    /**
     * Display a listing of jurisdictions.
     */
    public function index(Request $request)
    {
        $query = SiteJurisdiction::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $jurisdictions = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/SiteSetup/Jurisdictions/Index', [
            'jurisdictions' => $jurisdictions,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Show the form for creating a new jurisdiction.
     */
    public function create()
    {
        return inertia('SystemConfiguration/SiteSetup/Jurisdictions/Create');
    }

    /**
     * Store a newly created jurisdiction in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the jurisdiction
        SiteJurisdiction::create($validated);

        return redirect()->route('systemconfiguration0.jurisdictions.index')
            ->with('success', 'Jurisdiction created successfully.');
    }

    /**
     * Show the form for editing the specified jurisdiction.
     */
    public function edit(SiteJurisdiction $jurisdiction)
    {
        return inertia('SystemConfiguration/SiteSetup/Jurisdictions/Edit', [
            'jurisdiction' => $jurisdiction,
        ]);
    }

    /**
     * Update the specified jurisdiction in storage.
     */
    public function update(Request $request, SiteJurisdiction $jurisdiction)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
        ]);

        // Update the jurisdiction
        $jurisdiction->update($validated);

        return redirect()->route('systemconfiguration0.jurisdictions.index')
            ->with('success', 'Jurisdiction updated successfully.');
    }

    /**
     * Remove the specified jurisdiction from storage.
     */
    public function destroy(SiteJurisdiction $jurisdiction)
    {
        $jurisdiction->delete();

        return redirect()->route('systemconfiguration0.jurisdictions.index')
            ->with('success', 'Jurisdiction deleted successfully.');
    }

    /**
     * Search for jurisdictions based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $jurisdiction = SiteJurisdiction::where('name', 'like', '%' . $query . '%')->get();        
        return response()->json(['jurisdiction' => $jurisdiction]);
    }
}

