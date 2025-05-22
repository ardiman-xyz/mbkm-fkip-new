<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    private const CACHE_TTL = 300; // 5 minutes cache
    private const CACHE_PREFIX = 'dashboard_';
    /**
     * Get dashboard data with filters and pagination
     */
    public function getDashboardData(Request $request): array
    {
        $academicYearFilter = $request->get('academic_year', 'all');
        $placementFilter = $request->get('placement', 'all');
        $semesterFilter = $request->get('semester', 'all');
        $searchTerm = $request->get('search', '') ?? ''; // Handle null case
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);

        // Create cache key based on all parameters
        $cacheKey = $this->generateCacheKey('dashboard_data', [
            'academic_year' => $academicYearFilter,
            'placement' => $placementFilter,
            'semester' => $semesterFilter,
            'search' => $searchTerm,
            'per_page' => $perPage,
            'page' => $page
        ]);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use (
            $academicYearFilter, $placementFilter, $semesterFilter, $searchTerm, $perPage, $page
        ) {
            // Get paginated students from database
            $students = $this->getPaginatedStudents(
                $academicYearFilter, 
                $placementFilter, 
                $semesterFilter, 
                $searchTerm,
                $perPage,
                $page
            );

            // Calculate statistics from all data (not just current page)
            $allStudents = $this->getFilteredStudents($academicYearFilter, $placementFilter, $semesterFilter, $searchTerm);
            $statistics = $this->calculateStatistics($allStudents);
            $filterOptions = $this->getFilterOptions();

            return [
                'students' => [
                    'data' => $students->items(),
                    'pagination' => [
                        'current_page' => $students->currentPage(),
                        'last_page' => $students->lastPage(),
                        'per_page' => $students->perPage(),
                        'total' => $students->total(),
                        'from' => $students->firstItem(),
                        'to' => $students->lastItem(),
                    ]
                ],
                'statistics' => $statistics,
                'filters' => [
                    'academic_years' => $filterOptions['academic_years'],
                    'placements' => $filterOptions['placements'],
                    'semesters' => $filterOptions['semesters'],
                    'current_academic_year' => $academicYearFilter,
                    'current_placement' => $placementFilter,
                    'current_semester' => $semesterFilter,
                ]
            ];
        });
    }

    /**
     * Get paginated students data from database
     */
    private function getPaginatedStudents(
        string $academicYear, 
        string $placement, 
        string $semester, 
        ?string $search, // Allow null
        int $perPage,
        int $page
    ): LengthAwarePaginator {
        // Ensure search is not null
        $search = $search ?? '';
        
        $query = Registration::with(['student'])
            ->when($academicYear !== 'all', function ($q) use ($academicYear) {
                return $q->where('tahun_akademik', $academicYear);
            })
            ->when($placement !== 'all', function ($q) use ($placement) {
                return $q->where('lokasi', $placement);
            })
            ->when($semester !== 'all', function ($q) use ($semester) {
                return $q->where('semester', $semester);
            })
            ->when(!empty($search), function ($q) use ($search) {
                return $q->where(function ($query) use ($search) {
                    $query->where('nim', 'like', "%{$search}%")
                          ->orWhereHas('student', function ($studentQuery) use ($search) {
                              $studentQuery->where('nama_lengkap', 'like', "%{$search}%");
                          })
                          ->orWhere('lokasi', 'like', "%{$search}%");
                });
            })
            ->latest();

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform the data
        $paginated->getCollection()->transform(function ($registration) {
            return [
                'id' => $registration->id,
                'nim' => $registration->nim,
                'name' => $registration->student?->nama_lengkap ?? 'Unknown',
                'study_program' => $this->getStudyProgramName($registration->id_prodi),
                'academic_year' => $registration->tahun_akademik,
                'semester' => $registration->semester,
                'activity_type' => $registration->jenis_kegiatan,
                'placement' => $registration->lokasi,
                'location' => $this->getLocationFromPlacement($registration->lokasi),
                'phone' => $registration->no_hp,
                'status' => $this->determineStatus($registration),
                'payment_status' => !empty($registration->bukti_bayar) ? 'Paid' : 'Unpaid',
                'report_status' => !empty($registration->laporan) ? 'Submitted' : 'Not Submitted',
                'registered_at' => $registration->created_at?->format('Y-m-d'),
                'score' => $registration->nilai,
                'gender' => $this->getGenderFromStudent($registration),
            ];
        });

        return $paginated;
    }

    /**
     * Get all filtered students data for statistics (without pagination)
     */
    private function getFilteredStudents(
        string $academicYear, 
        string $placement, 
        string $semester, 
        ?string $search // Allow null
    ): array {
        // Ensure search is not null
        $search = $search ?? '';
        
        $query = Registration::with(['student'])
            ->when($academicYear !== 'all', function ($q) use ($academicYear) {
                return $q->where('tahun_akademik', $academicYear);
            })
            ->when($placement !== 'all', function ($q) use ($placement) {
                return $q->where('lokasi', $placement);
            })
            ->when($semester !== 'all', function ($q) use ($semester) {
                return $q->where('semester', $semester);
            })
            ->when(!empty($search), function ($q) use ($search) {
                return $q->where(function ($query) use ($search) {
                    $query->where('nim', 'like', "%{$search}%")
                          ->orWhereHas('student', function ($studentQuery) use ($search) {
                              $studentQuery->where('nama_lengkap', 'like', "%{$search}%");
                          })
                          ->orWhere('lokasi', 'like', "%{$search}%");
                });
            });

        return $query->get()->map(function ($registration) {
            return [
                'id' => $registration->id,
                'nim' => $registration->nim,
                'name' => $registration->student?->nama_lengkap ?? 'Unknown',
                'study_program' => $this->getStudyProgramName($registration->id_prodi),
                'academic_year' => $registration->tahun_akademik,
                'semester' => $registration->semester,
                'activity_type' => $registration->jenis_kegiatan,
                'placement' => $registration->lokasi,
                'location' => $this->getLocationFromPlacement($registration->lokasi),
                'phone' => $registration->no_hp,
                'status' => $this->determineStatus($registration),
                'payment_status' => !empty($registration->bukti_bayar) ? 'Paid' : 'Unpaid',
                'report_status' => !empty($registration->laporan) ? 'Submitted' : 'Not Submitted',
                'registered_at' => $registration->created_at?->format('Y-m-d'),
                'score' => $registration->nilai,
                'gender' => $this->getGenderFromStudent($registration),
            ];
        })->toArray();
    }

    /**
     * Calculate dashboard statistics from filtered data
     */
    private function calculateStatistics(array $students): array
    {
        $collection = collect($students);

        // Calculate gender distribution
        $maleCount = $collection->where('gender', 'Laki-laki')->count();
        $femaleCount = $collection->where('gender', 'Perempuan')->count();

        // Calculate unique partners/placements
        $uniquePlacements = $collection->pluck('placement')->unique()->count();

        return [
            'total' => $collection->count(),
            'male' => $maleCount,
            'female' => $femaleCount,
            'partners' => $uniquePlacements,
            'active' => $collection->where('status', 'Active')->count(),
            'completed' => $collection->where('status', 'Completed')->count(),
            'pending_payment' => $collection->where('status', 'Awaiting Payment')->count(),
            'awaiting_assessment' => $collection->where('status', 'Awaiting Assessment')->count(),
        ];
    }

    /**
     * Get filter options from database
     */
    private function getFilterOptions(): array
    {
        return [
            'academic_years' => $this->getAcademicYearOptions(),
            'placements' => $this->getPlacementOptions(),
            'semesters' => $this->getSemesterOptions(),
        ];
    }

    /**
     * Get academic year options from database (cached)
     */
    private function getAcademicYearOptions(): array
    {
        $cacheKey = self::CACHE_PREFIX . 'academic_years';
        
        return Cache::remember($cacheKey, self::CACHE_TTL * 4, function () {
            return Registration::select('tahun_akademik')
                ->distinct()
                ->whereNotNull('tahun_akademik')
                ->orderBy('tahun_akademik', 'desc')
                ->pluck('tahun_akademik')
                ->map(fn($year) => ['value' => $year, 'label' => $year])
                ->prepend(['value' => 'all', 'label' => 'Semua Tahun Akademik'])
                ->toArray();
        });
    }

    /**
     * Get placement options from database (cached)
     */
    private function getPlacementOptions(): array
    {
        $cacheKey = self::CACHE_PREFIX . 'placements';
        
        return Cache::remember($cacheKey, self::CACHE_TTL * 4, function () {
            return Registration::select('lokasi')
                ->distinct()
                ->whereNotNull('lokasi')
                ->where('lokasi', '!=', '')
                ->orderBy('lokasi')
                ->pluck('lokasi')
                ->map(fn($placement) => ['value' => $placement, 'label' => $placement])
                ->prepend(['value' => 'all', 'label' => 'Semua Penempatan'])
                ->toArray();
        });
    }

    /**
     * Get semester options (only Ganjil and Genap)
     */
    private function getSemesterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'Semua Semester'],
            ['value' => 'Ganjil', 'label' => 'Ganjil'],
            ['value' => 'Genap', 'label' => 'Genap'],
        ];
    }

    /**
     * Helper method to determine registration status
     */
    private function determineStatus($registration): string
    {
        if (!empty($registration->nilai)) {
            return 'Completed';
        } elseif (!empty($registration->laporan)) {
            return 'Awaiting Assessment';
        } elseif (!empty($registration->bukti_bayar)) {
            return 'Active';
        } else {
            return 'Awaiting Payment';
        }
    }

    /**
     * Helper method to get study program name
     */
    private function getStudyProgramName($prodiId): string
    {
        $prodiMapping = [
            1 => 'Pendidikan Bahasa Indonesia',
            2 => 'Pendidikan Matematika',
            3 => 'Pendidikan Fisika',
            4 => 'Pendidikan Biologi',
            5 => 'Pendidikan Kimia',
            6 => 'Pendidikan Bahasa Inggris',
            7 => 'Pendidikan Sejarah',
            8 => 'Pendidikan Geografi',
            9 => 'Pendidikan Olahraga',
            10 => 'Pendidikan Seni',
        ];

        return $prodiMapping[$prodiId] ?? 'Program Studi Tidak Dikenal';
    }

    /**
     * Helper method to extract location from placement
     */
    private function getLocationFromPlacement($placement): string
    {
        if (str_contains(strtoupper($placement), 'KENDARI')) return 'Kendari';
        if (str_contains(strtoupper($placement), 'MAKASSAR')) return 'Makassar';
        if (str_contains(strtoupper($placement), 'BAUBAU')) return 'Baubau';
        if (str_contains(strtoupper($placement), 'JAKARTA')) return 'Jakarta';
        if (str_contains(strtoupper($placement), 'YOGYAKARTA')) return 'Yogyakarta';
        if (str_contains(strtoupper($placement), 'WAKATOBI')) return 'Wakatobi';
        if (str_contains(strtoupper($placement), 'BITUNG')) return 'Bitung';
        
        return 'Lainnya';
    }

    /**
     * Helper method to get gender from student
     */
    private function getGenderFromStudent($registration): string
    {
        $gender = $registration->student?->jenis_kelamin;
        return $gender === 'L' ? 'Laki-laki' : ($gender === 'P' ? 'Perempuan' : 'Unknown');
    }

    /**
     * Get detailed student data by ID
     */
    public function getStudentDetail(int $registrationId): ?array
    {
        $registration = Registration::with(['student'])->find($registrationId);
        
        if (!$registration) {
            return null;
        }

        return [
            'id' => $registration->id,
            'nim' => $registration->nim,
            'name' => $registration->student?->nama_lengkap ?? 'Unknown',
            'study_program' => $this->getStudyProgramName($registration->id_prodi),
            'academic_year' => $registration->tahun_akademik,
            'semester' => $registration->semester,
            'activity_type' => $registration->jenis_kegiatan,
            'placement' => $registration->lokasi,
            'phone' => $registration->no_hp,
            'status' => $this->determineStatus($registration),
            'payment_status' => !empty($registration->bukti_bayar) ? 'Paid' : 'Unpaid',
            'payment_proof' => $registration->bukti_bayar,
            'report' => $registration->laporan,
            'score' => $registration->nilai,
            'gender' => $this->getGenderFromStudent($registration),
            'created_at' => $registration->created_at,
            'updated_at' => $registration->updated_at,
        ];
    }

    /**
     * Get students by status from database
     */
    public function getStudentsByStatus(string $status): array
    {
        $registrations = Registration::with(['student'])
            ->get()
            ->filter(function ($registration) use ($status) {
                return $this->determineStatus($registration) === $status;
            });

        return $registrations->map(function ($registration) {
            return [
                'id' => $registration->id,
                'nim' => $registration->nim,
                'name' => $registration->student?->nama_lengkap ?? 'Unknown',
                'study_program' => $this->getStudyProgramName($registration->id_prodi),
                'placement' => $registration->lokasi,
                'status' => $this->determineStatus($registration),
            ];
        })->values()->toArray();
    }

    /**
     * Get activity types summary from database
     */
    public function getActivityTypesSummary(): array
    {
        return Registration::select('jenis_kegiatan')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN bukti_bayar IS NOT NULL THEN 1 ELSE 0 END) as active')
            ->selectRaw('SUM(CASE WHEN nilai IS NOT NULL THEN 1 ELSE 0 END) as completed')
            ->groupBy('jenis_kegiatan')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->jenis_kegiatan,
                    'total' => $item->total,
                    'active' => $item->active,
                    'completed' => $item->completed,
                ];
            })
            ->toArray();
    }

    /**
     * Export students data to Excel/CSV
     */
    public function exportStudents(Request $request): array
    {
        $academicYearFilter = $request->get('academic_year', 'all');
        $placementFilter = $request->get('placement', 'all');
        $semesterFilter = $request->get('semester', 'all');
        $searchTerm = $request->get('search', '') ?? '';

        // Get all data for export (no pagination)
        return $this->getFilteredStudents($academicYearFilter, $placementFilter, $semesterFilter, $searchTerm);
    }

    /**
     * Get dashboard summary for API (cached)
     */
    public function getDashboardSummary(): array
    {
        $cacheKey = self::CACHE_PREFIX . 'summary';
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () {
            $totalStudents = Registration::count();
            $activeStudents = Registration::whereNotNull('bukti_bayar')->whereNull('nilai')->count();
            $completedStudents = Registration::whereNotNull('nilai')->count();
            $pendingPayment = Registration::whereNull('bukti_bayar')->count();

            return [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'completed_students' => $completedStudents,
                'pending_payment' => $pendingPayment,
                'completion_rate' => $totalStudents > 0 ? round(($completedStudents / $totalStudents) * 100, 2) : 0,
            ];
        });
    }

    /**
     * Generate cache key based on method and parameters
     */
    private function generateCacheKey(string $method, array $params): string
    {
        $paramString = http_build_query($params);
        return self::CACHE_PREFIX . $method . '_' . md5($paramString);
    }

    /**
     * Clear all dashboard related cache
     */
    public function clearCache(): void
    {
        // Clear filter options cache
        Cache::forget(self::CACHE_PREFIX . 'academic_years');
        Cache::forget(self::CACHE_PREFIX . 'placements');
        Cache::forget(self::CACHE_PREFIX . 'summary');
        
        // Clear all dashboard data cache (pattern-based)
        $pattern = self::CACHE_PREFIX . 'dashboard_data_*';
        $this->clearCacheByPattern($pattern);
    }

    /**
     * Clear cache by pattern (for Redis/Database cache stores)
     */
    private function clearCacheByPattern(string $pattern): void
    {
        try {
            // For Redis cache
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                $redis = Cache::getStore()->getRedis();
                $keys = $redis->keys($pattern);
                if (!empty($keys)) {
                    $redis->del($keys);
                }
            }
            // For other cache stores, this would need different implementation
        } catch (\Exception $e) {
            // Fallback: if pattern clearing fails, just log it
            Log::warning('Cache pattern clear failed: ' . $e->getMessage());
        }
    }

    /**
     * Invalidate cache when data changes
     */
    public function invalidateCache(): void
    {
        $this->clearCache();
    }
}