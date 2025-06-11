<?php

namespace App\Services;

use App\Models\Registration;
use App\Models\Logbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class LogbookService
{
    private const CACHE_TTL = 300;
    private const CACHE_PREFIX = 'logbooks_';

    /**
     * Get logbook overview with all students
     */
    public function getLogbookOverview(Request $request): array
    {
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $academicYear = $request->get('academic_year', 'all');
        $prodi = $request->get('prodi', 'all');

        $query = Registration::with(['student', 'logbooks' => function ($query) {
            $query->orderBy('mingguKe', 'desc')->orderBy('tgl_kegiatan', 'desc')->limit(5);
        }])
            ->when($search, function ($q) use ($search) {
                return $q->where(function ($query) use ($search) {
                    $query->where('nim', 'like', "%{$search}%")
                          ->orWhereHas('student', function ($studentQuery) use ($search) {
                              $studentQuery->where('nama_lengkap', 'like', "%{$search}%");
                          });
                });
            })
            ->when($academicYear !== 'all', function ($q) use ($academicYear) {
                return $q->where('tahun_akademik', $academicYear);
            })
            ->when($prodi !== 'all', function ($q) use ($prodi) {
                return $q->where('id_prodi', $prodi);
            })
            ->latest();

        $allRegistrants = $query->get();
        
        // Transform and include actual logbook activities
        $transformedData = $allRegistrants->map(function ($registration) {
            $logbookStats = $this->calculateLogbookStats($registration->logbooks);
            
            // Get recent logbook activities
            $recentLogbooks = $registration->logbooks->take(3)->map(function ($logbook) {
                return [
                    'id' => $logbook->id,
                    'week' => $logbook->mingguKe,
                    'date' => $logbook->tgl_kegiatan,
                    'activity_name' => $logbook->nama_kegiatan ? $this->stripHtml($logbook->nama_kegiatan) : null,
                    'objective' => $logbook->tujuan_kegiatan ? $this->stripHtml($logbook->tujuan_kegiatan) : null,
                    'notes' => $logbook->catatan ? $this->stripHtml($logbook->catatan) : null,
                    'completion_percentage' => $this->getCompletionPercentage($logbook),
                ];
            });
            
            return [
                'id' => $registration->id,
                'nim' => $registration->nim,
                'name' => $registration->student?->nama_lengkap ?? 'Unknown',
                'study_program' => $this->getStudyProgramName($registration->id_prodi),
                'academic_year' => $registration->tahun_akademik,
                'semester' => $registration->semester,
                'activity_type' => $registration->jenis_kegiatan,
                'placement' => $registration->lokasi,
                'logbook_stats' => $logbookStats,
                'recent_logbooks' => $recentLogbooks,
                'status' => $this->determineStatus($registration),
            ];
        });

        // Manual pagination
        $total = $transformedData->count();
        $items = $transformedData->forPage($page, $perPage)->values();

        return [
            'students' => [
                'data' => $items->toArray(),
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => ceil($total / $perPage),
                    'per_page' => $perPage,
                    'total' => $total,
                    'from' => ($page - 1) * $perPage + 1,
                    'to' => min($page * $perPage, $total),
                ]
            ],
            'statistics' => $this->getLogbookStatistics(),
            'filters' => $this->getFilterOptions()
        ];
    }

    /**
     * Get specific student's logbooks
     */
    public function getStudentLogbooks(Registration $registrant): array
    {
        $registrant->load(['student', 'logbooks' => function ($query) {
            $query->orderBy('mingguKe', 'desc')->orderBy('tgl_kegiatan', 'desc');
        }]);

        $logbooks = $registrant->logbooks->map(function ($logbook) {
            return $this->transformLogbook($logbook);
        });

        return [
            'student' => [
                'id' => $registrant->id,
                'nim' => $registrant->nim,
                'name' => $registrant->student?->nama_lengkap ?? 'Unknown',
                'study_program' => $this->getStudyProgramName($registrant->id_prodi),
                'academic_year' => $registrant->tahun_akademik,
                'semester' => $registrant->semester,
                'activity_type' => $registrant->jenis_kegiatan,
                'placement' => $registrant->lokasi,
            ],
            'logbooks' => $logbooks,
            'statistics' => $this->calculateLogbookStats($registrant->logbooks)
        ];
    }

    /**
     * Get logbook detail
     */
    public function getLogbookDetail(Logbook $logbook): array
    {
        $logbook->load(['registration.student']);

        return [
            'logbook' => $this->transformLogbook($logbook),
            'student' => [
                'id' => $logbook->registration->id,
                'nim' => $logbook->registration->nim,
                'name' => $logbook->registration->student?->nama_lengkap ?? 'Unknown',
                'study_program' => $this->getStudyProgramName($logbook->registration->id_prodi),
                'placement' => $logbook->registration->lokasi,
            ]
        ];
    }

    /**
     * Calculate logbook statistics for a student
     */
    private function calculateLogbookStats($logbooks): array
    {
        $total = $logbooks->count();
        
        // Calculate completion for each logbook entry
        $logbooksWithCompletion = $logbooks->map(function ($logbook) {
            return $this->getCompletionPercentage($logbook);
        });
        
        $completed = $logbooksWithCompletion->filter(function ($percentage) {
            return $percentage == 100;
        })->count();
        
        $partial = $logbooksWithCompletion->filter(function ($percentage) {
            return $percentage > 0 && $percentage < 100;
        })->count();
        
        $incomplete = $logbooksWithCompletion->filter(function ($percentage) {
            return $percentage == 0;
        })->count();
        
        $averageCompletion = $total > 0 ? round($logbooksWithCompletion->avg(), 1) : 0;
        $completionRate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;
        
        // Get latest entry date
        $latestEntry = null;
        if ($logbooks->isNotEmpty()) {
            $latestLogbook = $logbooks->sortByDesc('tgl_kegiatan')->first();
            if ($latestLogbook && $latestLogbook->tgl_kegiatan) {
                $latestEntry = $latestLogbook->tgl_kegiatan;
            }
        }
        
        return [
            'total_entries' => $total,
            'completed_entries' => $completed,
            'partial_entries' => $partial,
            'incomplete_entries' => $incomplete,
            'completion_rate' => $completionRate,
            'average_completion' => $averageCompletion,
            'weeks_covered' => $logbooks->pluck('mingguKe')->unique()->count(),
            'latest_entry' => $latestEntry,
        ];
    }

    /**
     * Transform logbook data
     */
    private function transformLogbook(Logbook $logbook): array
    {
        return [
            'id' => $logbook->id,
            'week' => $logbook->mingguKe,
            'activity_date' => $logbook->tgl_kegiatan,
            'activity_date_formatted' => $logbook->tgl_kegiatan,
            'activity_name' => $logbook->nama_kegiatan,
            'activity_objective' => $logbook->tujuan_kegiatan,
            'notes' => $logbook->catatan,
            'conclusion' => $logbook->kesimpulan,
            'completion_status' => $this->getCompletionStatus($logbook),
            'completion_percentage' => $this->getCompletionPercentage($logbook),
            'created_at' => $logbook->date_created,
        ];
    }

    /**
     * Get completion status
     */
    private function getCompletionStatus($logbook): string
    {
        $percentage = $this->getCompletionPercentage($logbook);
        
        if ($percentage == 100) return 'Complete';
        if ($percentage >= 75) return 'Nearly Complete';
        if ($percentage >= 50) return 'Partial';
        return 'Incomplete';
    }

    /**
     * Get completion percentage
     */
    private function getCompletionPercentage($logbook): int
    {
        $requiredFields = ['nama_kegiatan', 'tujuan_kegiatan', 'catatan', 'kesimpulan'];
        $filledFields = 0;
        
        foreach ($requiredFields as $field) {
            if (!empty($logbook->$field)) {
                $filledFields++;
            }
        }
        
        return round(($filledFields / count($requiredFields)) * 100);
    }

    /**
     * Strip HTML tags from content
     */
    private function stripHtml($html): string
    {
        return strip_tags($html);
    }

    /**
     * Get overall logbook statistics
     */
    public function getLogbookStatistics(): array
    {
        return Cache::remember(self::CACHE_PREFIX . 'statistics', self::CACHE_TTL, function () {
            $totalLogbooks = Logbook::count();
            $totalStudents = Registration::has('logbooks')->count();
            $averageEntriesPerStudent = $totalStudents > 0 ? round($totalLogbooks / $totalStudents, 1) : 0;
            
            // Calculate completion rates
            $allLogbooks = Logbook::all();
            $completedLogbooks = $allLogbooks->filter(function ($logbook) {
                return $this->getCompletionPercentage($logbook) == 100;
            })->count();
            
            return [
                'total_logbooks' => $totalLogbooks,
                'total_students' => $totalStudents,
                'average_entries_per_student' => $averageEntriesPerStudent,
                'completed_logbooks' => $completedLogbooks,
                'completion_rate' => $totalLogbooks > 0 ? round(($completedLogbooks / $totalLogbooks) * 100, 1) : 0,
                'latest_entry_date' => Logbook::max('tgl_kegiatan'),
                'total_weeks_covered' => Logbook::distinct('mingguKe')->count('mingguKe'),
            ];
        });
    }

    /**
     * Export logbooks
     */
    public function exportLogbooks(Request $request): string
    {
        $registrants = Registration::with(['student', 'logbooks'])
            ->when($request->get('academic_year', 'all') !== 'all', function ($q) use ($request) {
                return $q->where('tahun_akademik', $request->get('academic_year'));
            })
            ->when($request->get('prodi', 'all') !== 'all', function ($q) use ($request) {
                return $q->where('id_prodi', $request->get('prodi'));
            })
            ->get();

        $data = [];
        
        foreach ($registrants as $registrant) {
            foreach ($registrant->logbooks as $logbook) {
                $data[] = [
                    'NIM' => $registrant->nim,
                    'Nama' => $registrant->student?->nama_lengkap ?? 'Unknown',
                    'Program Studi' => $this->getStudyProgramName($registrant->id_prodi),
                    'Tahun Akademik' => $registrant->tahun_akademik,
                    'Minggu' => $logbook->mingguKe,
                    'Tanggal Kegiatan' => $logbook->tgl_kegiatan,
                    'Nama Kegiatan' => $this->stripHtml($logbook->nama_kegiatan ?? ''),
                    'Tujuan Kegiatan' => $this->stripHtml($logbook->tujuan_kegiatan ?? ''),
                    'Catatan' => $this->stripHtml($logbook->catatan ?? ''),
                    'Kesimpulan' => $this->stripHtml($logbook->kesimpulan ?? ''),
                    'Status Kelengkapan' => $this->getCompletionStatus($logbook),
                    'Persentase Kelengkapan' => $this->getCompletionPercentage($logbook) . '%',
                ];
            }
        }

        $filename = 'logbooks_export_' . now()->format('Y_m_d_H_i_s') . '.csv';
        $filepath = 'exports/' . $filename;
        
        // Create CSV content
        $csvContent = '';
        
        // Header
        if (!empty($data)) {
            $csvContent .= implode(',', array_keys($data[0])) . "\n";
        }
        
        // Data rows
        foreach ($data as $row) {
            $csvContent .= implode(',', array_map(function ($value) {
                return '"' . str_replace('"', '""', $value ?? '') . '"';
            }, $row)) . "\n";
        }

        Storage::put($filepath, $csvContent);
        
        return $filepath;
    }

    /**
     * Helper methods
     */
    private function getStudyProgramName($prodiId): string
    {
        return Cache::remember(self::CACHE_PREFIX . "study_program_{$prodiId}", self::CACHE_TTL * 4, function () use ($prodiId) {
            $prodi = DB::table('prodi')
                ->where('id_prodi', $prodiId)
                ->first();

            return $prodi ? $prodi->nama_prodi : 'Program Studi Tidak Dikenal';
        });
    }

    private function determineStatus($registration): string
    {
        if (!empty($registration->nilai)) return 'Completed';
        if (!empty($registration->laporan)) return 'Awaiting Assessment';
        if (!empty($registration->bukti_bayar)) return 'Active';
        return 'Awaiting Payment';
    }

    private function getFilterOptions(): array
    {
        return [
            'academic_years' => $this->getAcademicYears(),
            'prodis' => $this->getProdis(),
            'completion_statuses' => $this->getCompletionStatuses(),
        ];
    }

    private function getAcademicYears(): array
    {
        return Registration::select('tahun_akademik')
            ->distinct()
            ->whereNotNull('tahun_akademik')
            ->orderBy('tahun_akademik', 'desc')
            ->pluck('tahun_akademik')
            ->map(fn($year) => ['value' => $year, 'label' => $year])
            ->prepend(['value' => 'all', 'label' => 'Semua Tahun Akademik'])
            ->toArray();
    }

    private function getProdis(): array
    {
        $prodisInUse = Registration::select('id_prodi')
            ->distinct()
            ->whereNotNull('id_prodi')
            ->pluck('id_prodi');

        return $prodisInUse->map(function ($prodiId) {
            return [
                'value' => $prodiId,
                'label' => $this->getStudyProgramName($prodiId)
            ];
        })->prepend(['value' => 'all', 'label' => 'Semua Program Studi'])
        ->toArray();
    }

    private function getCompletionStatuses(): array
    {
        return [
            ['value' => 'all', 'label' => 'Semua Status'],
            ['value' => 'complete', 'label' => 'Lengkap (100%)'],
            ['value' => 'partial', 'label' => 'Sebagian'],
            ['value' => 'incomplete', 'label' => 'Belum Lengkap'],
        ];
    }
}