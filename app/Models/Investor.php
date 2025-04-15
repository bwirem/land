<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Investor extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'investors';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'user_id',
        'investor_type',
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
        'investor_type' => 'string',
    ];
}