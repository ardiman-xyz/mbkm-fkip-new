<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Display dashboard with student data and statistics
     */
    public function index(Request $request): Response
    {
        $data = $this->dashboardService->getDashboardData($request);

        return Inertia::render('dashboard', $data);
    }

    /**
     * Get student detail data
     */
    public function show(int $studentId): Response
    {
        $student = $this->dashboardService->getStudentDetail($studentId);

        if (!$student) {
            abort(404, 'Student not found');
        }

        return Inertia::render('student/detail', [
            'student' => $student
        ]);
    }

    /**
     * Get students by status for AJAX requests
     */
    public function getByStatus(Request $request, string $status)
    {
        $students = $this->dashboardService->getStudentsByStatus($status);

        return response()->json([
            'status' => 'success',
            'data' => $students
        ]);
    }

    /**
     * Get activity types summary
     */
    public function getActivitySummary()
    {
        $summary = $this->dashboardService->getActivityTypesSummary();

        return response()->json([
            'status' => 'success',
            'data' => $summary
        ]);
    }
}