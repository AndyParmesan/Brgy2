<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlotterCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_no',
        'case_title',
        'category',
        'status',
        'priority',
        'schedule_datetime',
        'schedule_location',
        'investigator_name',
        'location',
        'summary',
        'date_reported',
        'reporter_name',
        'reporter_contact',
        'reporter_email',
        'reporter_address',
        'incident_date',
        'incident_time',
        'description',
        'persons_involved',
        'witnesses',
    ];

    protected $casts = [
        'schedule_datetime' => 'datetime',
        'date_reported' => 'datetime',
    ];

    public function parties()
    {
        return $this->hasMany(BlotterParty::class);
    }

    public function actions()
    {
        return $this->hasMany(BlotterAction::class);
    }
}


