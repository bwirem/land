<?php
namespace App\Http\Controllers;

use App\Models\SiteSector;
use Illuminate\Http\Request;

class SiteSectorController extends Controller
{
    /**
     * Display a listing of sectors.
     */
    public function index(Request $request)
    {
        $query = SiteSector::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $sectors = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/SiteSetup/Sectors/Index', [
            'sectors' => $sectors,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Show the form for creating a new sector.
     */
    public function create()
    {
        return inertia('SystemConfiguration/SiteSetup/Sectors/Create');
    }

    /**
     * Store a newly created sector in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the sector
        SiteSector::create($validated);

        return redirect()->route('systemconfiguration0.sectors.index')
            ->with('success', 'Sector created successfully.');
    }

    /**
     * Show the form for editing the specified sector.
     */
    public function edit(Sector $sector)
    {
        return inertia('SystemConfiguration/SiteSetup/Sectors/Edit', [
            'sector' => $sector,
        ]);
    }

    /**
     * Update the specified sector in storage.
     */
    public function update(Request $request, Sector $sector)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
        ]);

        // Update the sector
        $sector->update($validated);

        return redirect()->route('systemconfiguration0.sectors.index')
            ->with('success', 'Sector updated successfully.');
    }

    /**
     * Remove the specified sector from storage.
     */
    public function destroy(Sector $sector)
    {
        $sector->delete();

        return redirect()->route('systemconfiguration0.sectors.index')
            ->with('success', 'Sector deleted successfully.');
    }

    /**
     * Search for sectors based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $sector = SiteSector::where('name', 'like', '%' . $query . '%')->get();        
        return response()->json(['sector' => $sector]);
    }
}

