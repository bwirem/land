<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteActivity extends Model
{
    protected $table = 'site_activities';  // Specify table name
    protected $fillable = ['name']; 
    
}