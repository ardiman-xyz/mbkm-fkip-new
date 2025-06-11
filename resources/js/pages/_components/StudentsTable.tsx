import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Users } from 'lucide-react';
import ReusablePagination from './ReusablePagination';
import StudentActionsDropdown from './StudentActionsDropdown';

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
    payment_status: string;
    report_status: string;
    registered_at: string;
    score: string | null;
    gender?: string;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface StudentsTableProps {
    students: Student[];
    pagination: PaginationData;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

export default function StudentsTable({ students, pagination, onPageChange, onPerPageChange }: StudentsTableProps) {
    const getGender = (student: Student) => {
        return student.gender || (student.id % 2 === 0 ? 'Perempuan' : 'Laki-laki');
    };

    const getGenderBadge = (gender: string) => {
        return gender === 'Laki-laki'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
            : 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300';
    };

    // Action handlers
    const handleView = (student: Student) => {
        return router.get(route('registrants.show', student.id));
    };

    const handleEdit = (student: Student) => {
        alert(`Edit ${student.name}`);
        console.log('Edit student:', student);
    };

    const handleDelete = (student: Student) => {
        alert(`Delete ${student.name}`);
        console.log('Delete student:', student);
    };

    const handlePrint = (student: Student) => {
        alert(`Print details for ${student.name}`);
        window.print();
        console.log('Print student:', student);
    };

    const handleDownload = (student: Student) => {
        alert(`Download data for ${student.name}`);
        console.log('Download student data:', student);
    };

    const handleViewReport = (student: Student) => {
        if (student.report_status === 'Not Submitted') {
            alert(`${student.name} hasn't submitted a report yet`);
            return;
        }
        alert(`View report for ${student.name}`);
        console.log('View report:', student);
    };

    const handleSendMessage = (student: Student) => {
        alert(`Send message to ${student.name}`);
        console.log('Send message to:', student);
    };

    const handleApprove = (student: Student) => {
        alert(`Approve ${student.name}`);
        console.log('Approve student:', student);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Data Mahasiswa Peserta MBKM
                        </CardTitle>
                        <CardDescription>
                            Menampilkan {pagination?.from?.toLocaleString() || 0} - {pagination?.to?.toLocaleString() || 0} dari{' '}
                            {pagination?.total?.toLocaleString() || 0} mahasiswa
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-4 text-left font-medium">Nama</th>
                                    <th className="p-4 text-left font-medium">Program Studi</th>
                                    <th className="p-4 text-left font-medium">Jenis Kelamin</th>
                                    <th className="p-4 text-left font-medium">Tahun Akademik & Semester</th>
                                    <th className="p-4 text-left font-medium">Penempatan</th>
                                    <th className="w-12 p-4 text-center font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-muted/50 border-b">
                                            <td className="p-4">
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-muted-foreground font-mono text-xs">{student.nim}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">{student.study_program}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className={`${getGenderBadge(getGender(student))} text-xs`}>
                                                    {getGender(student)}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium">{student.academic_year}</div>
                                                <div className="text-muted-foreground text-xs">Semester {student.semester}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="max-w-64 text-sm break-words">{student.placement}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <StudentActionsDropdown
                                                    student={student}
                                                    onView={handleView}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onPrint={handlePrint}
                                                    onDownload={handleDownload}
                                                    onViewReport={handleViewReport}
                                                    onSendMessage={handleSendMessage}
                                                    onApprove={handleApprove}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="h-24 p-8 text-center">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Users className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                                <h3 className="mb-2 text-lg font-medium">Tidak ada data ditemukan</h3>
                                                <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="border-t pt-4">
                    {pagination ? (
                        <ReusablePagination
                            paginationData={pagination}
                            onPageChange={onPageChange}
                            onPerPageChange={onPerPageChange}
                            showPerPageSelector={true}
                            showInfo={true}
                            className=""
                        />
                    ) : (
                        <div className="p-4 text-center text-red-500">Pagination data tidak tersedia</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
