<?php
namespace App\Http\Controllers;

use App\Models\SiteActivity;
use Illuminate\Http\Request;

class SiteActivityController extends Controller
{
    /**
     * Display a listing of activities.
     */
    public function index(Request $request)
    {
        $query = SiteActivity::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $activities = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/SiteSetup/Activities/Index', [
            'activities' => $activities,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Show the form for creating a new activity.
     */
    public function create()
    {
        return inertia('SystemConfiguration/SiteSetup/Activities/Create');
    }

    /**
     * Store a newly created activity in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create the activity
        SiteActivity::create($validated);

        return redirect()->route('systemconfiguration0.activities.index')
            ->with('success', 'Activity created successfully.');
    }

    /**
     * Show the form for editing the specified activity.
     */
    public function edit(SiteActivity $activity)
    {
        return inertia('SystemConfiguration/SiteSetup/Activities/Edit', [
            'activity' => $activity,
        ]);
    }

    /**
     * Update the specified activity in storage.
     */
    public function update(Request $request,SiteActivity $activity)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
        ]);

        // Update the activity
        $activity->update($validated);

        return redirect()->route('systemconfiguration0.activities.index')
            ->with('success', 'Activity updated successfully.');
    }

    /**
     * Remove the specified activity from storage.
     */
    public function destroy(SiteActivity $activity)
    {
        $activity->delete();

        return redirect()->route('systemconfiguration0.activities.index')
            ->with('success', 'Activity deleted successfully.');
    }

    /**
     * Search for activities based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $activity = SiteActivity::where('name', 'like', '%' . $query . '%')->get();        
        return response()->json(['activity' => $activity]);
    }
}

