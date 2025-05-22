import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import ReusablePagination from './ReusablePagination';

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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Program Studi</TableHead>
                                <TableHead>Jenis Kelamin</TableHead>
                                <TableHead>Tahun Akademik & Semester</TableHead>
                                <TableHead>Penempatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-muted-foreground font-mono text-xs">{student.nim}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{student.study_program}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getGenderBadge(getGender(student))} text-xs`}>
                                                {getGender(student)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{student.academic_year}</div>
                                            <div className="text-muted-foreground text-xs">Semester {student.semester}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-64 text-sm break-words">{student.placement}</div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Users className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                            <h3 className="mb-2 text-lg font-medium">Tidak ada data ditemukan</h3>
                                            <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination - SELALU tampilkan untuk testing */}
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
