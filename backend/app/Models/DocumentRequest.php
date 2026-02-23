<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_no',
        'resident_id',
        'requester_name',
        'contact_number',
        'email',
        'address',
        'document_type',
        'purpose',
        'intended_recipient',
        'status',
        'date_filed',
        'receiving_staff',
        'remarks',
        'additional_info',
    ];

    protected $casts = [
        'date_filed' => 'date',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function attachments()
    {
        return $this->hasMany(DocumentRequestAttachment::class);
    }
}


