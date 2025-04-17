<?php

namespace App\Http\Controllers;


use App\Models\Site;
use App\Models\SiteInvestor;

use App\Models\SiteSector;
use App\Models\SiteActivity;
use App\Models\SiteAllocationMethod;
use App\Models\SiteJurisdiction;
use App\Models\SiteOpportunityType;
use App\Models\SiteUtility;
use App\Models\SiteCoordinate;
use App\Models\FacilityBranch;
use App\Models\LandOwner;

use App\Enums\SiteStage; // Or your constants class
use App\Enums\ApprovalStatus;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;


class SiteApplicationController extends Controller
{
    /**
     * Display a listing of sites.
     */
    public function index(Request $request)
    {
        $query = Site::with(['landowner', 'sector', 'user']);

        /// Search functionality (search customer's name, company name)
        if ($request->filled('search')) {
            $query->whereHas('landowner', function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('other_names', 'like', '%' . $request->search . '%')
                ->orWhere('surname', 'like', '%' . $request->search . '%')
                ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        $query->where('stage', '<=', '3');
        // Filtering by stage
        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        
        $user = auth()->user();
        $userGroup = $user->userGroup; 
        
        if($userGroup->name == 'Landowner') {
            $query->where('user_id', $user->id);
        } 
        
        // Only show stages less than or equal to 3
        $sites = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SiteApplication/Index', [
            'sites' => $sites,            
            'filters' => $request->only(['search', 'stage']),
            //'auth' => Auth::user(),
        ]);
    }

    /**
     * Show the form for creating a new site.
     */
    public function create()
    {
        $user = auth()->user();
        $userGroup = $user->userGroup;
        
        $landOwner = null; // Initialize $landOwner to null
        
        if($userGroup->name == 'Landowner') {
            $landOwner = LandOwner::where('user_id', $user->id)->first();
        } 

        return inertia('SiteApplication/Create', [          
            'sectors' => SiteSector::all(),
            'activities' => SiteActivity::all(),
            'allocationMethods' => SiteAllocationMethod::all(),            
            'jurisdictions' => SiteJurisdiction::all(),
            'opportunityTypes' => SiteOpportunityType::all(),
            'utilities' => SiteUtility::all(),
            'facilityBranches' => FacilityBranch::all(), 
            'landowner' => $landOwner,           
        ]);
    }

    /**
     * Store a newly created site in storage.
     */
            
     public function store(Request $request)
     {
         // Validate input
         $validated = $request->validate([
             'landowner_type' => 'required|in:individual,company',
             'first_name' => 'nullable|string|max:255',
             'other_names' => 'nullable|string|max:255',
             'surname' => 'nullable|string|max:255',
             'company_name' => 'nullable|string|max:255',
             'email' => 'required|email|max:255',
             'phone' => 'nullable|string|max:13',
             'landowner_id' => 'nullable|exists:landowners,id',
     
             'sector_id' => 'required|exists:site_sectors,id',
             'activity_id' => 'required|exists:site_activities,id',
             'allocationmethod_id' => 'required|exists:site_allocationmethods,id',
             'jurisdiction_id' => 'required|exists:site_jurisdictions,id',
             'opportunitytype_id' => 'required|exists:site_opportunitytypes,id',
             'utility_id' => 'required|exists:site_utilities,id',
     
             'project_description' => 'nullable|string',
             'stage' => 'required|integer',

             'landarea' => 'required|numeric',
             'priceofland' => 'required|numeric',

             'applicationForm' => 'nullable|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
             'facilitybranch_id' => 'required|integer',
         ]);
     
         // Adjust validation based on `landowner_type`
         if ($validated['landowner_type'] === 'individual') {
             $validated = array_merge($validated, Validator::validate($validated, [
                 'first_name' => 'required|string|max:255',
                 'surname' => 'required|string|max:255',
                 'company_name' => 'nullable',
             ]));
         } else {
             $validated = array_merge($validated, Validator::validate($validated, [
                 'company_name' => 'required|string|max:255',
                 'first_name' => 'nullable',
                 'surname' => 'nullable',
                 'other_names' => 'nullable',
             ]));
     
             // Set individual fields to `null`
             $validated['first_name'] = $validated['surname'] = $validated['other_names'] = null;
         }
     
         // Handle file upload
         if ($request->hasFile('applicationForm')) {
             $validated['application_form'] = $request->file('applicationForm')->store('application_forms', 'public');
         }
     
         // Add user_id before saving
         $validated['user_id'] = Auth::id();
     
         // Create the site
         $site = Site::create($validated);         
     
         return redirect()->route('landowner1.edit', ['site' =>$site->id])->with('success', 'Site application created successfully.');
     }     

    /**
     * Show the form for editing the specified site.
     */
    
     public function edit(Site $site)
     {  
         $site->load('landowner');

         // Common data to be passed to the view
         $commonData = [
             'sectors' => SiteSector::all(),
             'activities' => SiteActivity::all(),
             'allocationMethods' => SiteAllocationMethod::all(),
             'jurisdictions' => SiteJurisdiction::all(),
             'opportunityTypes' => SiteOpportunityType::all(),
             'utilities' => SiteUtility::all(),
             'facilityBranches' => FacilityBranch::all(),
         ];
     
         if ($site->stage == 1) {
             return inertia('SiteApplication/Edit', [
                 'site' => $site,
                 ...$commonData,
             ]);
         } elseif ($site->stage == 2) {
            $site->load('siteCoordinates');   
             return inertia('SiteApplication/Coordinating', [
                 'site' => $site,
                 'site_coordinates' => $site->siteCoordinates,
                 ...$commonData,
             ]);

         } else { 

            $site->load('siteCoordinates');   
             return inertia('SiteApplication/Submission', [
                 'site' => $site,
                 'site_coordinates' => $site->siteCoordinates,
                 ...$commonData,
             ]);

         }
     }
     

    /**
     * Update the specified site in storage.
     */  
   
     public function update(Request $request, Site $site)
     {
         $rules = [
             'landowner_type' => 'required|in:individual,company',
             'first_name' => 'nullable|string|max:255',
             'other_names' => 'nullable|string|max:255',
             'surname' => 'nullable|string|max:255',
             'company_name' => 'nullable|string|max:255',
             'email' => 'required|email|max:255',
             'phone' => 'nullable|string|max:13',
             'landowner_id' => 'nullable|exists:landowners,id',
             'sector_id' => 'required|exists:site_sectors,id',
             'activity_id' => 'nullable|exists:site_activities,id',
             'allocationmethod_id' => 'nullable|exists:site_allocationmethods,id',
             'jurisdiction_id' => 'nullable|exists:site_jurisdictions,id',
             'opportunitytype_id' => 'nullable|exists:site_opportunitytypes,id',
             'utility_id' => 'nullable|exists:site_utilities,id',
             'project_description' => 'nullable|string',
             'stage' => 'required|integer',
             'landarea' => 'required|numeric',
             'priceofland' => 'required|numeric',
             'facilitybranch_id' => 'required|integer',             
         ];
     
         // Conditionally add the 'applicationForm' rule
         if (!$site->application_form && !$request->hasFile('applicationForm')) {
             // If no existing file AND no new file is uploaded, then it's required
             $rules['applicationForm'] = 'required|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048';
         } elseif ($request->hasFile('applicationForm')) {
             // If a new file is uploaded, validate it
             $rules['applicationForm'] = 'mimes:pdf,doc,docx,jpg,jpeg,png|max:2048';
         }
     
         // Validate input
         $validated = $request->validate($rules);
     
         // Adjust validation based on `landowner_type`
         if ($validated['landowner_type'] === 'individual') {
             $validated = array_merge($validated, Validator::validate($validated, [
                 'first_name' => 'required|string|max:255',
                 'surname' => 'required|string|max:255',
                 'company_name' => 'nullable',
             ]));
         } else {
             $validated = array_merge($validated, Validator::validate($validated, [
                 'company_name' => 'required|string|max:255',
                 'first_name' => 'nullable',
                 'surname' => 'nullable',
                 'other_names' => 'nullable',
             ]));
     
             // Set individual fields to `null`
             $validated['first_name'] =  null;
             $validated['surname'] =  null;
             $validated['other_names'] = null;
         }
     
         // Handle file upload
         if ($request->hasFile('applicationForm')) {
             // Delete old file if it exists
             if ($site->application_form) {
                 Storage::disk('public')->delete($site->application_form);
             }
             $validated['application_form'] = $request->file('applicationForm')->store('application_forms', 'public');
         }
     
         // Add user_id before saving
         $validated['user_id'] = Auth::id();
     
         // Update the site
         
         $site->update(array_merge(
            $validated,
            ['stage' => min($site->stage + 1, 2)]
        ));
        
     
         return redirect()->route('landowner1.edit', ['site' =>$site->id])->with('success', 'Site application created successfully.');
     }

     

    /**
     * Update the specified site in storage.
     */    
     
     public function coordinating(Request $request, Site $site)
     {
         $validator = Validator::make($request->all(), [
             'stage' => 'required|integer',
             'coordinates' => 'nullable|array|min:1',
             'coordinates.*.latitude' => 'required|numeric',
             'coordinates.*.longitude' => 'required|numeric',
             'coordinates.*.id' => [
                 'nullable',
                 Rule::exists('site_coordinates', 'id')->where('site_id', $site->id),
             ],
         ]);
     
         if ($validator->fails()) {
             return response()->json(['errors' => $validator->errors()], 422);
         }
     
         DB::transaction(function () use ($request, $site) {
             // Update site details
             $site->update(['stage' => $request->input('stage')]);
     
             // Fetch existing coordinates for the site
             $existingCoordinates = $site->siteCoordinates()->pluck('id')->toArray(); // ✅ Fix applied
     
             $newCoordinates = [];
     
             if ($request->has('coordinates')) {
                 foreach ($request->input('coordinates') as $coordinate) {
                     $siteCoordinate = SiteCoordinate::updateOrCreate(
                         [
                             'id' => $coordinate['id'] ?? null, // Match by ID if provided
                             'site_id' => $site->id,
                         ],
                         [
                             'latitude' => $coordinate['latitude'],
                             'longitude' => $coordinate['longitude'],
                         ]
                     );
     
                     // Collect updated or newly added coordinate IDs
                     $newCoordinates[] = $siteCoordinate->id;
                 }
             }
     
             // Delete removed coordinates (coordinates that existed but are not in the new request)
             $coordinatesToDelete = array_diff($existingCoordinates, $newCoordinates);
             SiteCoordinate::whereIn('id', $coordinatesToDelete)->delete();
         });


         $site->update(array_merge(           
            ['stage' => min($site->stage + 1, 3)]
        ));
        
     
         return redirect()->route('landowner1.edit', ['site' =>$site->id])->with('success', 'Site coordinates updated successfully.');
     }
     


    /**
     * Update the specified site in storage.
     */    
     
    
   
    public function submit(Request $request, Site $site)
    {

        //Log::info('Start processing purchase update:', ['site' => $site, 'request_data' => $request->all()]);

        // Validate request fields.
        $validator = Validator::make($request->all(), [
            'remarks' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::transaction(function () use ($request, $site) {
                // Update site stage to Site Officer Review using Enum
                $site->update([
                    'stage' => SiteStage::SiteOfficerReview->value,// Enum value for Site Officer Review
                    'submit_remarks' => $request->input('remarks')
                ]);

                // Create approval record for the site
                $site->approvals()->create([
                    'stage' => SiteStage::SiteOfficerReview->value,
                    'status' => ApprovalStatus::Pending->value,
                    'approved_by' => Auth::id(),
                ]);
            });

            return redirect()->route('landowner1.index')->with('success', 'Site coordinates updated successfully.');

        } catch (\Exception $e) {
            Log::error('Error approving site: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to approve site. Please try again.'], 500);
        }


        
    }


    public function back(Site $site)
    { 
        // Check if the current stage is greater than 0
        if ($site->stage > 1) {
            // Decrease the landowner stage by 1
            $site->update(['stage' => $site->stage - 1]);
        } else {
            // Optionally, you can log or handle the case where the stage is already 0
            // Log::warning('Attempted to decrease landowner stage below zero for landowner ID: ' . $site->id);
        }
    
        // Redirect to the 'edit' route for the current landowner
        return redirect()->route('landowner1.edit', ['site' => $site->id]);
    }   


   

    public function customerSites($customerId)
    {
        $site = Site::with('payments') // Eager load payments
                ->where('customer_id', $customerId)
                ->where('stage', 7)
                ->first();

        if ($site) {
            return response()->json([
                'site' => $site,
                'disburse_date' => $site->created_at,//$site->disburse_date, // Assuming you have a disburse_date column on your Site model            
            ]);
        } else {
            return response()->json(['site' => null]);
        }
    }




    
}