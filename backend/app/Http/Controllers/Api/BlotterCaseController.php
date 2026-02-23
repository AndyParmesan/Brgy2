<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlotterCase;
use Illuminate\Http\Request;

class BlotterCaseController extends Controller
{
    public function index(Request $request)
    {
        $query = BlotterCase::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('case_title', 'like', "%{$search}%")
                    ->orWhere('case_no', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(
            $query->orderByDesc('date_reported')->paginate(25)
        );
    }

    /**
     * Public endpoint to submit incident report
     */
    public function publicStore(Request $request)
    {
        $validated = $request->validate([
            'reporter_name' => 'required|string|max:255',
            'reporter_contact' => 'required|string|max:20',
            'reporter_email' => 'nullable|email|max:255',
            'reporter_address' => 'required|string|max:500',
            'incident_type' => 'required|string|max:255',
            'incident_date' => 'required|date',
            'incident_time' => 'required|string',
            'incident_location' => 'required|string|max:500',
            'incident_description' => 'required|string|max:2000',
            'persons_involved' => 'nullable|string|max:1000',
            'witnesses' => 'nullable|string|max:1000',
        ]);

        // Generate case number
        $caseCount = BlotterCase::whereYear('created_at', date('Y'))->count() + 1;
        $caseNo = 'BR-' . date('Y') . '-' . str_pad($caseCount, 3, '0', STR_PAD_LEFT);

        $blotterCase = BlotterCase::create([
            'case_no' => $caseNo,
            'case_title' => $validated['incident_type'] . ' at ' . $validated['incident_location'],
            'category' => $validated['incident_type'],
            'location' => $validated['incident_location'],
            'date_reported' => now(),
            'incident_date' => $validated['incident_date'],
            'incident_time' => $validated['incident_time'],
            'status' => 'Pending',
            'priority' => 'Normal',
            'summary' => substr($validated['incident_description'], 0, 255),
            'description' => $validated['incident_description'],
            'reporter_name' => $validated['reporter_name'],
            'reporter_contact' => $validated['reporter_contact'],
            'reporter_email' => $validated['reporter_email'] ?? null,
            'reporter_address' => $validated['reporter_address'],
            'persons_involved' => $validated['persons_involved'] ?? null,
            'witnesses' => $validated['witnesses'] ?? null,
        ]);

        return response()->json([
            'message' => 'Incident report submitted successfully',
            'reference_no' => $blotterCase->case_no,
            'data' => $blotterCase
        ], 201);
    }
}


