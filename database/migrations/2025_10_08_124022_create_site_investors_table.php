<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('site_investors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('site_id')->constrained('sites')->onDelete('cascade'); // Enforce site association
            $table->foreignId('investor_id')->nullable()->constrained('investors')->onDelete('set null');            
            $table->string('description')->nullable();
            $table->string('collateral_doc')->nullable(); // Path to the uploaded collateral doc
            $table->string('collateral_docname')->nullable();
            $table->timestamps();

            $table->unique(['site_id', 'investor_id']); // Prevent duplicate investor assignments to the same site
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_investors');
    }
};
