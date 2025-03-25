<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteOpportunityType extends Model
{
    protected $table = 'site_opportunitytypes';  // Specify table name
    protected $fillable = ['name']; 
    
}