<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteInvestor extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'site_investors';

    protected $fillable = ['site_id', 'investor_id','description', 'collateral_doc','collateral_docname','user_id'];

    public function site()
    {
        return $this->belongsTo(Site::class, 'site_id', 'id');
    }

    public function investor()
    {
        return $this->belongsTo(Investor::class, 'investor_id', 'id');
    }
   
}