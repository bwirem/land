<?php

use App\Http\Controllers\WelComeController;
use App\Http\Controllers\ProfileController;

use App\Http\Controllers\SiteApplicationController;
use App\Http\Controllers\SiteApprovalController;
use App\Http\Controllers\SiteInterestController;
use App\Http\Controllers\SiteInterestAwardController;
use App\Http\Controllers\SiteHistoryController;


use App\Http\Controllers\SiteActivityController;
use App\Http\Controllers\SiteUtilityController;
use App\Http\Controllers\SiteSectorController;
use App\Http\Controllers\SiteAllocationMethodController;
use App\Http\Controllers\SiteJurisdictionController;
use App\Http\Controllers\SiteOpportunityTypeController;


use App\Http\Controllers\LandOwnerController;
use App\Http\Controllers\InvestorController;
use App\Http\Controllers\SiteReportController;


use App\Http\Controllers\LOCCountryController;
use App\Http\Controllers\LOCRegionController;
use App\Http\Controllers\LOCDistrictController;
use App\Http\Controllers\LOCWardController;
use App\Http\Controllers\LOCStreetController;

use App\Http\Controllers\FacilityOptionController;
use App\Http\Controllers\FacilityBranchController;


use App\Http\Controllers\UserGroupController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\UserController;


use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\Site;
use App\Models\SiteSector;
use App\Models\SiteCoordinate;

// Home Page
Route::get('/', [WelComeController::class, 'welcome'])->name('welcome');

Route::middleware('guest')->group(function () {  
    // Site Detail Page
    Route::get('/homesite/{id}', [WelComeController::class, 'showSiteDetail'])->name('site.detail');

    // Site Detail Page
    Route::put('/interest/{id}', [WelComeController::class, 'siteInterest'])->name('interest');

});

// Dashboard
Route::get('/dashboard', [WelComeController::class, 'dashboard'])
->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
     
     // --- landowners Routes ---
     Route::prefix('landowner0')->name('landowner0.')->group(function () {
        Route::get('/', [LandOwnerController::class, 'index'])->name('index'); 
        Route::get('/create', [LandOwnerController::class, 'create'])->name('create'); 
        Route::post('/', [LandOwnerController::class, 'store'])->name('store'); 
        Route::post('/directstore', [LandOwnerController::class, 'directstore'])->name('directstore');
        Route::get('/{landowner}/edit', [LandOwnerController::class, 'edit'])->name('edit'); 
        Route::post('/{landowner}', [LandOwnerController::class, 'update'])->name('update');
        Route::post('approve/{landowner}', [LandOwnerController::class, 'approve'])->name('approve'); 
        Route::get('/{landowner}/back', [LandOwnerController::class, 'back'])->name('back');
        Route::get('/search', [LandOwnerController::class, 'search'])->name('search'); 

        
    });   

    // Order routes
    Route::prefix('landowner1')->name('landowner1.')->group(function () {
        Route::get('/', [SiteApplicationController::class, 'index'])->name('index');
        Route::get('/create', [SiteApplicationController::class, 'create'])->name('create');
        Route::post('/', [SiteApplicationController::class, 'store'])->name('store');
        Route::get('/{site}/edit', [SiteApplicationController::class, 'edit'])->name('edit');
        Route::post('/{site}', [SiteApplicationController::class, 'update'])->name('update');
        Route::get('/{site}/back', [SiteApplicationController::class, 'back'])->name('back');
        
        Route::put('coordinating/{site}', [SiteApplicationController::class, 'coordinating'])->name('coordinating');      
        Route::put('submit/{site}', [SiteApplicationController::class, 'submit'])->name('submit');
       
        Route::get('customerSites/{customerId}', [SiteApplicationController::class, 'customerSites'])->name('customerSites'); 
       
    });

     // Land  routes
     Route::prefix('management0')->name('management0.')->group(function () {
        Route::get('/', [SiteApprovalController::class, 'index'])->name('index');        
        Route::get('/{site}/edit', [SiteApprovalController::class, 'edit'])->name('edit');      
        Route::put('approve/{site}', [SiteApprovalController::class, 'approve'])->name('approve'); 
        Route::get('/{site}/back', [SiteApprovalController::class, 'back'])->name('back');
    });


    // // --- investors Routes ---
    Route::prefix('management1')->name('management1.')->group(function () {
        Route::get('/', [SiteInterestAwardController::class, 'index'])->name('index');       
        Route::post('/', [SiteInterestAwardController::class, 'store'])->name('store');        
        Route::get('/{investor}/edit', [SiteInterestAwardController::class, 'edit'])->name('edit'); 
        Route::put('/{investor}', [SiteInterestAwardController::class, 'update'])->name('update');      
    });

    // // --- investors Routes ---
    Route::prefix('management2')->name('management2.')->group(function () {
        Route::get('/', [SiteHistoryController::class, 'index'])->name('index');       
        Route::post('/', [SiteHistoryController::class, 'store'])->name('store');        
        Route::get('/{site}/edit', [SiteHistoryController::class, 'edit'])->name('edit'); 
        Route::put('/{site}', [SiteHistoryController::class, 'update'])->name('update');
        Route::get('/{site}/back', [SiteHistoryController::class, 'back'])->name('back');    
    });


     // --- investors Routes ---
     Route::prefix('investor0')->name('investor0.')->group(function () {
        Route::get('/', [InvestorController::class, 'index'])->name('index'); 
        Route::get('/create', [InvestorController::class, 'create'])->name('create'); 
        Route::post('/', [InvestorController::class, 'store'])->name('store'); 
        Route::post('/directstore', [InvestorController::class, 'directstore'])->name('directstore');
        Route::get('/{investor}/edit', [InvestorController::class, 'edit'])->name('edit'); 
        Route::put('/{investor}', [InvestorController::class, 'update'])->name('update');
        Route::get('/search', [InvestorController::class, 'search'])->name('search'); 
    });

    // // --- investors Routes ---
     Route::prefix('investor1')->name('investor1.')->group(function () {
        Route::get('/', [SiteInterestController::class, 'index'])->name('index');       
        Route::post('/', [SiteInterestController::class, 'store'])->name('store');        
        Route::get('/{investor}/edit', [SiteInterestController::class, 'edit'])->name('edit'); 
        Route::put('/{investor}', [SiteInterestController::class, 'update'])->name('update');      
    });


    Route::prefix('reportingAnalytics0')->name('reportingAnalytics0.')->group(function () {       
        Route::get('/', [SiteReportController::class, 'landPortfolioReport'])->name('land-portfolio');
        Route::get('/{site}/view', [SiteReportController::class, 'view'])->name('view'); 
    });    

    
    // Routes for site Setup (Version 3)
    Route::prefix('systemconfiguration0')->name('systemconfiguration0.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/SiteSetup/Index');
        })->name('index'); // Added a proper route name for the index.
        

        // --- sectors Routes ---
        Route::prefix('sectors')->name('sectors.')->group(function () {
            Route::get('/', [SiteSectorController::class, 'index'])->name('index'); 
            Route::get('/create', [SiteSectorController::class, 'create'])->name('create'); 
            Route::post('/', [SiteSectorController::class, 'store'])->name('store'); 
            Route::get('/{sector}/edit', [SiteSectorController::class, 'edit'])->name('edit'); 
            Route::put('/{sector}', [SiteSectorController::class, 'update'])->name('update'); 
            Route::delete('/{sector}', [SiteSectorController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SiteSectorController::class, 'search'])->name('search');
        });
      

        // --- activities Routes ---
        Route::prefix('activities')->name('activities.')->group(function () {
            Route::get('/', [SiteActivityController::class, 'index'])->name('index'); 
            Route::get('/create', [SiteActivityController::class, 'create'])->name('create');
            Route::post('/', [SiteActivityController::class, 'store'])->name('store'); 
            Route::get('/{activity}/edit', [SiteActivityController::class, 'edit'])->name('edit');
            Route::put('/{activity}', [SiteActivityController::class, 'update'])->name('update');
            Route::delete('/{activity}', [SiteActivityController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SiteActivityController::class, 'search'])->name('search'); 
        });

        // --- allocationmethods Routes ---
        Route::prefix('allocationmethods')->name('allocationmethods.')->group(function () {
            Route::get('/', [SiteAllocationMethodController::class, 'index'])->name('index'); 
            Route::get('/create', [SiteAllocationMethodController::class, 'create'])->name('create');
            Route::post('/', [SiteAllocationMethodController::class, 'store'])->name('store'); 
            Route::get('/{allocationmethod}/edit', [SiteAllocationMethodController::class, 'edit'])->name('edit'); 
            Route::put('/{allocationmethod}', [SiteAllocationMethodController::class, 'update'])->name('update'); 
            Route::get('/search', [SiteAllocationMethodController::class, 'search'])->name('search'); 
        });  

        // --- jurisdictions Routes ---
        Route::prefix('jurisdictions')->name('jurisdictions.')->group(function () {
            Route::get('/', [SiteJurisdictionController::class, 'index'])->name('index'); 
            Route::get('/create', [SiteJurisdictionController::class, 'create'])->name('create');
            Route::post('/', [SiteJurisdictionController::class, 'store'])->name('store'); 
            Route::get('/{jurisdiction}/edit', [SiteJurisdictionController::class, 'edit'])->name('edit'); 
            Route::put('/{jurisdiction}', [SiteJurisdictionController::class, 'update'])->name('update'); 
            Route::get('/search', [SiteJurisdictionController::class, 'search'])->name('search'); 
        });  

         // --- opportunitytypes Routes ---
         Route::prefix('opportunitytypes')->name('opportunitytypes.')->group(function () {
            Route::get('/', [SiteOpportunityTypeController::class, 'index'])->name('index'); 
            Route::get('/create', [SiteOpportunityTypeController::class, 'create'])->name('create');
            Route::post('/', [SiteOpportunityTypeController::class, 'store'])->name('store'); 
            Route::get('/{opportunitytype}/edit', [SiteOpportunityTypeController::class, 'edit'])->name('edit'); 
            Route::put('/{opportunitytype}', [SiteOpportunityTypeController::class, 'update'])->name('update'); 
            Route::get('/search', [SiteOpportunityTypeController::class, 'search'])->name('search'); 
        });  

        // --- utilities Routes ---
        Route::prefix('utilities')->name('utilities.')->group(function () {
            Route::get('/', [SiteUtilityController::class, 'index'])->name('index'); 
            Route::get('/create', [SiteUtilityController::class, 'create'])->name('create');
            Route::post('/', [SiteUtilityController::class, 'store'])->name('store'); 
            Route::get('/{utility}/edit', [SiteUtilityController::class, 'edit'])->name('edit'); 
            Route::put('/{utility}', [SiteUtilityController::class, 'update'])->name('update'); 
            Route::get('/search', [SiteUtilityController::class, 'search'])->name('search'); 
        });  

    });       
 
    // Routes for Location Setup (Version 3)
    Route::prefix('systemconfiguration1')->name('systemconfiguration1.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/LocationSetup/Index');
        })->name('index'); // Added a proper route name for the index.


         // --- countries Routes ---
        Route::prefix('countries')->name('countries.')->group(function () {
            Route::get('/', [LOCCountryController::class, 'index'])->name('index'); 
            Route::get('/create', [LOCCountryController::class, 'create'])->name('create'); 
            Route::post('/', [LOCCountryController::class, 'store'])->name('store'); 
            Route::get('/{country}/edit', [LOCCountryController::class, 'edit'])->name('edit'); 
            Route::put('/{country}', [LOCCountryController::class, 'update'])->name('update'); 
            Route::delete('/{country}', [LOCCountryController::class, 'destroy'])->name('destroy');
            Route::get('/search', [LOCCountryController::class, 'search'])->name('search'); 
        });

        // --- Product regions Routes ---
        Route::prefix('regions')->name('regions.')->group(function () {
            Route::get('/', [LOCRegionController::class, 'index'])->name('index');
            Route::get('/create', [LOCRegionController::class, 'create'])->name('create');
            Route::post('/', [LOCRegionController::class, 'store'])->name('store');
            Route::get('/{region}/edit', [LOCRegionController::class, 'edit'])->name('edit');
            Route::put('/{region}', [LOCRegionController::class, 'update'])->name('update'); 
            Route::delete('/{region}', [LOCRegionController::class, 'destroy'])->name('destroy');
        });

        // --- District Routes ---
        Route::prefix('districts')->name('districts.')->group(function () {
            Route::get('/', [LOCDistrictController::class, 'index'])->name('index');
            Route::get('/create', [LOCDistrictController::class, 'create'])->name('create');
            Route::post('/', [LOCDistrictController::class, 'store'])->name('store');
            Route::get('/{district}/edit', [LOCDistrictController::class, 'edit'])->name('edit');
            Route::put('/{district}', [LOCDistrictController::class, 'update'])->name('update'); 
            Route::delete('/{district}', [LOCDistrictController::class, 'destroy'])->name('destroy');
        });

        // --- Ward Routes ---
        Route::prefix('wards')->name('wards.')->group(function () {
            Route::get('/', [LOCWardController::class, 'index'])->name('index');
            Route::get('/create', [LOCWardController::class, 'create'])->name('create');
            Route::post('/', [LOCWardController::class, 'store'])->name('store');
            Route::get('/{ward}/edit', [LOCWardController::class, 'edit'])->name('edit');
            Route::put('/{ward}', [LOCWardController::class, 'update'])->name('update'); 
            Route::delete('/{ward}', [LOCWardController::class, 'destroy'])->name('destroy');
        });

        // --- Street Routes ---
        Route::prefix('streets')->name('streets.')->group(function () {
            Route::get('/', [LOCStreetController::class, 'index'])->name('index');
            Route::get('/create', [LOCStreetController::class, 'create'])->name('create');
            Route::post('/', [LOCStreetController::class, 'store'])->name('store');
            Route::get('/{street}/edit', [LOCStreetController::class, 'edit'])->name('edit');
            Route::put('/{street}', [LOCStreetController::class, 'update'])->name('update'); 
            Route::delete('/{street}', [LOCStreeetController::class, 'destroy'])->name('destroy');
        });   
        

    });


    // Routes for Facility Setup (Version 3)
    Route::prefix('systemconfiguration2')->name('systemconfiguration2.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/FacilitySetup/Index');
        })->name('index'); // Added a proper route name for the index.

         // --- facilityoption Routes ---
         Route::prefix('facilityoptions')->name('facilityoptions.')->group(function () {
            Route::get('/', [FacilityOptionController::class, 'index'])->name('index');
            Route::get('/create', [FacilityOptionController::class, 'create'])->name('create');
            Route::post('/', [FacilityOptionController::class, 'store'])->name('store');
            Route::get('/{facilityoption}/edit', [FacilityOptionController::class, 'edit'])->name('edit');
            Route::put('/{facilityoption}', [FacilityOptionController::class, 'update'])->name('update'); 
            Route::delete('/{facilityoption}', [FacilityOptionController::class, 'destroy'])->name('destroy');
            Route::get('/search', [FacilityOptionController::class, 'search'])->name('search');
        });   

        // --- facilitybranch Routes ---
        Route::prefix('facilitybranches')->name('facilitybranches.')->group(function () {
            Route::get('/', [FacilityBranchController::class, 'index'])->name('index');
            Route::get('/create', [FacilityBranchController::class, 'create'])->name('create');
            Route::post('/', [FacilityBranchController::class, 'store'])->name('store');
            Route::get('/{facilitybranch}/edit', [FacilityBranchController::class, 'edit'])->name('edit');
            Route::put('/{facilitybranch}', [FacilityBranchController::class, 'update'])->name('update'); 
            Route::delete('/{facilitybranch}', [FacilityBranchController::class, 'destroy'])->name('destroy');
            Route::get('/search', [FacilityBranchController::class, 'search'])->name('search');
        });   

    });


    // Routes for User Management(Version 3)
    Route::prefix('usermanagement')->name('usermanagement.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('UserManagement/Index');
        })->name('index'); // Added a proper route name for the index.

         // --- usergroup Routes ---
         Route::prefix('usergroups')->name('usergroups.')->group(function () {
            Route::get('/', [UserGroupController::class, 'index'])->name('index');
            Route::get('/create', [UserGroupController::class, 'create'])->name('create');
            Route::post('/', [UserGroupController::class, 'store'])->name('store');
            Route::get('/{usergroup}/edit', [UserGroupController::class, 'edit'])->name('edit');
            Route::put('/{usergroup}', [UserGroupController::class, 'update'])->name('update'); 
            Route::delete('/{usergroup}', [UserGroupController::class, 'destroy'])->name('destroy');
            Route::get('/search', [UserGroupController::class, 'search'])->name('search');
        });   

         // --- user Routes ---
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('/create', [UserController::class, 'create'])->name('create');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [UserController::class, 'update'])->name('update');           
            Route::post('/{user}/resetPassword', [UserController::class, 'resetPassword'])->name('resetPassword');
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');

        });  
        
        // --- UserPermission Routes ---
        Route::prefix('userpermission')->name('userpermission.')->group(function () {
            Route::get('/', [UserPermissionController::class, 'index'])->name('index');         
            Route::get('/{userGroup}/permissions', [UserPermissionController::class, 'getPermissions'])->name('getPermissions');
            Route::post('/{userGroup}/permissions', [UserPermissionController::class, 'storePermissions'])->name('storePermissions');
            // New route for fetching modules and items
            Route::get('/modules-and-items', [UserPermissionController::class, 'getModulesAndItems'])->name('modulesAndItems');
        });   

    });
    
});


require __DIR__.'/auth.php';
