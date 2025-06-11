import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertCircle, Download, Edit3, Eye, FileText, MessageSquare, MoreVertical, Printer, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';

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

interface StudentActionsProps {
    student: Student;
    onView?: (student: Student) => void;
    onEdit?: (student: Student) => void;
    onDelete?: (student: Student) => void;
    onPrint?: (student: Student) => void;
    onDownload?: (student: Student) => void;
    onViewReport?: (student: Student) => void;
    onSendMessage?: (student: Student) => void;
    onApprove?: (student: Student) => void;
}

export default function StudentActionsDropdown({
    student,
    onView,
    onEdit,
    onDelete,
    onPrint,
    onDownload,
    onViewReport,
    onSendMessage,
    onApprove,
}: StudentActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(student);
        }
        setShowDeleteDialog(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:bg-muted h-8 w-8 p-0" aria-label={`Actions for ${student.name}`}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* View Details */}
                    <DropdownMenuItem onClick={() => onView?.(student)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>

                    {/* Edit Student */}
                    <DropdownMenuItem onClick={() => onEdit?.(student)} className="cursor-pointer">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Student
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* View Report */}
                    <DropdownMenuItem
                        onClick={() => onViewReport?.(student)}
                        className="cursor-pointer"
                        disabled={student.report_status === 'Not Submitted'}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        View Report
                    </DropdownMenuItem>

                    {/* Approve/Validate */}
                    {student.status === 'Awaiting Assessment' && (
                        <DropdownMenuItem onClick={() => onApprove?.(student)} className="cursor-pointer text-green-600">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Approve Student
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Print */}
                    <DropdownMenuItem onClick={() => onPrint?.(student)} className="cursor-pointer">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Details
                    </DropdownMenuItem>

                    {/* Download */}
                    <DropdownMenuItem onClick={() => onDownload?.(student)} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        Download Data
                    </DropdownMenuItem>

                    {/* Send Message */}
                    <DropdownMenuItem onClick={() => onSendMessage?.(student)} className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Delete - Dangerous Action */}
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Student
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Confirm Delete
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{student.name}</strong> ({student.nim})? This action cannot be undone and will
                            permanently remove all associated data including logbooks and reports.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                            Delete Student
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
