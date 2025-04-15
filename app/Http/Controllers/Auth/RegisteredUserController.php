<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\UserPermissionController;

use App\Models\User;
use App\Models\UserGroup;

use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{

    protected $userPermissionController;

    public function __construct(UserPermissionController $userPermissionController)
    {
        $this->userPermissionController = $userPermissionController;
    }


    /**
     * Display the registration view.
     */
    public function createmain(): Response
    {      
        return Inertia::render('Auth/RegisterMain');
    }

    public function createadmin(): Response
    {
        return Inertia::render('Auth/Register', [
            'userGroup' => 'Admin',
        ]);       
    }

    public function createlandowner(): Response
    {
        return Inertia::render('Auth/Register', [
            'userGroup' => 'Landowner',
        ]);       
    }

    public function createinvestor(): Response
    {
        return Inertia::render('Auth/Register', [
            'userGroup' => 'Investor',
        ]);       
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'usergroup' => 'required|in:Admin,Landowner,Investor',
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Create or retrieve the user group
        $userGroup = UserGroup::firstOrCreate(['name' => $request->usergroup]);

        // Assign permissions to Admin group if it was just created
        if ($request->usergroup === 'Admin' && $userGroup->wasRecentlyCreated) {
            $this->userPermissionController->assignAllPermissionsToAdmin($userGroup);
        }

        // Create the user and associate with the user group
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'usergroup_id' => $userGroup->id,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }

}
