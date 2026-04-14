<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentRequest::query()->with('attachments');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('requester_name', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(
            $query->orderByDesc('date_filed')->paginate(25)
        );
    }

    /**
     * Generates a cryptographically random, collision-safe reference number.
     *
     * Format: DOC-{YEAR}-{8 random alphanumeric chars}
     * Example: DOC-2026-K4RX92BT
     *
     * - Keeps the "DOC-" prefix and year for easy identification/filtering
     * - Replaces the sequential counter with 8 random uppercase alphanumeric chars
     *   (36^8 ≈ 2.8 trillion combinations — not enumerable)
     * - Loops on the rare chance of a collision (practically never happens)
     */
    private function generateReferenceNumber(): string
    {
        do {
            // Use Laravel's Str::random which pulls from random_bytes() internally —
            // cryptographically secure, not mt_rand/array_rand.
            $token = strtoupper(Str::random(8));
            $referenceNo = 'DOC-' . date('Y') . '-' . $token;
        } while (DocumentRequest::where('reference_no', $referenceNo)->exists());

        return $referenceNo;
    }

    /**
     * Public endpoint for document types and information
     */
    public function publicDocuments()
    {
        $documents = [
            [
                'type' => 'Barangay Clearance',
                'icon' => '📄',
                'description' => 'Required for employment, business permits, and other legal purposes',
                'requirements' => [
                    'Valid ID (Government-issued)',
                    'Barangay Residency Certificate or Proof of Address',
                    '1x1 ID Picture (2 copies)',
                    'Cedula or Community Tax Certificate',
                    'Processing Fee: ₱50.00'
                ],
                'processing_time' => '3-5 working days'
            ],
            [
                'type' => 'Barangay ID',
                'icon' => '🆔',
                'description' => 'Official identification for barangay residents',
                'requirements' => [
                    'Valid ID',
                    'Proof of Residency',
                    '1x1 ID Picture (2 copies)',
                    'Processing Fee: ₱100.00'
                ],
                'processing_time' => '5-7 working days'
            ],
            [
                'type' => 'Certificate of Residency',
                'icon' => '🏠',
                'description' => 'Proof of residence within the barangay',
                'requirements' => [
                    'Valid ID (Government-issued)',
                    'Proof of Address (Utility Bill, Lease Contract)',
                    '1x1 ID Picture (1 copy)',
                    'Processing Fee: ₱30.00'
                ],
                'processing_time' => '2-3 working days'
            ],
            [
                'type' => 'Certificate of Indigency',
                'icon' => '💰',
                'description' => 'For financial assistance and medical purposes',
                'requirements' => [
                    'Valid ID',
                    'Proof of Income (if employed)',
                    'Medical Certificate (if for medical assistance)',
                    'Barangay Clearance',
                    'Processing Fee: Free'
                ],
                'processing_time' => '3-5 working days'
            ],
            [
                'type' => 'Good Moral Certificate',
                'icon' => '👥',
                'description' => 'Character reference for employment or school',
                'requirements' => [
                    'Valid ID',
                    'Barangay Clearance',
                    '1x1 ID Picture (1 copy)',
                    'Letter of Request stating purpose',
                    'Processing Fee: ₱50.00'
                ],
                'processing_time' => '3-5 working days'
            ],
            [
                'type' => 'Business Clearance',
                'icon' => '🏪',
                'description' => 'Needed for business registration and renewal',
                'requirements' => [
                    'DTI/SEC Registration',
                    'Valid ID of Business Owner',
                    'Proof of Business Location',
                    'Barangay Clearance (Personal)',
                    'Processing Fee: ₱200.00'
                ],
                'processing_time' => '5-7 working days'
            ],
            [
                'type' => 'Construction Clearance',
                'icon' => '🏗️',
                'description' => 'Required before starting any construction project',
                'requirements' => [
                    'Building Permit from City Hall',
                    'Approved Building Plans',
                    'Valid ID of Property Owner',
                    'Land Title or Tax Declaration',
                    'Processing Fee: ₱500.00'
                ],
                'processing_time' => '7-10 working days'
            ],
            [
                'type' => 'Community Tax Certificate (Cedula)',
                'icon' => '📋',
                'description' => 'Annual tax certificate for residents',
                'requirements' => [
                    'Valid ID',
                    'Proof of Income',
                    'Processing Fee: Based on income bracket'
                ],
                'processing_time' => '1-2 working days'
            ],
            [
                'type' => 'First-Time Jobseeker Certificate',
                'icon' => '📑',
                'description' => 'For first-time employment seekers',
                'requirements' => [
                    'Valid ID',
                    'Barangay Clearance',
                    'Proof of being a first-time jobseeker',
                    'Processing Fee: Free'
                ],
                'processing_time' => '3-5 working days'
            ]
        ];

        return response()->json($documents);
    }

    /**
     * Public endpoint to submit document request
     */
    public function publicStore(Request $request)
    {
        $validated = $request->validate([
            'requester_name' => 'required|string|max:255',
            'document_type'  => 'required|string|max:255',
            'purpose'        => 'required|string|max:500',
            'contact_number' => 'required|string|max:20',
            'email'          => 'nullable|email|max:255',
            'address'        => 'required|string|max:500',
            'additional_info' => 'nullable|string|max:1000',
        ]);

        $documentRequest = DocumentRequest::create([
            'reference_no'   => $this->generateReferenceNumber(),
            'requester_name' => $validated['requester_name'],
            'document_type'  => $validated['document_type'],
            'purpose'        => $validated['purpose'],
            'contact_number' => $validated['contact_number'],
            'email'          => $validated['email'] ?? null,
            'address'        => $validated['address'],
            'status'         => 'Pending',
            'date_filed'     => now()->toDateString(),
            'additional_info' => $validated['additional_info'] ?? null,
        ]);

        return response()->json([
            'message'      => 'Document request submitted successfully',
            'reference_no' => $documentRequest->reference_no,
            'data'         => $documentRequest
        ], 201);
    }
}
