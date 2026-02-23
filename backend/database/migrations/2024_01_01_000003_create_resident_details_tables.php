<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resident_identifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')
                ->constrained('residents')
                ->cascadeOnDelete();

            $table->string('gov_id_type')->nullable();
            $table->string('gov_id_number')->nullable();
            $table->string('philhealth_number')->nullable();
            $table->string('sss_gsis_number')->nullable();
            $table->string('barangay_id_number')->nullable();
            $table->string('picture_path')->nullable();
            $table->string('signature_path')->nullable();

            $table->timestamps();
        });

        Schema::create('resident_employment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')
                ->constrained('residents')
                ->cascadeOnDelete();

            $table->string('employment_status')->nullable();
            $table->string('nature_of_work')->nullable();
            $table->string('employer_name')->nullable();
            $table->string('work_address')->nullable();
            $table->string('monthly_income_range')->nullable();

            $table->timestamps();
        });

        Schema::create('resident_residency', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')
                ->constrained('residents')
                ->cascadeOnDelete();

            $table->year('year_moved_in')->nullable();
            $table->string('original_city_or_province')->nullable();
            $table->string('residency_type')->nullable(); // Owner / Renting / etc.
            $table->text('residency_documents')->nullable();

            $table->timestamps();
        });

        Schema::create('resident_emergency_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')
                ->constrained('residents')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('contact_number');
            $table->string('relationship')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resident_emergency_contacts');
        Schema::dropIfExists('resident_residency');
        Schema::dropIfExists('resident_employment');
        Schema::dropIfExists('resident_identifications');
    }
};


