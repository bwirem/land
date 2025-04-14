<?php

namespace App\Http\Controllers;

use App\Models\UserGroup;
use App\Models\UserGroupModuleItem;
use App\Models\UserGroupFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response; // Import the Response facade
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserPermissionController extends Controller
{
    /**
     * Display a listing of UserPermission.
     */
    public function index(Request $request)
    {
        $query = UserGroup::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $usergroups = $query->orderBy('created_at', 'desc')->paginate(10);

        // Get modules and module items
        $modules = $this->getModules();
        $moduleItems = $this->getModuleItems();

        // Prepare function access data
        $functionAccessData = [];
        foreach ($moduleItems as $moduleKey => $items) {
            foreach ($items as $item) {
                $functionAccessData[$item['key']] = $this->getFunctionAccess($item['key']);
            }
        }

        return inertia('UserManagement/UserPermission/Index', [
            'usergroups' => $usergroups,
            'modules' => $modules,
            'moduleitems' => $moduleItems,
            'functionAccessData' => $functionAccessData, // Include function access data
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store or update the module item and function access data for a given user group.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $userGroupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePermissions(Request $request, int $userGroupId)
    {
           
        // Validate the incoming request
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*.moduleItemKey' => 'required|string',
            'permissions.*.functionAccess' => 'required|array',
        ]);
    
        try {
            // Begin database transaction
            DB::transaction(function () use ($request, $userGroupId) {
                foreach ($request->permissions as $permission) {
                    // Find or create the UserGroupModuleItem record
                    $moduleItem = UserGroupModuleItem::firstOrNew(
                        ['usergroup_id' => $userGroupId, 'moduleitemkey' => $permission['moduleItemKey']]
                    );

                    // Save the new module item if it's not already saved
                    if (!$moduleItem->exists) {
                        $moduleItem->save();
                    }
                    
                    // Remove existing function access linked to the module item
                    UserGroupFunction::where('usergroup_id', $userGroupId)
                        ->where('usergroupmoduleitem_id', $moduleItem->id)
                        ->delete();

                    // Create new function access based on the provided data
                    foreach ($permission['functionAccess'] as $accessKey => $accessValue) {
                        if ($accessValue === true) {
                            UserGroupFunction::create([
                                'usergroup_id' => $userGroupId,
                                'usergroupmoduleitem_id' => $moduleItem->id,
                                'functionaccesskey' => $accessKey,
                            ]);
                        }
                    }                    
                }
            });
    
            // Return success response
            return response()->json([
                'success' => 'Permissions updated successfully!'
            ]);
        } catch (\Exception $e) {
            // Log error and return failure response
            \Log::error('Error updating permissions: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update permissions. Please try again.'
            ], 500);
        }
    }

    /**
     * Get the permissions for a specific user group.
     *
     * @param UserGroup $userGroup
     * @return array
     */
    public function getPermissions(UserGroup $userGroup)
    {
        $permissions = UserGroupModuleItem::with('userGroupFunctions')
            ->where('usergroup_id', $userGroup->id)
            ->get();

        // Transform data to match the needed format.
        $permissionsData = [];
        foreach($permissions as $permission) {
            foreach ($permission->userGroupFunctions as $function) {
                $permissionsData[] = [
                    'moduleitemkey' => $permission->moduleitemkey,
                    'functionaccesskey' => $function->functionaccesskey,
                    //'value' => $function->value, // Get value from your model
                    //'value' => $function->value === null ? false : (bool)$function->value, // Handle null
                    'value' =>true
                ];
            }
        }    
        return $permissionsData;
    }

    /**
     * assignAllPermissionsToAdmin
     *
     * @return array
     */
    public function assignAllPermissionsToAdmin(UserGroup $userGroup)
    {
          
        $modules = $this->getModuleItems();
        
        foreach ($modules as $moduleKey => $items) {
            foreach ($items as $item) {
                               
                $moduleItem = UserGroupModuleItem::firstOrCreate([
                    'usergroup_id' => $userGroup->id,
                    'moduleitemkey' => $item['key']
                ]);    
                
                $functionAccessKeys = $this->getFunctionAccess($item['key']);
                foreach ($functionAccessKeys as $accessKey => $accessValue) {
                    UserGroupFunction::create([
                        'usergroup_id' => $userGroup->id,
                        'usergroupmoduleitem_id' => $moduleItem->id,
                        'functionaccesskey' => $accessKey,
                    ]);                    
                }
            }
        }
    }

    /**
     * Get getModulesAndItems.
     *
     * @return array
     */
    // public function getModulesAndItems()
    // {
    //     $modules = $this->getModules();
    //     $moduleItems = $this->getModuleItems();

    //     return response()->json([
    //         'modules' => $modules,
    //         'moduleItems' => $moduleItems,
    //     ]);
    // }    

    public function getModulesAndItems()
    {
        $userGroupId = Auth::user()?->usergroup_id;

        // Fetch the modules and module items
        $modules = $this->getModules();
        $moduleItems = $this->getModuleItems();

        // Fetch the permissions for the specific user group
        $permissionsData = $this->getPermissions(UserGroup::find($userGroupId));

        // Initialize arrays to hold allowed modules and module items
        $allowedModules = [];
        $allowedModuleItems = [];

        // Loop through the module items and check if the user has permission
        foreach ($moduleItems as $moduleKey => $items) {
            $hasPermission = false;
            $filteredItems = [];

            // Check if the user has permission for any of the items in the module
            foreach ($items as $item) {
                if (in_array($item['key'], array_column($permissionsData, 'moduleitemkey'))) {
                    $hasPermission = true;
                    $filteredItems[] = $item; // Add allowed item to the module's list
                }
            }

            // If the user has permission for at least one item in the module, add the module to the allowed list
            if ($hasPermission) {
                $allowedModules[] = $moduleKey;
                $allowedModuleItems[$moduleKey] = $filteredItems; // Group items under their module
            }
        }

        // Filter the modules to only return the ones the user has access to, and re-index
        $filteredModules = array_values(array_filter($modules, fn($module) => in_array($module['modulekey'], $allowedModules)));

        // Return a JSON response with the allowed modules and module items
        return response()->json([
            'modules' => $filteredModules,  // Filtered modules properly structured
            'moduleItems' => $allowedModuleItems,  // Module items grouped under their modules
        ]);
    }


   /**
     * Get the modules data with icons.
     *
     * @return array
     */
    private function getModules(): array
    {
        return [
            ['modulekey' => 'dashboard', 'moduletext' => 'Dashboard', 'icon' => 'dashboard'], // Add Dashboard here
            ['modulekey' => 'landowner', 'moduletext' => 'Land Owner', 'icon' => 'landowner'],
            ['modulekey' => 'management', 'moduletext' => 'Management', 'icon' => 'management'],   
            ['modulekey' => 'investor', 'moduletext' => 'Investor', 'icon' => 'investor'],               
            ['modulekey' => 'reporting', 'moduletext' => 'Reporting/Analytics', 'icon' => 'reporting_analytics'],
            ['modulekey' => 'systemConfig', 'moduletext' => 'System Configuration', 'icon' => 'system_config'],
            ['modulekey' => 'userManagement', 'moduletext' => 'User Management', 'icon' => 'manage_accounts'],
            ['modulekey' => 'security', 'moduletext' => 'Security', 'icon' => 'security_settings'],
        ];
    }

    /**
     * Get the module items data with icons.
     *
     * @return array
     */
    private function getModuleItems(): array
    {
        return [
            'dashboard' => [
                ['key' => 'dashboard', 'text' => 'Overview', 'icon' => 'dashboard'], // Example item for Dashboard
            ],
            'landowner' => [
                ['key' => 'landowner0', 'text' => 'Registration', 'icon' => 'landowner_registraion'],
                ['key' => 'landowner1', 'text' => 'Application', 'icon' => 'landowner_application'],                        
            ],
            'management' => [                
                ['key' => 'management0', 'text' => 'Land Approval Workflow', 'icon' => 'management_land_approval'],
                ['key' => 'management1', 'text' => 'Investor Interest Award', 'icon' => 'management_investor_award'],                
                ['key' => 'management2', 'text' => 'History', 'icon' => 'history'],
            ],  

            'investor' => [
                ['key' => 'investor0', 'text' => 'Registration', 'icon' => 'investor_registraion'],
                ['key' => 'investor1', 'text' => 'Interest Notification', 'icon' => 'person'],               
            ],

            'reporting' => [
                ['key' => 'reportingAnalytics0', 'text' => 'Land Portfolio Reports', 'icon' => 'loan_reports'],
                ['key' => 'reportingAnalytics1', 'text' => 'Client Activity Reports', 'icon' => 'client_reports'],                
            ],
            'systemConfig' => [
                ['key' => 'systemconfiguration0', 'text' => 'Site Setup', 'icon' => 'loan_setup'],                
                ['key' => 'systemconfiguration1', 'text' => 'Location Setup', 'icon' => 'location_setup'],
                ['key' => 'systemconfiguration2', 'text' => 'Facility Setup', 'icon' => 'facility_setup'],
            ],
            'userManagement' => [
                ['key' => 'usermanagement', 'text' => 'Manage Users', 'icon' => 'manage_accounts'],
            ],
            'security' => [
                ['key' => 'security', 'text' => 'Audit Trail', 'icon' => 'security_settings'],
            ],
        ];
    }
    /**
     * Get the function access data.
     *
     * @param string $key The module item key (e.g., 'customer0', 'reportingAnalytics1').
     * @return array
     */
    // Backend (PHP - UserPermissionController.php) - getFunctionAccess method
    private function getFunctionAccess(string $key): array
    {
        // Default function access (basic permissions)
        $defaultFunctionAccess = [
            'create' => false,
            'read' => false,
            'update' => false,
            'delete' => false,
        ];

        // Add loan-specific permissions only for 'loan1'
        if ($key === 'loan1') {
            return [
                'read' => false, // Set read to false for loan1
                'officerreview' => false, // Default state
                'managerreview' => false,
                'committeereview' => false,
                'approve' => false,                
            ];
        }

        return $defaultFunctionAccess; // Return default for other keys
    }

}
