<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RegistrantController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, "index"])->name('dashboard');



    Route::prefix('registrants')->name('registrants.')->group(function () {
        
        // Show specific registrant details
        Route::get('/{registrant}', [RegistrantController::class, 'show'])->name('show');
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
