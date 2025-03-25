<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteInvestor;
use App\Models\Sector;
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


class SiteApprovalController extends Controller
{
    /**
     * Display a listing of sites.
     */
    public function index(Request $request)
    {
        $query = Site::with(['customer', 'sitePackage', 'user']);

        // Search functionality (search customer's name, company name)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('other_names', 'like', '%' . $request->search . '%')
                    ->orWhere('surname', 'like', '%' . $request->search . '%')
                    ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        
        $query->where('stage', '>=', '3'); // This line might be redundant, depending on your requirements

        // Filtering by stage
        if ($request->filled('stage')) {
            $stages = explode(',', $request->stage);  // Split the string into an array

            if (count($stages) > 1) { // Check if we need to use whereIn (multiple stages)
                $query->whereIn('stage', $stages);
            } else {
                $query->where('stage', $stages[0]); // Single stage
            }

        }

        if ($request->filled('facilitybranch_id')) {
            $query->where('facilitybranch_id', $request->facilitybranch_id);
        }

        // Only show stages less than or equal to 3
        $sites = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SiteApproval/Index', [
            'sites' => $sites,
            'facilityBranches' => FacilityBranch::all(),
            'filters' => $request->only(['search', 'stage']),
        ]);
    }
   
    /**
     * Show the form for editing the specified site.
     */
    public function edit(Site $site)
    {
        $site->load('siteInvestors.investor'); // Eager load the relationship and the investor details

        $site->siteInvestors->transform(function ($siteInvestor) {
            return [    
                //'id' => $siteInvestor->id,         
                'collateral_doc' => $siteInvestor->collateral_doc, // Or format as needed    
                'collateralDocName' => $siteInvestor->collateral_docname,         
                'first_name' => $siteInvestor->investor->first_name,               
                'surname' => $siteInvestor->investor->surname,
                'company_name' => $siteInvestor->investor->company_name,
                'investor_type' => $siteInvestor->investor->investor_type,
                'investor_id' => $siteInvestor->investor->id,  

            ];
        });

        switch ($site->stage) {
            case 3:
                return inertia('SiteApproval/Edit', [
                    'site' => $site,
                    'siteTypes' => Sector::all(),
                ]);
            case 4:
                return inertia('SiteApproval/ManagerReview', [
                    'site' => $site,
                    'siteTypes' => Sector::all(),
                ]);
            default:
                abort(404, 'Invalid stage');
        }
        
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
                'approved_by' => auth()->user()->id,
                'stage' => $currentStage->value,  // Use ->value here
                'status' => ApprovalStatus::Pending->value // Assuming ApprovalStatus is also an enum
            ])->firstOrFail();
    
    
    
            // Update the current approval record
            $approval->update(['status' => ApprovalStatus::Approved->value, 'remarks' => $request->input('remarks')]);
    
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
    }
      
   
}