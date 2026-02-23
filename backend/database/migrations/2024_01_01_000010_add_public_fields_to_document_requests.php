<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->string('email')->nullable()->after('contact_number');
            $table->text('address')->nullable()->after('email');
            $table->text('additional_info')->nullable()->after('remarks');
        });
    }

    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropColumn(['email', 'address', 'additional_info']);
        });
    }
};

