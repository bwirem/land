<?php

namespace App\Http\Controllers;

use App\Models\Investor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvestorController extends Controller
{
    /**
     * Display a listing of Investors.
     */
    public function index(Request $request)
    {
        $query = Investor::query();

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
        $investors = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('Investors/Index', [
            'investors' => $investors,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new investor.
     */
    public function create()
    {
        return inertia('Investors/Create');
    }

    /**
     * Store a newly created investor in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'investor_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:investors',
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['investor_type'] == 'individual') {
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

        // Create the investor
        Investor::create($validated);

        return redirect()->route('investor0.index')
            ->with('success', 'Investor created successfully.');
    }

    public function directstore(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'investor_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:investors',
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['investor_type'] == 'individual') {
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

        // Create the investor
        $investor = Investor::create($validated);

        // Return the created investor as JSON
        return response()->json([
            'id' => $investor->id,
            'investor_type' => $investor->investor_type,
            'first_name' => $investor->first_name,
            'other_names' => $investor->other_names,
            'surname' => $investor->surname,
            'company_name' => $investor->company_name,
            'email' => $investor->email,
            'phone' => $investor->phone,

        ]);
    }

    /**
     * Show the form for editing the specified investor.
     */
    public function edit(Investor $investor)
    {
        return inertia('Investors/Edit', [
            'investor' => $investor,
        ]);
    }

    /**
     * Update the specified investor in storage.
     */
    public function update(Request $request, Investor $investor)
    {
        // Validate input
        $validated = $request->validate([
            'investor_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:investors,email,' . $investor->id,  // Ignore current investor's email for unique check
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['investor_type'] == 'individual') {
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

        // Update the investor
        $investor->update($validated);

        return redirect()->route('investor0.index')
            ->with('success', 'Investor updated successfully.');
    }

    /**
     * Remove the specified investor from storage.
     */
    public function destroy(Investor $investor)
    {
        $investor->delete();

        return redirect()->route('systemconfiguration0.investors.index')
            ->with('success', 'Investor deleted successfully.');
    }

    /**
     * Search for investors based on query.
     */
    // public function search(Request $request)
    // {
    //     $query = $request->input('query');
    //     $investors = Investor::where('first_name', 'like', '%' . $query . '%')
    //         ->orWhere('other_names', 'like', '%' . $query . '%')
    //         ->orWhere('surname', 'like', '%' . $query . '%')
    //         ->orWhere('company_name', 'like', '%' . $query . '%')
    //         ->get();

    //     // Return JSON response instead of an Inertia page
    //     return response()->json(['investors' => $investors]);
    // }

    //InvestorController
    public function search(Request $request)
    {
        $query = $request->input('query');

        $investors = Investor::where('investor_type', 'individual')
            ->where(function ($individualQuery) use ($query) {
                $individualQuery->where('first_name', 'like', "%{$query}%")
                    ->orWhere('surname', 'like', "%{$query}%");
            })
            ->orWhere(function ($companyQuery) use ($query) {
                $companyQuery->where('investor_type', 'company')
                    ->where('company_name', 'like', "%{$query}%");
            })
            ->get();
        
        return response()->json(['investors' => $investors]);
        //return response()->json($investors);
    }
}