<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    protected $table = 'sectors';  // Specify table name
    protected $fillable = ['name']; 
    
}