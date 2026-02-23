<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'reference_no',
        'title',
        'summary',
        'body',
        'items',
        'info',
        'note',
        'link',
        'highlights',
        'schedule',
        'priority',
        'status',
        'target_audience',
        'posted_by',
        'published_on',
        'expires_on',
    ];

    protected $casts = [
        'items' => 'array',
        'highlights' => 'array',
        'schedule' => 'array',
        'published_on' => 'date',
        'expires_on' => 'date',
    ];

    protected $casts = [
        'published_on' => 'date',
        'expires_on' => 'date',
    ];

    public function actionItems()
    {
        return $this->hasMany(AnnouncementActionItem::class);
    }
}


