<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentIdentification extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',
        'gov_id_type',
        'gov_id_number',
        'philhealth_number',
        'sss_gsis_number',
        'barangay_id_number',
        'picture_path',
        'signature_path',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}


