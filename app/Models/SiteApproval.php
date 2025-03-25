<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'approved_by',
        'stage',
        'remarks',
        'status',
    ];

    /**
     * Get the site associated with this approval.
     */
    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * Get the user who approved the site.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    
}
