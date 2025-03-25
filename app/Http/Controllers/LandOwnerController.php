<?php

namespace App\Http\Controllers;

use App\Models\LandOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LandOwnerController extends Controller
{
    /**
     * Display a listing of LandOwners.
     */
    public function index(Request $request)
    {
        $query = LandOwner::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('other_names', 'like', '%' . $request->search . '%')
                    ->orWhere('surname', 'like', '%' . $request->search . '%')
                    ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        // Paginate the results
        $landowners = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('LandOwners/Index', [
            'landowners' => $landowners,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new landowner.
     */
    public function create()
    {
        return inertia('LandOwners/Create');
    }

    /**
     * Store a newly created landowner in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'owner_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:landowners',
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['owner_type'] == 'individual') {
            Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'sometimes|nullable',
            ])->validate();
            $validated['company_name'] = null; // Ensure company_name is null
        } else {
            Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'first_name' => 'sometimes|nullable',
                'surname' => 'sometimes|nullable',
                'other_names' => 'sometimes|nullable',
            ])->validate();

            $validated['first_name'] = null;
            $validated['other_names'] = null;
            $validated['surname'] = null;
            // Ensure individual fields are null
        }

        // Create the landowner
        LandOwner::create($validated);

        return redirect()->route('landowner0.index')
            ->with('success', 'Landowner created successfully.');
    }

    public function directstore(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'owner_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:landowners',
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['owner_type'] == 'individual') {
            Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'sometimes|nullable',
            ])->validate();
             $validated['company_name'] = null;  // Ensure company_name is null
        } else {
            Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'first_name' => 'sometimes|nullable',
                'surname' => 'sometimes|nullable',
                'other_names' => 'sometimes|nullable',
            ])->validate();
             $validated['first_name'] = null;
             $validated['other_names'] = null;
             $validated['surname'] = null; // Ensure individual fields are null
        }

        // Create the landowner
        $landowner = LandOwner::create($validated);

        // Return the created landowner as JSON
        return response()->json([
            'id' => $landowner->id,
            'owner_type' => $landowner->owner_type,
            'first_name' => $landowner->first_name,
            'other_names' => $landowner->other_names,
            'surname' => $landowner->surname,
            'company_name' => $landowner->company_name,
            'email' => $landowner->email,
            'phone' => $landowner->phone,

        ]);
    }

    /**
     * Show the form for editing the specified landowner.
     */
    public function edit(LandOwner $landowner)
    {
        return inertia('LandOwners/Edit', [
            'landowner' => $landowner,
        ]);
    }

    /**
     * Update the specified landowner in storage.
     */
    public function update(Request $request, LandOwner $landowner)
    {
        // Validate input
        $validated = $request->validate([
            'owner_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:landowners,email,' . $landowner->id,  // Ignore current landowner's email for unique check
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['owner_type'] == 'individual') {
            Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'sometimes|nullable',
            ])->validate();
            $validated['company_name'] = null; // Ensure company_name is null

        } else {
            Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'first_name' => 'sometimes|nullable',
                'surname' => 'sometimes|nullable',
                'other_names' => 'sometimes|nullable',
            ])->validate();
            $validated['first_name'] = null;
            $validated['other_names'] = null;
            $validated['surname'] = null; // Ensure individual fields are null

        }

        // Update the landowner
        $landowner->update($validated);

        return redirect()->route('landowner0.index')
            ->with('success', 'Landowner updated successfully.');
    }

    /**
     * Remove the specified landowner from storage.
     */
    public function destroy(LandOwner $landowner)
    {
        $landowner->delete();

        return redirect()->route('systemconfiguration0.landowners.index')
            ->with('success', 'Landowner deleted successfully.');
    }

    /**
     * Search for landowners based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $landowners = LandOwner::where('first_name', 'like', '%' . $query . '%')
            ->orWhere('other_names', 'like', '%' . $query . '%')
            ->orWhere('surname', 'like', '%' . $query . '%')
            ->orWhere('company_name', 'like', '%' . $query . '%')
            ->get();

        // Return JSON response instead of an Inertia page
        return response()->json(['landowners' => $landowners]);
    }
}