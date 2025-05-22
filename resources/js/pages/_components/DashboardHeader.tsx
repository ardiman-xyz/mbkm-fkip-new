import { Button } from '@/components/ui/button';
import { Download, GraduationCap, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
    isLoading: boolean;
    onRefresh: () => void;
}

export default function DashboardHeader({ isLoading, onRefresh }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <GraduationCap className="text-primary h-8 w-8" />
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard MBKM FKIP</h1>
                </div>
                <p className="text-muted-foreground text-lg">Kelola dan pantau data mahasiswa peserta program Merdeka Belajar Kampus Merdeka</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>
    );
}
