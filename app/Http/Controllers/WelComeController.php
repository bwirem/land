<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteCoordinate;
use App\Models\SiteSector;

use App\Models\LandOwner;
use App\Models\Investor;
use App\Models\SiteInvestor;

use App\Enums\CustomerType;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
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
        $initialSites = Site::select('id', 'project_description')
        ->where('stage','=',7)
        ->get()->map(function ($site) {
            return [
                'id' => $site->id,
                'project_description' => $site->project_description,
                'street_name' => $site->street_name,
            ];
        });

        // Fetch initial areas from the database and group by site_id
        $coordinates = SiteCoordinate::with('site')
        ->whereHas('site', function ($query) {
            $query->where('stage', 7);
        })
        ->get();

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
        $user = auth()->user();
        $userGroup = $user->userGroup;  // Not userGroup()

        
        if($userGroup->name == 'Landowner') {

            $landOwner = LandOwner::where('user_id', $user->id)->first();
            if (!$landOwner) {
               // Get landowner types from the enum
                $customerTypes = CustomerType::cases();
                $customerTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $customerTypes);

                return inertia('LandOwners/Create', [
                    'customerTypes' => $customerTypes,
                    'email' => $user->email,                   
                ]);
            }

            $site = Site::where('user_id', $user->id)->count();         
            return Inertia::render('DashboardLand', [
                'stats' => [                  
                    'sites' => $site,                    
                ],
            ]);

        }else if($userGroup->name == 'Investor') {

            $investor = Investor::where('user_id', $user->id)->first();            
            if (!$investor) {
                return inertia('Investors/Create', [
                    'email' => $user->email,                   
                ]);
            }

            $siteInvestor = SiteInvestor::where('user_id', $user->id)->count();

            return Inertia::render('DashboardInvestor', [
                'stats' => [ 
                    'site_interests' => $siteInvestor,                   
                ],
            ]);


        }else if($userGroup->name == 'Admin') {

            return Inertia::render('Dashboard', [
                'stats' => [
                    'landowners' => LandOwner::count(),
                    'sites' => Site::count(),
                    'investors' => Investor::count(),
                    'site_interests' => SiteInvestor::count(),
                    'withdrawals' => 0, // \App\Models\Withdrawal::sum('amount'),
                    'pending_sites' => 0, // \App\Models\Site::where('status', 'pending')->count(),
                ],
            ]);

        }
    }



    public function siteInterest(Request $request, $id)
    {
        $success = false;
        $message = 'An error occurred while submitting your interest.';

        try {
            DB::transaction(function () use ($request, $id, &$success, &$message) {
                $validated = $request->validate([
                    'investorName' => 'required|string|max:255',
                    'investorEmail' => 'required|email|max:255',
                    'description' => 'nullable|string|max:1000',
                    'investorPhone' => 'nullable|string|max:20',
                ]);

                $investor = Investor::firstOrCreate(
                    ['email' => $validated['investorEmail']],
                    [
                        'investor_type' => "company",
                        'company_name' => $validated['investorName'],
                        'phone' => $validated['investorPhone'],
                    ]
                );

                $existingInterest = SiteInvestor::where('site_id', $id)
                    ->where('investor_id', $investor->id)
                    ->first();

                if ($existingInterest) {
                    $message = 'You have already expressed interest in this site.';
                    return; // Early exit
                }

                SiteInvestor::create([
                    'user_id' => auth()->id() ?? 1,
                    'site_id' => $id,
                    'investor_id' => $investor->id,
                    'description' => $validated['description'],
                ]);

                $success = true;
                $message = 'Your interest has been submitted successfully!';
            });
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Error submitting site interest: ' . $e->getMessage());
        }

        return Redirect::back()->with($success ? 'success' : 'error', $message);
    }


    


}


    