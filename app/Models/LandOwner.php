<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandOwner extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'landowners';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'owner_type',
        'first_name',
        'other_names',
        'surname',
        'company_name',
        'email',
        'phone',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'owner_type' => 'string',
    ];

    
}