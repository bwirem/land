<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sites';


    protected $fillable = [
        'owner_type',
        'first_name',
        'other_names',
        'surname',
        'company_name',
        'email',
        'phone',
        'landowner_id',
        'user_id',
        'sector_id',        
        'activity_id',
        'allocationmethod_id',
        'jurisdiction_id',
        'opportunitytype_id',
        'utility_id',
        'project_description',        
        'stage',
        'application_form',
        'status',
        'facilitybranch_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */   

    public function landowner()
    {
        return $this->belongsTo(LandOwner::class, 'landowner_id');
    }

    

    public function branch()
    {
        return $this->belongsTo(FacilityBranch::class, 'facilitybranch_id');
    }


    public function sector()
    {
        return $this->belongsTo(SiteSector::class, 'sector_id');
    }

    public function activity()
    {
        return $this->belongsTo(SiteActivity::class, 'activity_id');
    }

    public function allocationmethod()
    {
        return $this->belongsTo(SiteAllocationMethod::class, 'allocationmethod_id');
    }

    public function jurisdiction()
    {
        return $this->belongsTo(SiteJurisdiction::class, 'jurisdiction_id');
    }

    public function opportunitytype()
    {
        return $this->belongsTo(SiteOpportunityType::class, 'opportunitytype_id');
    }

    public function utility()
    {
        return $this->belongsTo(SiteUtility::class, 'utility_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function siteInvestors()
    {
        return $this->hasMany(SiteInvestor::class, 'site_id', 'id');
    }

    public function Investors()
    {
        return $this->belongsToMany(Investors::class, 'site_investors', 'site_id', 'investor_id')
            ->withPivot('collateral_doc', 'collateral_docname', 'user_id')
            ->withTimestamps();
    }

    public function approvals()
    {
        return $this->hasMany(SiteApproval::class);
    }

    public function siteCoordinates()
    {
        return $this->hasMany(SiteCoordinate::class, 'site_id', 'id');
    }

}

