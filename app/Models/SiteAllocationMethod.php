<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteAllocationMethod extends Model
{
    protected $table = 'site_allocationmethods';  // Specify table name
    protected $fillable = ['name']; 
    
}