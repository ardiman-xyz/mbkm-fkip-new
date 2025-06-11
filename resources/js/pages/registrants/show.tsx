import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    MapPin,
    Phone,
    User,
    Video,
} from 'lucide-react';
import { useState } from 'react';

// Mock data - replace with real data from props
const studentData = {
    id: 1,
    nim: '22113032',
    name: 'Fendi Ferdiansyah',
    study_program: 'Pendidikan Biologi',
    academic_year: '2024/2025',
    semester: 'Ganjil',
    activity_type: 'Magang',
    placement: 'PAUD Aisyiyah 1 Kendari',
    location: 'Kendari',
    phone: '081234567890',
    email: 'fendi.ferdiansyah@student.uho.ac.id',
    status: 'Active',
    payment_status: 'Paid',
    report_status: 'Submitted',
    registered_at: '2025-01-13',
    gender: 'Laki-laki',
    avatar: null,
};

const logbookData = [
    {
        id: 8084,
        week: 15,
        activity_date: '8 Januari 2025',
        activity_name: 'Orientasi dan Pengenalan Lingkungan Kerja',
        activity_objective: 'Memahami struktur organisasi dan tata kerja PAUD',
        notes: 'Mengikuti briefing dari supervisor, berkeliling fasilitas, dan berkenalan dengan staff pengajar',
        conclusion: 'Berhasil memahami lingkungan kerja dan siap memulai kegiatan praktik',
        completion_status: 'Complete',
        completion_percentage: 100,
    },
    {
        id: 8083,
        week: 14,
        activity_date: '7 Januari 2025',
        activity_name: 'Observasi Pembelajaran di Kelas',
        activity_objective: 'Mengamati metode pembelajaran untuk anak usia dini',
        notes: 'Mengamati cara guru berinteraksi dengan anak-anak, metode pengajaran yang digunakan',
        conclusion: 'Pembelajaran menggunakan pendekatan bermain sambil belajar sangat efektif',
        completion_status: 'Complete',
        completion_percentage: 100,
    },
    {
        id: 8082,
        week: 13,
        activity_date: '6 Januari 2025',
        activity_name: 'Membantu Persiapan Materi Pembelajaran',
        activity_objective: 'Menyiapkan alat peraga dan media pembelajaran',
        notes: 'Membuat media pembelajaran sederhana menggunakan kertas warna dan gambar',
        conclusion: 'Media pembelajaran berhasil dibuat dan siap digunakan untuk kegiatan besok',
        completion_status: 'Partial',
        completion_percentage: 75,
    },
];

const reportData = {
    document_url: '/reports/fendi_ferdiansyah_laporan.pdf',
    document_name: 'Laporan Magang PAUD Aisyiyah 1 Kendari.pdf',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_title: 'Presentasi Hasil Magang - Fendi Ferdiansyah',
    submission_date: '2025-01-10',
    status: 'Approved',
};

export default function StudentDetailPage() {
    const [activeTab, setActiveTab] = useState('logbook');

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            Complete: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
            Partial: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            Incomplete: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
        };

        const config = statusConfig[status] || statusConfig['Incomplete'];
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.color} text-xs`}>
                <Icon className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const handleBack = () => {
        // Navigate back to dashboard
        window.history.back();
    };

    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <div className="bg-border h-6 w-px" />
                        <h1 className="text-xl font-semibold">Student Detail</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Left Sidebar - Student Info Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader className="pb-4 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                    {studentData.avatar ? (
                                        <img src={studentData.avatar} alt={studentData.name} className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-white" />
                                    )}
                                </div>
                                <CardTitle className="text-lg">{studentData.name}</CardTitle>
                                <CardDescription className="font-mono text-sm">{studentData.nim}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Program Studi:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">{studentData.study_program}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Penempatan:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">{studentData.placement}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Tahun Akademik:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">
                                        {studentData.academic_year} - {studentData.semester}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Kontak:</span>
                                    </div>
                                    <div className="space-y-1 pl-6">
                                        <p className="text-sm">{studentData.phone}</p>
                                        <p className="text-muted-foreground text-sm">{studentData.email}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                        {studentData.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Tabs */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="logbook" className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Logbook Kegiatan
                                </TabsTrigger>
                                <TabsTrigger value="report" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Laporan & Video
                                </TabsTrigger>
                            </TabsList>

                            {/* Logbook Tab */}
                            <TabsContent value="logbook" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Logbook Kegiatan Magang</h2>
                                        <Badge variant="outline" className="text-xs">
                                            {logbookData.length} Entries
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        {logbookData.map((entry) => (
                                            <Card key={entry.id} className="transition-shadow hover:shadow-sm">
                                                <CardHeader className="pb-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                Week {entry.week} - {entry.activity_date}
                                                            </CardTitle>
                                                            <CardDescription className="mt-1">{entry.activity_name}</CardDescription>
                                                        </div>
                                                        {getStatusBadge(entry.completion_status)}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <h4 className="text-muted-foreground mb-2 text-sm font-medium">Tujuan Kegiatan:</h4>
                                                        <p className="text-sm">{entry.activity_objective}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-muted-foreground mb-2 text-sm font-medium">Catatan Kegiatan:</h4>
                                                        <p className="text-sm">{entry.notes}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-muted-foreground mb-2 text-sm font-medium">Kesimpulan:</h4>
                                                        <p className="text-sm">{entry.conclusion}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between border-t pt-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-muted h-2 w-full max-w-32 rounded-full">
                                                                <div
                                                                    className="bg-primary h-2 rounded-full transition-all"
                                                                    style={{ width: `${entry.completion_percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-muted-foreground text-xs">{entry.completion_percentage}%</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Report Tab */}
                            <TabsContent value="report" className="mt-6">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-4 text-lg font-semibold">Laporan & Dokumentasi</h2>
                                    </div>

                                    {/* Document Report */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Dokumen Laporan
                                            </CardTitle>
                                            <CardDescription>Laporan kegiatan magang yang telah disubmit</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                                                        <FileText className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{reportData.document_name}</p>
                                                        <p className="text-muted-foreground text-xs">Submitted on {reportData.submission_date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                        {reportData.status}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Video Report */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Video className="h-5 w-5" />
                                                Video Presentasi
                                            </CardTitle>
                                            <CardDescription>Video presentasi hasil kegiatan magang</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                                                        <Video className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{reportData.video_title}</p>
                                                        <p className="text-muted-foreground text-xs">YouTube Video</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={reportData.video_url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Watch Video
                                                    </a>
                                                </Button>
                                            </div>

                                            {/* Embedded Video Preview */}
                                            <div className="bg-muted aspect-video overflow-hidden rounded-lg">
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <div className="text-center">
                                                        <Video className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                                                        <p className="text-muted-foreground text-sm">Click "Watch Video" to view on YouTube</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
