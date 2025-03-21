<?php

use App\Http\Controllers\ProfileController;

use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\LoanApprovalController;

use App\Http\Controllers\BLSFeesTypeController;
use App\Http\Controllers\BLSPackageController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\LandOwnerController;
use App\Http\Controllers\InvestorController;


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

use App\Models\Sector;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'initialSectors' => Sector::select('id', 'name as description')->get(),
        'initialSites' => [
            ['id' => 101, 'project_description' => 'Farm Irrigation Project', 'street_name' => 'Green Valley Road'],
            ['id' => 102, 'project_description' => 'Software Hub', 'street_name' => 'Tech Avenue'],
            ['id' => 103, 'project_description' => 'Community Health Center', 'street_name' => 'Medical Street'],
        ],
        'initialAreas' => [
            [
                'id' => 201,
                'name' => 'Central District',
                'color' => '#FF5733',
                'coordinates' => [[-6.78, 35.74], [-6.79, 35.75], [-6.77, 35.76], [-6.78, 35.74]],
            ],
            [
                'id' => 202,
                'name' => 'Western Zone',
                'color' => '#33FF57',
                'coordinates' => [[-6.88, 35.70], [-6.89, 35.71], [-6.87, 35.72], [-6.88, 35.70]],
            ],
        ],
    ]);
});


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
        Route::put('/{landowner}', [LandOwnerController::class, 'update'])->name('update');
        Route::get('/search', [LandOwnerController::class, 'search'])->name('search'); 
    });   

    // Order routes
    Route::prefix('landowner1')->name('landowner1.')->group(function () {
        Route::get('/', [LoanApplicationController::class, 'index'])->name('index');
        Route::get('/create', [LoanApplicationController::class, 'create'])->name('create');
        Route::post('/', [LoanApplicationController::class, 'store'])->name('store');
        Route::get('/{loan}/edit', [LoanApplicationController::class, 'edit'])->name('edit');
        Route::put('/{loan}', [LoanApplicationController::class, 'update'])->name('update');
        Route::put('documentation/{loan}', [LoanApplicationController::class, 'documentation'])->name('documentation');
        Route::post('submit/{loan}', [LoanApplicationController::class, 'submit'])->name('submit');
        Route::get('customerLoans/{customerId}', [LoanApplicationController::class, 'customerLoans'])->name('customerLoans'); 
       
    });

     // Land  routes
     Route::prefix('management0')->name('management0.')->group(function () {
        Route::get('/', [LoanApprovalController::class, 'index'])->name('index');        
        Route::get('/{loan}/edit', [LoanApprovalController::class, 'edit'])->name('edit');
        Route::put('/{loan}', [LoanApprovalController::class, 'update'])->name('update'); 
        Route::post('approve/{loan}', [LoanApprovalController::class, 'approve'])->name('approve'); 
    });


    // Post Bills routes
    Route::prefix('management1')->name('management1.')->group(function () {
        Route::get('/', [LoanApprovalController::class, 'index'])->name('index');        
        Route::get('/{loan}/edit', [LoanApprovalController::class, 'edit'])->name('edit');
        Route::put('/{loan}', [LoanApprovalController::class, 'update'])->name('update'); 
        Route::post('approve/{loan}', [LoanApprovalController::class, 'approve'])->name('approve'); 
    });


     // --- guarantors Routes ---
     Route::prefix('investor0')->name('investor0.')->group(function () {
        Route::get('/', [InvestorController::class, 'index'])->name('index'); 
        Route::get('/create', [InvestorController::class, 'create'])->name('create'); 
        Route::post('/', [InvestorController::class, 'store'])->name('store'); 
        Route::post('/directstore', [InvestorController::class, 'directstore'])->name('directstore');
        Route::get('/{guarantor}/edit', [InvestorController::class, 'edit'])->name('edit'); 
        Route::put('/{guarantor}', [InvestorController::class, 'update'])->name('update');
        Route::get('/search', [InvestorController::class, 'search'])->name('search'); 
    });

    // --- guarantors Routes ---
    Route::prefix('investor1')->name('investor1.')->group(function () {
        Route::get('/', [InvestorController::class, 'index'])->name('index'); 
        Route::get('/create', [InvestorController::class, 'create'])->name('create'); 
        Route::post('/', [InvestorController::class, 'store'])->name('store'); 
        Route::post('/directstore', [InvestorController::class, 'directstore'])->name('directstore');
        Route::get('/{guarantor}/edit', [InvestorController::class, 'edit'])->name('edit'); 
        Route::put('/{guarantor}', [InvestorController::class, 'update'])->name('update');
        Route::get('/search', [InvestorController::class, 'search'])->name('search'); 
    });

       

    
    // Routes for loan Setup (Version 3)
    Route::prefix('systemconfiguration0')->name('systemconfiguration0.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/SiteSetup/Index');
        })->name('index'); // Added a proper route name for the index.
        

        // --- sectors Routes ---
        Route::prefix('sectors')->name('sectors.')->group(function () {
            Route::get('/', [SectorController::class, 'index'])->name('index'); // Lists item groups
            Route::get('/create', [SectorController::class, 'create'])->name('create'); // Show form to create new item group
            Route::post('/', [SectorController::class, 'store'])->name('store'); // Store new item group
            Route::get('/{sector}/edit', [SectorController::class, 'edit'])->name('edit'); // Show form to edit item group
            Route::put('/{sector}', [SectorController::class, 'update'])->name('update'); // Update item group
            Route::delete('/{sector}', [SectorController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SectorController::class, 'search'])->name('search');
        });
      

        // --- feestype Routes ---
        Route::prefix('feestypes')->name('feestypes.')->group(function () {
            Route::get('/', [BLSFeesTypeController::class, 'index'])->name('index'); 
            Route::get('/create', [BLSFeesTypeController::class, 'create'])->name('create');
            Route::post('/', [BLSFeesTypeController::class, 'store'])->name('store'); 
            Route::get('/{feestype}/edit', [BLSFeesTypeController::class, 'edit'])->name('edit');
            Route::put('/{feestype}', [BLSFeesTypeController::class, 'update'])->name('update');
            Route::delete('/{feestype}', [BLSFeesTypeController::class, 'destroy'])->name('destroy');
            Route::get('/search', [BLSFeesTypeController::class, 'search'])->name('search'); 
        });

        // --- packages Routes ---
        Route::prefix('loanpackages')->name('loanpackages.')->group(function () {
            Route::get('/', [BLSPackageController::class, 'index'])->name('index'); 
            Route::get('/create', [BLSPackageController::class, 'create'])->name('create');
            Route::post('/', [BLSPackageController::class, 'store'])->name('store'); 
            Route::get('/{loanpackage}/edit', [BLSPackageController::class, 'edit'])->name('edit'); 
            Route::put('/{loanpackage}', [BLSPackageController::class, 'update'])->name('update'); 
            Route::get('/search', [BLSPackageController::class, 'search'])->name('search'); 
        });  

    });

    
    // Routes for Expenses Setup (Version 3)
    Route::prefix('systemconfiguration1')->name('systemconfiguration1.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/ExpensesSetup/Index');
        })->name('index'); // Added a proper route name for the index.


         // --- itemgroups Routes ---
        Route::prefix('itemgroups')->name('itemgroups.')->group(function () {
            Route::get('/', [SEXPItemGroupController::class, 'index'])->name('index'); 
            Route::get('/create', [SEXPItemGroupController::class, 'create'])->name('create'); 
            Route::post('/', [SEXPItemGroupController::class, 'store'])->name('store'); 
            Route::get('/{itemgroup}/edit', [SEXPItemGroupController::class, 'edit'])->name('edit'); 
            Route::put('/{itemgroup}', [SEXPItemGroupController::class, 'update'])->name('update'); 
            Route::delete('/{itemgroup}', [SEXPItemGroupController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SEXPItemGroupController::class, 'search'])->name('search'); 
        });

          // --- items Routes ---
        Route::prefix('items')->name('items.')->group(function () {
            Route::get('/', [SEXPItemController::class, 'index'])->name('index');
            Route::get('/create', [SEXPItemController::class, 'create'])->name('create');
            Route::post('/', [SEXPItemController::class, 'store'])->name('store');
            Route::get('/{item}/edit', [SEXPItemController::class, 'edit'])->name('edit');
            Route::put('/{item}', [SEXPItemController::class, 'update'])->name('update'); 
            Route::delete('/{item}', [SEXPItemController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SEXPItemController::class, 'search'])->name('search'); 
        });
        

    });

    // Routes for Account Setup (Version 3)
    Route::prefix('systemconfiguration3')->name('systemconfiguration3.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/AccountSetup/Index');
        })->name('index'); // Added a proper route name for the index.

         // --- chartofaccount Routes ---
         Route::prefix('chartofaccounts')->name('chartofaccounts.')->group(function () {
            Route::get('/', [ChartOfAccountController::class, 'index'])->name('index');
            Route::get('/create', [ChartOfAccountController::class, 'create'])->name('create');
            Route::post('/', [ChartOfAccountController::class, 'store'])->name('store');
            Route::get('/{chartofaccount}/edit', [ChartOfAccountController::class, 'edit'])->name('edit');
            Route::put('/{chartofaccount}', [ChartOfAccountController::class, 'update'])->name('update'); 
            Route::delete('/{chartofaccount}', [ChartOfAccountController::class, 'destroy'])->name('destroy');
            Route::get('/search', [ChartOfAccountController::class, 'search'])->name('search');
        });   

    });
 
    // Routes for Location Setup (Version 3)
    Route::prefix('systemconfiguration4')->name('systemconfiguration4.')->group(function () {

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
    Route::prefix('systemconfiguration5')->name('systemconfiguration5.')->group(function () {

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
