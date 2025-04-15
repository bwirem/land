<?php

namespace App\Http\Controllers;

use App\Models\LandOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Enums\CustomerType;
use App\Enums\DocumentType;



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

        $user = auth()->user();
        $userGroup = $user->userGroup; 
        
        if($userGroup->name == 'Landowner') {
            $query->where('user_id', $user->id);
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
        // Get landowner types from the enum
        $customerTypes = CustomerType::cases();
        $customerTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $customerTypes);

        return inertia('LandOwners/Create', [
            'customerTypes' => $customerTypes,
        ]);
    }

    /**
     * Store a newly created landowner in storage.
     */
    public function store(Request $request)
    {
        // Validate input using enum values
        $validated = $request->validate([
            'landowner_type' => ['required', 'in:' . implode(',', CustomerType::values())],
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:landowners',
            'phone' => 'nullable|string|max:13',
            'address' => 'nullable|string|max:255',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['landowner_type'] == CustomerType::INDIVIDUAL->value) {
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

         // Add user_id before saving
         $validated['user_id'] = Auth::id();

        // Create the landowner
        $landowner = LandOwner::create($validated);  

        return redirect()->route('landowner0.edit', ['landowner' => $landowner->id])          
            ->with('success', 'landowner created successfully.');
    }

    public function directstore(Request $request)
    {
        // Validate input using enum values
        $validated = $request->validate([
            'landowner_type' => ['required', 'in:' . implode(',', CustomerType::values())],
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:landowners',
            'phone' => 'nullable|string|max:13',            
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['landowner_type'] == CustomerType::INDIVIDUAL->value) {
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

         // Add user_id before saving
         $validated['user_id'] = Auth::id();

        // Create the landowner
        $landowner = LandOwner::create($validated);

        // Return the created landowner as JSON
        return response()->json([
            'id' => $landowner->id,
            'landowner_type' => $landowner->landowner_type,
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
        $customerTypes = CustomerType::cases();
        $customerTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $customerTypes);

        $documentTypes= DocumentType::cases();
        $documentTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $documentTypes);

        if($landowner->stage == 1)
        {        
            return inertia('LandOwners/Edit', [
                'landowner' => $landowner,
                'customerTypes' => $customerTypes,
                'documentTypes' => $documentTypes,
            ]);
        }
        else{

            return inertia('LandOwners/Approve', [
                'landowner' => $landowner,
                'customerTypes' => $customerTypes,
                'documentTypes' => $documentTypes,
            ]);
        }
        

    }

    /**
     * Update the specified landowner in storage.
     */
    public function update(Request $request, LandOwner $landowner)
    {
        $baseRules = [
            'landowner_type' => ['required', 'in:' . implode(',', CustomerType::values())],
            'email' => 'required|email|max:255|unique:landowners,email,' . $landowner->id,
            'phone' => 'nullable|string|max:13',
            'address' => 'nullable|string|max:255',
            'document_type' => 'required|in:' . implode(',', DocumentType::values()),
            'document_number' => 'required|string|max:255',
            'documentFile' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
            'selfieFile' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
        ];

        // Conditional validation based on landowner type
        if ($request->landowner_type === CustomerType::INDIVIDUAL->value) {
            $baseRules = array_merge($baseRules, [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'other_names' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
            ]);
        } else {
            $baseRules = array_merge($baseRules, [
                'company_name' => 'required|string|max:255',
                'first_name' => 'nullable|string|max:255',
                'surname' => 'nullable|string|max:255',
                'other_names' => 'nullable|string|max:255',
            ]);
        }

        $validated = $request->validate($baseRules);

        // Force null on irrelevant fields
        if ($validated['landowner_type'] === CustomerType::INDIVIDUAL->value) {
            $validated['company_name'] = null;
        } else {
            $validated['first_name'] = null;
            $validated['surname'] = null;
            $validated['other_names'] = null;
        }

        // Add user_id before saving
        $validated['user_id'] = Auth::id();

        // Initialize mappedData for file handling
        $mappedData = [];

        $this->handleFileUpload($request, $landowner, $mappedData);

       // Merge mapped file data (if any) into validated input
        $landowner->update(array_merge($validated, $mappedData, [
            'stage' => min($landowner->stage + 1, 2)
        ]));
 

        return redirect()->route('landowner0.edit', ['landowner' => $landowner->id])  
            ->with('success', 'landowner updated successfully.');
    }

     /**
     * Handle file upload safely.
     */
    private function handleFileUpload(Request $request, LandOwner $landowner, array &$mappedData)
    {
        if ($request->hasFile('documentFile')) {
            $newPath = $request->file('documentFile')->store('landowner_document_files', 'public');

            if ($newPath) {
                if ($landowner->document_path) {
                    Storage::disk('public')->delete($landowner->document_path);
                }
                $mappedData['document_path'] = $newPath;
            } else {
                Log::error('Document upload failed.');
            }
        }

        if ($request->hasFile('selfieFile')) {
            $newPath = $request->file('selfieFile')->store('landowner_document_files', 'public');

            if ($newPath) {
                if ($landowner->selfie_path) {
                    Storage::disk('public')->delete($landowner->selfie_path);
                }
                $mappedData['selfie_path'] = $newPath;
            } else {
                Log::error('Selfie upload failed.');
            }
        }
    }


    /**
     * Show the form for approve the specified loan.
     */
         
     public function approve(Request $request, LandOwner $landowner)
     {
         // Validation
         // ... your validation logic ...
     
         
        // Update the stage, but limit it to 3 (stage can't exceed 3)
        $landowner->update([
            'stage' => min($landowner->stage + 1, 3), // Prevent stage from exceeding 3
            'remarks' => $request->input('remarks') // Always update remarks
        ]);
       
     
         return redirect()->route('landowner0.index')->with('success', 'Loan review approved successfully!');
     }
     

    public function back(LandOwner $landowner)
    { 
        // Check if the current stage is greater than 0
        if ($landowner->stage > 1) {
            // Decrease the landowner stage by 1
            $landowner->update(['stage' => $landowner->stage - 1]);
        } else {
            // Optionally, you can log or handle the case where the stage is already 0
            // Log::warning('Attempted to decrease landowner stage below zero for landowner ID: ' . $landowner->id);
        }
    
        // Redirect to the 'edit' route for the current landowner
        return redirect()->route('landowner0.edit', ['landowner' => $landowner->id]);
    }   

    /**
     * Remove the specified landowner from storage.
     */
    public function destroy(LandOwner $landowner)
    {
        $landowner->delete();

        return redirect()->route('landowner0.index')
            ->with('success', 'landowner deleted successfully.');
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
