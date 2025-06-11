<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Logbook extends Model
{
    use HasFactory;

    protected $table = 'unit_logbook_mhs';
    protected $primaryKey = 'id';


    protected $casts = [
        'minggu' => 'integer'
    ];

    /**
     * Relationship to registration (many to one)
     * Many logbook entries belong to one registration
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'id_pendaftar', 'id');
    }

    /**
     * Relationship to student through registration
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'nim', 'nim')
                    ->through('registration');
    }

    /**
     * Scope to filter by week
     */
    public function scopeByWeek($query, $week)
    {
        return $query->where('minggu', $week);
    }

    /**
     * Scope to filter by activity date
     */
    public function scopeByActivityDate($query, $date)
    {
        return $query->whereDate('tgl_kegiatan', $date);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $start, $end)
    {
        return $query->whereBetween('tgl_kegiatan', [$start, $end]);
    }

    /**
     * Scope for complete logbooks
     */
    public function scopeComplete($query)
    {
        return $query->whereNotNull('nama_kegiatan')
                    ->whereNotNull('tujuan_kegiatan')
                    ->whereNotNull('catatan')
                    ->whereNotNull('kesimpulan');
    }

    /**
     * Scope for incomplete logbooks
     */
    public function scopeIncomplete($query)
    {
        return $query->where(function($q) {
            $q->whereNull('nama_kegiatan')
              ->orWhereNull('tujuan_kegiatan')
              ->orWhereNull('catatan')
              ->orWhereNull('kesimpulan');
        });
    }

    /**
     * Scope for latest entries
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('tgl_kegiatan', 'desc');
    }

    /**
     * Scope to filter by student (nim)
     */
    public function scopeByStudent($query, $nim)
    {
        return $query->whereHas('registration', function($q) use ($nim) {
            $q->where('nim', $nim);
        });
    }

    /**
     * Scope to filter by registration
     */
    public function scopeByRegistration($query, $registrationId)
    {
        return $query->where('id_pendaftar', $registrationId);
    }

    /**
     * Accessor for completion status
     */
    public function getCompletionStatusAttribute()
    {
        $requiredFields = [
            'nama_kegiatan',
            'tujuan_kegiatan', 
            'catatan',
            'kesimpulan'
        ];

        $filledFields = 0;
        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $filledFields++;
            }
        }

        $percentage = ($filledFields / count($requiredFields)) * 100;

        if ($percentage == 100) {
            return 'Complete';
        } elseif ($percentage >= 75) {
            return 'Nearly Complete';
        } elseif ($percentage >= 50) {
            return 'Partial';
        } else {
            return 'Incomplete';
        }
    }

    /**
     * Accessor for completion percentage
     */
    public function getCompletionPercentageAttribute()
    {
        $requiredFields = [
            'nama_kegiatan',
            'tujuan_kegiatan',
            'catatan', 
            'kesimpulan'
        ];

        $filledFields = 0;
        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $filledFields++;
            }
        }

        return round(($filledFields / count($requiredFields)) * 100);
    }

    /**
     * Accessor for formatted activity date
     */
    public function getFormattedActivityDateAttribute()
    {
        return $this->tgl_kegiatan ? 
            Carbon::parse($this->tgl_kegiatan)->format('d F Y') : 
            '-';
    }

    /**
     * Accessor for week name with format
     */
    public function getWeekNameAttribute()
    {
        return "Week {$this->minggu}";
    }

    /**
     * Accessor for status badge color based on completion
     */
    public function getStatusColorAttribute()
    {
        switch ($this->completion_status) {
            case 'Complete':
                return 'success';
            case 'Nearly Complete':
                return 'warning';
            case 'Partial':
                return 'info';
            case 'Incomplete':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    /**
     * Accessor for activity summary (first 100 chars of activity name)
     */
    public function getActivitySummaryAttribute()
    {
        return $this->nama_kegiatan ? 
            (strlen($this->nama_kegiatan) > 100 ? 
                substr($this->nama_kegiatan, 0, 100) . '...' : 
                $this->nama_kegiatan) : 
            'No activity recorded';
    }

    /**
     * Mutator for activity name (auto capitalize)
     */
    public function setNamaKegiatanAttribute($value)
    {
        $this->attributes['nama_kegiatan'] = ucfirst(trim($value));
    }

    /**
     * Mutator for activity objective (auto capitalize)
     */
    public function setTujuanKegiatanAttribute($value)
    {
        $this->attributes['tujuan_kegiatan'] = ucfirst(trim($value));
    }

    /**
     * Boot method for auto-calculations
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($logbook) {
            if (!$logbook->date_created) {
                $logbook->date_created = now();
            }

            // Auto-calculate week if not set
            if (!$logbook->minggu && $logbook->tgl_kegiatan && $logbook->registration) {
                // Calculate week based on activity start date
                $startDate = $logbook->registration->created_at;
                $currentDate = Carbon::parse($logbook->tgl_kegiatan);
                $weeksDiff = $startDate->diffInWeeks($currentDate) + 1;
                $logbook->minggu = $weeksDiff;
            }
        });
    }
}