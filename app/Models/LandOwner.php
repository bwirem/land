<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandOwner extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'landowners';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'landowner_type',
        'first_name',
        'other_names',
        'surname',
        'company_name',
        'email',
        'phone',
        'address',
        'stage',
        'document_type',
        'document_number',
        'document_path',
        'selfie_path',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */    

    protected $casts = [
        'landowner_type' => 'string',
        'document_type' => 'string',
    ];

    // Accessor to get the human-readable label
    public function getCustomerTypeNameAttribute()
    {
        return CustomerType::from($this->customer_type)->label();
    }

    // Accessor to get the human-readable label
    public function getDocumentTypeNameAttribute()
    {
        return DocumentType::from($this->document_type)->label();
    }


    
}