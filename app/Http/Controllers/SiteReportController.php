<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteSector;
use App\Models\SiteActivity;
use App\Models\SiteAllocationMethod;
use App\Models\SiteJurisdiction;
use App\Models\SiteOpportunityType;
use App\Models\SiteUtility;
use App\Models\SiteCoordinate;
use App\Models\FacilityBranch;

use Inertia\Inertia;
use Illuminate\Http\Request;


class SiteReportController extends Controller
{
    public function landPortfolioReport(Request $request)
    {
        $query = Site::query()->with([
            'landowner',
            'sector',
            'activity',
            'allocationmethod',
            'jurisdiction',
            'opportunitytype',
            'utility',
            'branch',
            'user'
        ]);

        if ($request->search) {
            $query->whereHas('landowner', function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('surname', 'like', '%' . $request->search . '%')
                ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        $sites = $query->get();

        return Inertia::render('Reports/LandPortfolioReport', [
            'sites' => $sites,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for editing the specified site.
     */
    public function view(Site $site)
    {  
        $site->load('landowner');
        $site->load('approvals.approver.userGroup');      
      
       
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
        return inertia('Reports/Details', [
            'site' => $site,
            'site_coordinates' => $site->siteCoordinates,
            ...$commonData,
        ]);

        
    }
    

}
