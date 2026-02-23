<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::query()->with('actionItems');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('target_audience', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(
            $query->orderByDesc('published_on')->paginate(25)
        );
    }

    /**
     * Public endpoint for announcements (no authentication required)
     */
    public function publicIndex(Request $request)
    {
        $query = Announcement::query()
            ->where('status', 'Published')
            ->where('published_on', '<=', now())
            ->where(function ($q) {
                $q->whereNull('expires_on')
                    ->orWhere('expires_on', '>=', now());
            });

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $announcements = $query->orderByDesc('published_on')
            ->limit(50)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'summary' => $announcement->summary,
                    'body' => $announcement->body,
                    'category' => $announcement->category ?? 'announcements',
                    'badge' => $announcement->category === 'services' ? 'Service' : 
                              ($announcement->category === 'events' ? 'Event' : 'Announcement'),
                    'date' => $announcement->published_on 
                        ? 'Posted: ' . \Carbon\Carbon::parse($announcement->published_on)->format('F d, Y')
                        : 'Available Daily',
                    'description' => $announcement->summary ?? $announcement->body ?? '',
                    'items' => $announcement->items ?? null,
                    'info' => $announcement->info ?? null,
                    'note' => $announcement->note ?? null,
                    'link' => $announcement->link ?? null,
                    'highlights' => $announcement->highlights ?? null,
                    'schedule' => $announcement->schedule ?? null,
                    'published_on' => $announcement->published_on,
                    'expires_on' => $announcement->expires_on,
                    'target_audience' => $announcement->target_audience,
                    'priority' => $announcement->priority ?? 'Normal',
                ];
            });

        return response()->json($announcements);
    }
}


