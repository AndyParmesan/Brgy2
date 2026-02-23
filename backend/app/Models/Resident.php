<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;

    protected $fillable = [
        'household_id',
        'full_name',
        'gender',
        'resident_type',
        'date_of_birth',
        'place_of_birth',
        'civil_status',
        'nationality',
        'religion',
        'contact_mobile',
        'contact_email',
        'is_senior_citizen',
        'is_pwd',
        'pwd_type',
        'chronic_illnesses',
        'registered_voter',
        'voter_precinct_no',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_senior_citizen' => 'boolean',
        'is_pwd' => 'boolean',
        'registered_voter' => 'boolean',
    ];

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function identification()
    {
        return $this->hasOne(ResidentIdentification::class);
    }

    public function employment()
    {
        return $this->hasOne(ResidentEmployment::class);
    }

    public function residency()
    {
        return $this->hasOne(ResidentResidency::class);
    }

    public function emergencyContacts()
    {
        return $this->hasMany(ResidentEmergencyContact::class);
    }
}


