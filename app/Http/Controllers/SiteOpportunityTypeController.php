<?php
namespace App\Http\Controllers;

use App\Models\SiteOpportunityType;
use Illuminate\Http\Request;

class SiteOpportunityTypeController extends Controller
{
    /**
     * Display a listing of opportunitytypes.
     */
    public function index(Request $request)
    {
        $query = SiteOpportunityType::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $opportunitytypes = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/SiteSetup/OpportunityTypes/Index', [
            'opportunitytypes' => $opportunitytypes,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Show the form for creating a new opportunitytype.
     */
    public function create()
    {
        return inertia('SystemConfiguration/SiteSetup/OpportunityTypes/Create');
    }

    /**
     * Store a newly created opportunitytype in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the opportunitytype
        SiteOpportunityType::create($validated);

        return redirect()->route('systemconfiguration0.opportunitytypes.index')
            ->with('success', 'OpportunityType created successfully.');
    }

    /**
     * Show the form for editing the specified opportunitytype.
     */
    public function edit(SiteOpportunityType $opportunitytype)
    {
        return inertia('SystemConfiguration/SiteSetup/OpportunityTypes/Edit', [
            'opportunitytype' => $opportunitytype,
        ]);
    }

    /**
     * Update the specified opportunitytype in storage.
     */
    public function update(Request $request, SiteOpportunityType $opportunitytype)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
        ]);

        // Update the opportunitytype
        $opportunitytype->update($validated);

        return redirect()->route('systemconfiguration0.opportunitytypes.index')
            ->with('success', 'OpportunityType updated successfully.');
    }

    /**
     * Remove the specified opportunitytype from storage.
     */
    public function destroy(SiteOpportunityType $opportunitytype)
    {
        $opportunitytype->delete();

        return redirect()->route('systemconfiguration0.opportunitytypes.index')
            ->with('success', 'OpportunityType deleted successfully.');
    }

    /**
     * Search for opportunitytypes based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $opportunitytype = SiteOpportunityType::where('name', 'like', '%' . $query . '%')->get();        
        return response()->json(['opportunitytype' => $opportunitytype]);
    }
}

