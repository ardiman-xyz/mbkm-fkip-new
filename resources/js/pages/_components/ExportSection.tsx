import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface Student {
    id: number;
    nim: string;
    name: string;
    study_program: string;
    academic_year: string;
    semester: string;
    activity_type: string;
    placement: string;
    location: string;
    phone: string;
    status: string;
    gender: string;
    payment_status: string;
    report_status: string;
    registered_at: string;
    score: string | null;
}

interface Statistics {
    total: number;
    male: number;
    female: number;
    partners: number;
}

interface FilterState {
    current_academic_year: string;
    current_semester: string;
    current_prodi: string;
    current_placement: string;
    searchQuery?: string;
}

interface ExportSectionProps {
    students: Student[];
    statistics: Statistics;
    filters: FilterState;
    className?: string;
}

const ExportSection = ({ students, statistics, filters, className }: ExportSectionProps) => {
    const handleExportCSV = () => {
        const csvContent = generateCSV();
        downloadFile(csvContent, 'data-mahasiswa-mbkm.csv', 'text/csv');
    };

    const handlePrint = () => {
        const printContent = generatePrintHTML();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const formatActivityType = (type: string): string => {
        const activityTypes: Record<string, string> = {
            magang: 'Internship/Work Practice',
            penelitian: 'Research',
            pertukaran: 'Student Exchange',
            kewirausahaan: 'Entrepreneurship',
            mengajar: 'Teaching in Schools',
            kkn: 'Thematic Community Service',
        };
        return activityTypes[type] || type;
    };

    const generatePrintHTML = (): string => {
        const currentDate = new Date().toLocaleDateString('id-ID');
        const currentTime = new Date().toLocaleTimeString('id-ID');

        // Filter info
        const filterInfo = [];
        if (filters.current_academic_year !== 'all') {
            filterInfo.push(`Tahun Akademik: ${filters.current_academic_year}`);
        }
        if (filters.current_semester !== 'all') {
            filterInfo.push(`Semester: ${filters.current_semester}`);
        }
        if (filters.current_prodi !== 'all') {
            filterInfo.push(`Program Studi: ${filters.current_prodi}`);
        }
        if (filters.current_placement !== 'all') {
            filterInfo.push(`Penempatan: ${filters.current_placement}`);
        }
        if (filters.searchQuery) {
            filterInfo.push(`Pencarian: "${filters.searchQuery}"`);
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Data Mahasiswa Peserta MBKM</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #333; 
                        font-size: 12px;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #333; 
                        padding-bottom: 20px; 
                    }
                    .header h1 { 
                        margin: 0; 
                        font-size: 20px; 
                        color: #1f2937; 
                        font-weight: bold;
                    }
                    .header h2 { 
                        margin: 5px 0; 
                        font-size: 16px; 
                        color: #6b7280; 
                        font-weight: normal; 
                    }
                    .header h3 { 
                        margin: 5px 0; 
                        font-size: 14px; 
                        color: #6b7280; 
                        font-weight: normal; 
                    }
                    .meta-info { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 20px; 
                        font-size: 11px; 
                        color: #6b7280; 
                    }
                    .filter-info { 
                        background-color: #f3f4f6; 
                        padding: 15px; 
                        border-radius: 8px; 
                        margin-bottom: 20px; 
                    }
                    .filter-info h3 { 
                        margin: 0 0 10px 0; 
                        font-size: 13px; 
                        color: #374151; 
                    }
                    .filter-info p { 
                        margin: 3px 0; 
                        font-size: 11px; 
                        color: #6b7280; 
                    }
                    .statistics { 
                        display: grid; 
                        grid-template-columns: repeat(4, 1fr); 
                        gap: 15px; 
                        margin-bottom: 20px; 
                    }
                    .stat-card { 
                        background-color: #f9fafb; 
                        padding: 15px; 
                        border-radius: 8px; 
                        text-align: center; 
                        border: 1px solid #e5e7eb;
                    }
                    .stat-number { 
                        font-size: 18px; 
                        font-weight: bold; 
                        color: #1f2937; 
                    }
                    .stat-label { 
                        font-size: 11px; 
                        color: #6b7280; 
                        margin-top: 5px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                        font-size: 10px; 
                    }
                    th, td { 
                        border: 1px solid #d1d5db; 
                        padding: 6px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f9fafb; 
                        font-weight: bold; 
                        color: #374151; 
                        font-size: 10px;
                    }
                    tr:nth-child(even) { 
                        background-color: #f9fafb; 
                    }
                    .text-center { 
                        text-align: center; 
                    }
                    .font-mono { 
                        font-family: monospace; 
                    }
                    .summary { 
                        margin-top: 30px; 
                        padding: 15px; 
                        background-color: #f9fafb; 
                        border-radius: 8px; 
                    }
                    .summary h3 { 
                        margin: 0 0 10px 0; 
                        color: #374151; 
                        font-size: 13px;
                    }
                    .summary p { 
                        margin: 5px 0; 
                        font-size: 11px;
                    }
                    .signature { 
                        margin-top: 40px; 
                        text-align: right; 
                    }
                    .signature-box { 
                        display: inline-block; 
                        text-align: center;
                    }
                    .signature-line { 
                        border-bottom: 1px solid #000; 
                        width: 200px; 
                        margin-top: 60px;
                    }
                    @media print { 
                        body { margin: 0; font-size: 10px; } 
                        .header { border-bottom: 2px solid #000; } 
                        .page-break { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LAPORAN DATA MAHASISWA PESERTA MBKM</h1>
                    <h2>FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN</h2>
                    <h3>UNIVERSITAS HALU OLEO</h3>
                </div>

                <div class="meta-info">
                    <div>Tanggal Cetak: ${currentDate}</div>
                    <div>Waktu Cetak: ${currentTime}</div>
                    <div>Total Data: ${students.length} mahasiswa</div>
                </div>

                ${
                    filterInfo.length > 0
                        ? `
                <div class="filter-info">
                    <h3>Filter yang Diterapkan:</h3>
                    ${filterInfo.map((info) => `<p>• ${info}</p>`).join('')}
                </div>
                `
                        : ''
                }

                <div class="statistics">
                    <div class="stat-card">
                        <div class="stat-number">${statistics.total}</div>
                        <div class="stat-label">Total Mahasiswa</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #3b82f6;">${statistics.male}</div>
                        <div class="stat-label">Laki-laki</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #ec4899;">${statistics.female}</div>
                        <div class="stat-label">Perempuan</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #10b981;">${statistics.partners}</div>
                        <div class="stat-label">Mitra</div>
                    </div>
                </div>

               

                <table>
                    <thead>
                        <tr>
                            <th style="width: 25px;">No</th>
                            <th style="width: 80px;">NIM</th>
                            <th style="width: 120px;">Nama</th>
                            <th style="width: 100px;">Program Studi</th>
                            <th style="width: 25px;">L/P</th>
                            <th style="width: 60px;">Tahun Akademik</th>
                            <th style="width: 80px;">Jenis Kegiatan</th>
                            <th style="width: 120px;">Penempatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students
                            .map(
                                (student, index) => `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td class="font-mono">${student.nim}</td>
                                <td>${student.name}</td>
                                <td>${student.study_program}</td>
                                <td class="text-center">${student.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                                <td class="text-center">${student.academic_year}<br><small>${student.semester}</small></td>
                                <td>${formatActivityType(student.activity_type)}</td>
                                <td>${student.placement}</td>
                            </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>


            
            </body>
            </html>
        `;
    };

    const generateCSV = (): string => {
        const headers = [
            'No',
            'NIM',
            'Nama Mahasiswa',
            'Program Studi',
            'Jenis Kelamin',
            'Tahun Akademik',
            'Semester',
            'Jenis Kegiatan',
            'Penempatan',
            'Lokasi',
            'No. Telepon',
            'Tanggal Daftar',
        ];
        const csvRows = [headers.join(',')];

        students.forEach((student, index) => {
            const row = [
                index + 1,
                `"${student.nim}"`,
                `"${student.name}"`,
                `"${student.study_program}"`,
                `"${student.gender}"`,
                `"${student.academic_year}"`,
                `"${student.semester}"`,
                `"${formatActivityType(student.activity_type)}"`,
                `"${student.placement}"`,
                `"${student.location}"`,
                `"${student.phone}"`,
                `"${student.registered_at}"`,
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    };

    const downloadFile = (content: string, filename: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <FileText className="h-4 w-4" />
                Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
            </Button>
        </div>
    );
};

export default ExportSection;
