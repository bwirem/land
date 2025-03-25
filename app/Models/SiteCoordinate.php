<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteCoordinate extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'latitude',
        'longitude',      
    ];

    /**
     * Get the site associated with this approval.
     */
    public function site()
    {
        return $this->belongsTo(Site::class);
    }  
    
}
