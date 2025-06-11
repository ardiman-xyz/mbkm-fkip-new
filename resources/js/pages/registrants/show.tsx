import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    TrendingUp,
    User,
    Video,
} from 'lucide-react';
import { useState } from 'react';

interface Registrant {
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
    email: string;
    status: string;
    payment_status: string;
    report_status: string;
    registered_at: string;
    score: string | null;
    gender: string;
    payment_proof_url: string | null;
    report_document: string | null;
    video_url: string | null;
    created_at: string;
    updated_at: string;
}

interface Logbook {
    id: number;
    week: number | null;
    activity_date: string;
    activity_date_formatted: string;
    activity_name: string;
    activity_objective: string;
    notes: string;
    conclusion: string;
    completion_status: string;
    completion_percentage: number;
    created_at: string;
}

interface LogbookStatistics {
    total_logbooks: number;
    completed_logbooks: number;
    partial_logbooks: number;
    incomplete_logbooks: number;
    average_completion: number;
    total_weeks: number;
    last_activity_date: string | null;
}

interface ShowPageProps {
    data: {
        registrant: Registrant;
        logbooks: Logbook[];
        statistics: LogbookStatistics;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Student Detail',
        href: '#',
    },
];

export default function RegistrantShowPage({ data }: ShowPageProps) {
    const { registrant, logbooks, statistics } = data;
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
            Complete: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
            'Nearly Complete': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
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

    const getStudentStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
            active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
            completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Award },
            awaiting_assessment: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            pending_payment: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
        };

        const config = statusConfig[status] || statusConfig['pending_payment'];
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.color}`}>
                <Icon className="mr-2 h-4 w-4" />
                {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
        );
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

    // Strip HTML tags from content
    const stripHtml = (html: string): string => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail - ${registrant.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Student Detail</h1>
                            <p className="text-muted-foreground">Detailed information and activity logs</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">{getStudentStatusBadge(registrant.status)}</div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Left Sidebar - Student Info Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader className="pb-4 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                    <User className="h-10 w-10 text-white" />
                                </div>
                                <CardTitle className="text-lg">{registrant.name}</CardTitle>
                                <CardDescription className="font-mono text-sm">{registrant.nim}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Program Studi:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">{registrant.study_program}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Activity className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Jenis Kegiatan:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">{formatActivityType(registrant.activity_type)}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Penempatan:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">{registrant.placement}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Tahun Akademik:</span>
                                    </div>
                                    <p className="pl-6 text-sm font-medium">
                                        {registrant.academic_year} - {registrant.semester}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Kontak:</span>
                                    </div>
                                    <div className="space-y-1 pl-6">
                                        <p className="text-sm">{registrant.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground">Email:</span>
                                    </div>
                                    <p className="text-muted-foreground pl-6 text-sm">{registrant.email}</p>
                                </div>

                                {registrant.score && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Award className="text-muted-foreground h-4 w-4" />
                                            <span className="text-muted-foreground">Nilai:</span>
                                        </div>
                                        <p className="pl-6 text-lg font-bold text-green-600">{registrant.score}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Tabs */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview" className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="logbook" className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Logbook Kegiatan
                                </TabsTrigger>
                                <TabsTrigger value="report" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Laporan & Video
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-6">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Total Logbook</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{statistics.total_logbooks}</div>
                                                <p className="text-muted-foreground text-xs">{statistics.total_weeks} weeks covered</p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Completed Entries</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-green-600">{statistics.completed_logbooks}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {statistics.total_logbooks > 0
                                                        ? Math.round((statistics.completed_logbooks / statistics.total_logbooks) * 100)
                                                        : 0}
                                                    % completion rate
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{Math.round(statistics.average_completion)}%</div>
                                                <Progress value={statistics.average_completion} className="mt-2" />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Activity Progress Summary</CardTitle>
                                            <CardDescription>Overview of logbook completion status</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-green-600">{statistics.completed_logbooks}</div>
                                                    <div className="text-muted-foreground text-sm">Complete</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-yellow-600">{statistics.partial_logbooks}</div>
                                                    <div className="text-muted-foreground text-sm">Partial</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-red-600">{statistics.incomplete_logbooks}</div>
                                                    <div className="text-muted-foreground text-sm">Incomplete</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold">{statistics.total_logbooks}</div>
                                                    <div className="text-muted-foreground text-sm">Total</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Logbook Tab */}
                            <TabsContent value="logbook" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Logbook Kegiatan Magang</h2>
                                        <Badge variant="outline" className="text-xs">
                                            {logbooks.length} Entries
                                        </Badge>
                                    </div>

                                    {logbooks.length === 0 ? (
                                        <Card>
                                            <CardContent className="py-8 text-center">
                                                <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                                <h3 className="text-muted-foreground mb-2 text-lg font-medium">No Logbook Entries</h3>
                                                <p className="text-muted-foreground text-sm">Student hasn't created any logbook entries yet.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {logbooks.map((entry, index) => (
                                                <Card key={entry.id} className="transition-shadow hover:shadow-sm">
                                                    <CardHeader className="pb-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <CardTitle className="text-base">
                                                                    Entry #{index + 1} - {entry.activity_date_formatted}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1">
                                                                    {entry.activity_name
                                                                        ? stripHtml(entry.activity_name).substring(0, 100) + '...'
                                                                        : 'No activity name'}
                                                                </CardDescription>
                                                            </div>
                                                            {getStatusBadge(entry.completion_status)}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {entry.activity_objective && (
                                                            <div>
                                                                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Tujuan Kegiatan:</h4>
                                                                <div
                                                                    className="text-sm"
                                                                    dangerouslySetInnerHTML={{ __html: entry.activity_objective }}
                                                                />
                                                            </div>
                                                        )}

                                                        {entry.activity_name && (
                                                            <div>
                                                                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Nama Kegiatan:</h4>
                                                                <div className="text-sm" dangerouslySetInnerHTML={{ __html: entry.activity_name }} />
                                                            </div>
                                                        )}

                                                        {entry.notes && (
                                                            <div>
                                                                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Catatan Kegiatan:</h4>
                                                                <div className="text-sm" dangerouslySetInnerHTML={{ __html: entry.notes }} />
                                                            </div>
                                                        )}

                                                        {entry.conclusion && (
                                                            <div>
                                                                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Kesimpulan:</h4>
                                                                <div className="text-sm" dangerouslySetInnerHTML={{ __html: entry.conclusion }} />
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between border-t pt-2">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={entry.completion_percentage} className="w-32" />
                                                                <span className="text-muted-foreground text-xs">
                                                                    {Math.round(entry.completion_percentage)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
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
                                            {registrant.report_document ? (
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                                                            <FileText className="h-5 w-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                Laporan Kegiatan {formatActivityType(registrant.activity_type)}
                                                            </p>
                                                            <p className="text-muted-foreground text-xs">Submitted on {registrant.updated_at}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                            {registrant.report_status}
                                                        </Badge>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={registrant.report_document} target="_blank" rel="noopener noreferrer">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed p-8 text-center">
                                                    <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                                    <h3 className="text-muted-foreground mb-2 text-lg font-medium">No Report Submitted</h3>
                                                    <p className="text-muted-foreground text-sm">Student hasn't submitted their report yet.</p>
                                                </div>
                                            )}
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
                                            {registrant.video_url ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                                                                <Video className="h-5 w-5 text-red-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    Presentasi Hasil {formatActivityType(registrant.activity_type)}
                                                                </p>
                                                                <p className="text-muted-foreground text-xs">Video Dokumentasi</p>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={registrant.video_url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Watch Video
                                                            </a>
                                                        </Button>
                                                    </div>

                                                    {/* Video Preview - if it's YouTube */}
                                                    {registrant.video_url.includes('youtube.com') || registrant.video_url.includes('youtu.be') ? (
                                                        <div className="aspect-video overflow-hidden rounded-lg">
                                                            <iframe
                                                                src={registrant.video_url.replace('watch?v=', 'embed/')}
                                                                className="h-full w-full"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-muted aspect-video overflow-hidden rounded-lg">
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <div className="text-center">
                                                                    <Video className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                                                                    <p className="text-muted-foreground text-sm">Click "Watch Video" to view</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed p-8 text-center">
                                                    <Video className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                                    <h3 className="text-muted-foreground mb-2 text-lg font-medium">No Video Submitted</h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        Student hasn't submitted their presentation video yet.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Payment Proof */}
                                    {registrant.payment_proof_url && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    Bukti Pembayaran
                                                </CardTitle>
                                                <CardDescription>Bukti pembayaran yang telah disubmit</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Bukti Pembayaran</p>
                                                            <p className="text-muted-foreground text-xs">Status: {registrant.payment_status}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <a href={registrant.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            View
                                                        </a>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
