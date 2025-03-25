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

        // Search functionality (search customer's name, company name)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
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
        return inertia('SiteApplication/Create', [          
            'sectors' => SiteSector::all(),
            'activities' => SiteActivity::all(),
            'allocationMethods' => SiteAllocationMethod::all(),            
            'jurisdictions' => SiteJurisdiction::all(),
            'opportunityTypes' => SiteOpportunityType::all(),
            'utilities' => SiteUtility::all(),
            'facilityBranches' => FacilityBranch::all(),            
        ]);
    }

    /**
     * Store a newly created site in storage.
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
             'applicationForm' => 'nullable|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
             'facilitybranch_id' => 'required|integer',
         ]);
     
         // Adjust validation based on `owner_type`
         if ($validated['owner_type'] === 'individual') {
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
         Site::create($validated);
     
         return redirect()->route('landowner1.index')->with('success', 'Site application created successfully.');
     }     

    /**
     * Show the form for editing the specified site.
     */
    
     public function edit(Site $site)
     {    
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
             $site->load('siteInvestors.investor');
     
             $site->siteInvestors->transform(function ($siteInvestor) {
                 return [
                     'collateral_doc' => $siteInvestor->collateral_doc,
                     'collateralDocName' => $siteInvestor->collateral_docname,
                     'first_name' => optional($siteInvestor->investor)->first_name,
                     'surname' => optional($siteInvestor->investor)->surname,
                     'company_name' => optional($siteInvestor->investor)->company_name,
                     'investor_type' => optional($siteInvestor->investor)->investor_type,
                     'investor_id' => optional($siteInvestor->investor)->id,
                 ];
             });
     
             return inertia('SiteApplication/Documentation', [
                 'site' => $site,
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
             'owner_type' => 'required|in:individual,company',
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
     
         // Adjust validation based on `owner_type`
         if ($validated['owner_type'] === 'individual') {
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
         $site->update($validated);
     
         return redirect()->route('landowner1.index')->with('success', 'Site application updated successfully.');
     }

     

    /**
     * Update the specified site in storage.
     */    
     
     public function coordinating(Request $request, Site $site)
     {
         // Validate request fields
         $validator = Validator::make($request->all(), [
             'stage' => 'required|integer',
             'coordinates' => 'nullable|array|min:1',
             'coordinates.*.latitude' => 'required|numeric',
             'coordinates.*.longitude' => 'required|numeric',
             'coordinates.*.id' => [
                 'nullable',
                 Rule::exists('site_coordinates', 'id')->where('site_id', $site->id),
             ], // Ensuring coordinates belong to the site
         ]);
     
         if ($validator->fails()) {
             return response()->json(['errors' => $validator->errors()], 422);
         }
     
         DB::transaction(function () use ($request, $site) {
             // Update site details
             $site->update(['stage' => $request->input('stage')]);
     
             // Handle coordinates
             if ($request->has('coordinates')) {
                 foreach ($request->input('coordinates') as $coordinate) {
                     // Create or update the coordinate
                     SiteCoordinate::updateOrCreate(
                         [
                             'site_id' => $site->id,
                             'latitude' => $coordinate['latitude'],
                             'longitude' => $coordinate['longitude'],
                         ],
                         [
                             // Add any additional fields if necessary
                         ]
                     );
                 }
             }
     
             // Existing investor handling logic...
         });
     
         return response()->json(['message' => 'Site coordinates updated successfully.']);
     }
     

    /**
     * Update the specified site in storage.
     */    
     
     public function documentation(Request $request, Site $site)
     {
         // Validate request fields
         $validator = Validator::make($request->all(), [
             'stage' => 'required|integer',
             'investors' => 'nullable|array|min:1',
             'investors.*.id' => [
                 'nullable',
                 Rule::exists('site_investors', 'id')->where('site_id', $site->id),
             ], // Ensuring investor belongs to the site
             'investors.*.investor_id' => 'required_with:investors|exists:bls_investors,id',
             'investors.*.collateral_doc' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
         ]);
 
         if ($validator->fails()) {
             return response()->json(['errors' => $validator->errors()], 422);
         }
 
         DB::transaction(function () use ($request, $site) {
             // Update site details
             $site->update(['stage' => $request->input('stage')]);
 
             // Fetch existing and updating investors
             $existingInvestors = $site->siteInvestors()->pluck('investor_id')->toArray();
             $updatingInvestors = collect($request->input('investors'))->pluck('investor_id')->map(fn($id) => (int) $id)->toArray();
 
             // Identify investors to delete
             $investorsToDelete = array_values(array_diff($existingInvestors, $updatingInvestors));
             $investorData = [];
 
             // Process new/updated investors
             if ($request->has('investors')) {
                 foreach ($request->input('investors') as $index => $investor) {
                     $investorId = $investor['investor_id'];
                     $collateralDocPath = null;
                     $collateralDocName = null;
 
                     if ($request->hasFile("investors.{$index}.collateral_doc")) {
                         $file = $request->file("investors.{$index}.collateral_doc");
 
                         // Delete existing file if present
                         $existingInvestor = SiteInvestor::where('site_id', $site->id)
                             ->where('investor_id', $investorId)
                             ->first();
 
                         if ($existingInvestor && $existingInvestor->collateral_doc) {
                             $oldFilePath = storage_path('app/public/' . $existingInvestor->collateral_doc);
                             if (file_exists($oldFilePath)) {
                                 unlink($oldFilePath);
                             }
                         }
 
                         // Store new file
                         $filename = uniqid() . '.' . $file->getClientOriginalExtension();
                         $collateralDocPath = $file->storeAs('site_investor_collateral', $filename, 'public');
                         $collateralDocName = $file->getClientOriginalName();
                     }
 
                     // Set attributes for the relationship
                     $attributes = ['user_id' => Auth::id()];
                     if ($collateralDocPath) {
                         $attributes['collateral_doc'] = $collateralDocPath;
                         $attributes['collateral_docname'] = $collateralDocName;
                     }
 
                     $investorData[$investorId] = $attributes;
                 }
 
                 // Sync relationships
                 $site->blsInvestors()->syncWithoutDetaching($investorData);
             }
 
             // Delete unselected investors and their files
             if (!empty($investorsToDelete)) {
                 SiteInvestor::whereIn('investor_id', $investorsToDelete)
                     ->where('site_id', $site->id)
                     ->get()
                     ->each(function ($investor) {
                         if ($investor->collateral_doc) {
                             $filePath = storage_path('app/public/' . $investor->collateral_doc);
                             if (file_exists($filePath)) {
                                 unlink($filePath);
                             }
                         }
                         $investor->delete();
                     });
             }
         });
 
         return response()->json(['message' => 'Site application updated successfully.']);
     } 

   
    public function submit(Request $request, Site $site)
    {

        //Log::info('Start processing purchase update:', ['purchase' => $site, 'request_data' => $request->all()]);

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

            return response()->json(['message' => 'Site approved successfully.'], 200);

        } catch (\Exception $e) {
            Log::error('Error approving site: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to approve site. Please try again.'], 500);
        }
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