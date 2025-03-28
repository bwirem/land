<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteCoordinate;
use App\Models\SiteSector;

use App\Models\LandOwner;
use App\Models\Investor;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class WelComeController extends Controller
{
    /**
     * Display the welcome page.
     */
    public function welcome(Request $request): Response
    {
        // Fetch initial sites from the database
        $initialSites = Site::select('id', 'project_description')->get()->map(function ($site) {
            return [
                'id' => $site->id,
                'project_description' => $site->project_description,
                'street_name' => $site->street_name,
            ];
        });

        // Fetch initial areas from the database and group by site_id
        $coordinates = SiteCoordinate::with('site')->get();
        $initialAreas = $coordinates->groupBy('site_id')->map(function ($coords, $siteId) {
            return [
                'id' => $siteId,
                'name' => 'Site'.$siteId, // Customize this if needed
                'color' => '#33FF57',
                'coordinates' => $coords->map(fn($coord) => [$coord->latitude, $coord->longitude])->toArray(),
            ];
        })->values()->toArray();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'initialSectors' => SiteSector::select('id', 'name as description')->get(),
            'initialSites' => $initialSites,
            'initialAreas' => $initialAreas,
        ]);
    }

    /**
     * Display the site detail page.
     */
    public function showSiteDetail($id): Response
    {
        $site = Site::with(['sector', 'activity', 'allocationmethod', 'jurisdiction', 'opportunitytype', 'utility', 'branch'])->findOrFail($id);
        
        $coordinates = SiteCoordinate::where('site_id', $id)->get();

        $area = [
            'id' => $site->id,
            'name' => 'Site'.$site->id,
            'color' => '#33FF57',
            'coordinates' => $coordinates->map(fn($coord) => [$coord->latitude, $coord->longitude])->toArray(),
        ];

        return Inertia::render('SiteDetail', [
            'site' => $site,
            'area' => $area,
        ]);
    }


    /**
     * Display the dashboard.
     */
    public function dashboard(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'landowners' => \App\Models\LandOwner::count(),
                'sites' => \App\Models\Site::count(),
                'investors' => \App\Models\Investor::count(),
                'site_interests' => 0, // \App\Models\SiteInterest::count(),
                'withdrawals' => 0, // \App\Models\Withdrawal::sum('amount'),
                'pending_sites' => 0, // \App\Models\Site::where('status', 'pending')->count(),
            ],
        ]);
    }


    public function siteInterest(Request $request, $id)
    {
        // Validate input
        $validated = $request->validate([
            'investorName' => 'required|string|max:255',
            'investorEmail' => 'required|email|max:255|unique:investors,email', // Ensure unique email in the investors table
            'description' => 'nullable|string|max:1000', // Adjust max length as needed
            //'investorType' => 'required|string|max:50', // Assuming you want to capture investor type
            'investorPhone' => 'nullable|string|max:20', // If applicable
        ]);
    
        // Create the investor using the validated data
        $investorData = [
            'investor_type' => "company", // Assuming this corresponds to the investor_type field
            'company_name' => $validated['investorName'], // Mapping investorName to companyName
            'email' => $validated['investorEmail'],
            'phone' => $validated['investorPhone'], // Optional
        ];
    
        // Create the Investor
        $investor = Investor::create($investorData);
    
        // // Create the SiteInvestor using the validated description and the newly created investor
        // $siteInvestorData = [
        //     'site_id' => $id, // Assuming $id is the site ID
        //     'investor_id' => $investor->id, // Use the newly created investor's ID
        //     'description' => $validated['description'], // Store the description
        //     'collateral_doc' => null, // Add this if you have collateral documents
        //     'collateral_docname' => null, // Add this if you have collateral document names
        //     'user_id' => auth()->id(), // Assuming you're storing the authenticated user's ID
        // ];
    
        // SiteInvestor::create($siteInvestorData);
    
        return redirect()->route('welcome')
            ->with('success', 'Investor created and associated with the site successfully.');
    }
    


}


    