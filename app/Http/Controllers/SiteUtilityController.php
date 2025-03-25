<?php
namespace App\Http\Controllers;

use App\Models\SiteUtility;
use Illuminate\Http\Request;

class SiteUtilityController extends Controller
{
    /**
     * Display a listing of utilities.
     */
    public function index(Request $request)
    {
        $query = SiteUtility::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $utilities = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/SiteSetup/Utilities/Index', [
            'utilities' => $utilities,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Show the form for creating a new utility.
     */
    public function create()
    {
        return inertia('SystemConfiguration/SiteSetup/Utilities/Create');
    }

    /**
     * Store a newly created utility in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the utility
        SiteUtility::create($validated);

        return redirect()->route('systemconfiguration0.utilities.index')
            ->with('success', 'Utility created successfully.');
    }

    /**
     * Show the form for editing the specified utility.
     */
    public function edit(SiteUtility $utility)
    {
        return inertia('SystemConfiguration/SiteSetup/Utilities/Edit', [
            'utility' => $utility,
        ]);
    }

    /**
     * Update the specified utility in storage.
     */
    public function update(Request $request, SiteUtility $utility)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
        ]);

        // Update the utility
        $utility->update($validated);

        return redirect()->route('systemconfiguration0.utilities.index')
            ->with('success', 'Utility updated successfully.');
    }

    /**
     * Remove the specified utility from storage.
     */
    public function destroy(SiteUtility $utility)
    {
        $utility->delete();

        return redirect()->route('systemconfiguration0.utilities.index')
            ->with('success', 'Utility deleted successfully.');
    }

    /**
     * Search for utilities based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $utility = SiteUtility::where('name', 'like', '%' . $query . '%')->get();        
        return response()->json(['utility' => $utility]);
    }
}

