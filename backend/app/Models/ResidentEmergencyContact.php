<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentEmergencyContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',
        'name',
        'contact_number',
        'relationship',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}


