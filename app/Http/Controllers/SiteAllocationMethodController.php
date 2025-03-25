<?php
namespace App\Http\Controllers;

use App\Models\SiteAllocationMethod;
use Illuminate\Http\Request;

class SiteAllocationMethodController extends Controller
{
    /**
     * Display a listing of allocationmethods.
     */
    public function index(Request $request)
    {
        $query = SiteAllocationMethod::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $allocationmethods = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/SiteSetup/AllocationMethods/Index', [
            'allocationmethods' => $allocationmethods,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Show the form for creating a new allocationmethod.
     */
    public function create()
    {
        return inertia('SystemConfiguration/SiteSetup/AllocationMethods/Create');
    }

    /**
     * Store a newly created allocationmethod in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the allocationmethod
        SiteAllocationMethod::create($validated);

        return redirect()->route('systemconfiguration0.allocationmethods.index')
            ->with('success', 'AllocationMethod created successfully.');
    }

    /**
     * Show the form for editing the specified allocationmethod.
     */
    public function edit(SiteAllocationMethod $allocationmethod)
    {
        return inertia('SystemConfiguration/SiteSetup/AllocationMethods/Edit', [
            'allocationmethod' => $allocationmethod,
        ]);
    }

    /**
     * Update the specified allocationmethod in storage.
     */
    public function update(Request $request, SiteAllocationMethod $allocationmethod)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
        ]);

        // Update the allocationmethod
        $allocationmethod->update($validated);

        return redirect()->route('systemconfiguration0.allocationmethods.index')
            ->with('success', 'AllocationMethod updated successfully.');
    }

    /**
     * Remove the specified allocationmethod from storage.
     */
    public function destroy(SiteAllocationMethod $allocationmethod)
    {
        $allocationmethod->delete();

        return redirect()->route('systemconfiguration0.allocationmethods.index')
            ->with('success', 'AllocationMethod deleted successfully.');
    }

    /**
     * Search for allocationmethods based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $allocationmethod = SiteAllocationMethod::where('name', 'like', '%' . $query . '%')->get();        
        return response()->json(['allocationmethod' => $allocationmethod]);
    }
}

