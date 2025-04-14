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


class SiteHistoryController extends Controller
{
    /**
     * Display a listing of sites.
     */
    public function index(Request $request)
    {
        $query = Site::with(['landowner', 'sector', 'user']);

        // Search functionality (search customer's name, company name)
        if ($request->filled('search')) {
            $query->whereHas('landowner', function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('other_names', 'like', '%' . $request->search . '%')
                ->orWhere('surname', 'like', '%' . $request->search . '%')
                ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        $query->whereBetween('stage', [7, 8]);       

        // Filtering by stage
        if ($request->filled('stage')) {
            $stages = explode(',', $request->stage);  // Split the string into an array

            if (count($stages) > 1) { // Check if we need to use whereIn (multiple stages)
                $query->whereIn('stage', $stages);
            } else {
                $query->where('stage', $stages[0]); // Single stage
            }

        }

        // Only show stages less than or equal to 3
        $sites = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SiteHistory/Index', [
            'sites' => $sites,           
            'filters' => $request->only(['search', 'stage']),
        ]);
    }
   
    /**
     * Show the form for editing the specified site.
     */
    public function edit(Site $site)
    {  
        $site->load('landowner');
        $site->load('approvals.approver.userGroup'); 

     
        Log::info($site->approvals->toArray());
       
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
    
       

        $site->load('siteCoordinates');   
        return inertia('SiteHistory/Review', [
            'site' => $site,
            'site_coordinates' => $site->siteCoordinates,
            ...$commonData,
        ]);

        
    }
    

    /**
     * Show the form for approve the specified site.
     */
         
    public function approve(Request $request, Site $site)
    {
        // ... validation ...
    
        DB::transaction(function () use ($request, $site) {
            $currentStage = SiteStage::from($site->stage);
    
            if (!$currentStage) {
                // Handle invalid stage (e.g., throw an exception or return an error response)
                abort(400, 'Invalid site stage.'); 
            }
    
    
            $nextStage = match ($currentStage) {
                SiteStage::SiteOfficerReview => SiteStage::ManagerReview,
                SiteStage::ManagerReview => SiteStage::CommitteeReview,
                SiteStage::CommitteeReview => SiteStage::Approved,
                default => null, // No next stage (already approved or rejected, or in an unapprovable state)
            };
    
            $approval = $site->approvals()->where([
                //'approved_by' => auth()->user()->id,
                'stage' => $currentStage->value,  // Use ->value here
                'status' => ApprovalStatus::Pending->value // Assuming ApprovalStatus is also an enum
            ])->firstOrFail();
    
    
    
            // Update the current approval record
            $approval->update([
                'approved_by' => auth()->user()->id,
                'status' => ApprovalStatus::Approved->value, 
                'remarks' => $request->input('remarks'
            )]);
                
    
            if ($nextStage) {
                // Update site stage
                $site->update(['stage' => $nextStage->value]);
    
                // Create a new approval record for the next stage
                $site->approvals()->create([
                    'stage' => $nextStage->value,
                    'status' => ApprovalStatus::Pending->value,
                    'approved_by' => auth()->user()->id,
                    // ... other fields ... (e.g., assigned approver)
                ]);
    
                // ... send notification to the next approver ...
            } 
    
        });
    
        // ...
        return redirect()->route('management0.index')->with('success', 'Site approved successfully.');
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
        return redirect()->route('management0.index')->with('success', 'Site approved successfully.');
    }    
   
}