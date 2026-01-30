import { useQuery } from '@tanstack/react-query';
import { FileText, FilePlus, FileCheck, Archive } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { documentsApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';

export function DashboardPage() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll({ limit: 100 }),
  });

  const stats = {
    total: data?.total || 0,
    draft: data?.items.filter((d) => d.status === 'DRAFT').length || 0,
    generated: data?.items.filter((d) => d.status === 'GENERATED').length || 0,
    archived: data?.items.filter((d) => d.status === 'ARCHIVED').length || 0,
  };

  return (
    <div className="flex flex-col">
      <Header title={t('dashboard.title')} />
      <div className="p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h3 className="mb-3 text-base font-semibold md:mb-4 md:text-lg">{t('dashboard.stats.title')}</h3>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.stats.total')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.stats.draft')}</CardTitle>
                <FilePlus className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.draft}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.stats.generated')}
                </CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.generated}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.stats.archived')}
                </CardTitle>
                <Archive className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.archived}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.welcome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('dashboard.welcomeText')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
