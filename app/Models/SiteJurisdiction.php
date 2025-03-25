<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteJurisdiction extends Model
{
    protected $table = 'site_jurisdictions';  // Specify table name
    protected $fillable = ['name']; 
    
}