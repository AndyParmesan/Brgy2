<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no')->unique(); // DOC-2024-045

            $table->foreignId('resident_id')
                ->nullable()
                ->constrained('residents')
                ->nullOnDelete();

            $table->string('requester_name');
            $table->string('contact_number')->nullable();
            $table->string('document_type'); // Barangay Clearance, Indigency, etc.
            $table->string('purpose')->nullable();
            $table->string('intended_recipient')->nullable();

            $table->string('status')->default('Pending'); // Pending / Review / Approved / Released / Rejected
            $table->date('date_filed')->nullable();
            $table->string('receiving_staff')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();
        });

        Schema::create('document_request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_request_id')
                ->constrained('document_requests')
                ->cascadeOnDelete();

            $table->string('label');   // e.g. Supporting Documents
            $table->string('value');   // text description or file path

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_request_attachments');
        Schema::dropIfExists('document_requests');
    }
};


