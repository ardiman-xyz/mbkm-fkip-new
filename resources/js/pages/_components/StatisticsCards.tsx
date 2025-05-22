import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle2, Users } from 'lucide-react';

interface Statistics {
    total: number;
    male: number;
    female: number;
    partners: number;
}

interface StatisticsCardsProps {
    statistics: Statistics;
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Total Pendaftar */}
            <Card className="transition-shadow duration-200 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statistics.total.toLocaleString()}</div>
                    <p className="text-muted-foreground text-xs">Mahasiswa yang mendaftar MBKM</p>
                </CardContent>
            </Card>

            {/* Jenis Kelamin */}
            <Card className="transition-shadow duration-200 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Berdasarkan Jenis Kelamin</CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Laki-laki</span>
                            <span className="text-sm font-medium">{statistics.male}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Perempuan</span>
                            <span className="text-sm font-medium">{statistics.female}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                        <div className="h-2 flex-1 rounded-full bg-blue-50">
                            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${(statistics.male / statistics.total) * 50}%` }}></div>
                        </div>
                        <div className="h-2 flex-1 rounded-full bg-pink-50">
                            <div className="h-2 rounded-full bg-pink-600" style={{ width: `${(statistics.female / statistics.total) * 100}%` }}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Mitra */}
            <Card className="transition-shadow duration-200 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Mitra</CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statistics.partners}</div>
                    <p className="text-muted-foreground text-xs">Instansi/perusahaan mitra</p>
                    <div className="flex items-center pt-1">
                        <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-green-600">Aktif bekerjasama</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
