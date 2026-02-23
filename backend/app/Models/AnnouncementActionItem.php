<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementActionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'announcement_id',
        'description',
        'is_completed',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
    ];

    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }
}


