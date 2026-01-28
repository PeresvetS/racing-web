import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/context/i18n-context';
import type { Locale } from '@/lib/i18n';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { t, locale, setLocale, locales } = useI18n();

  return (
    <div className="flex flex-col">
      <Header title={t('settings.title')} />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profile.title')}</CardTitle>
            <CardDescription>{t('settings.profile.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t('settings.profile.email')}</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="grid gap-2">
              <Label>{t('settings.profile.name')}</Label>
              <p className="text-sm text-muted-foreground">
                {user?.name || t('settings.profile.notSpecified')}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>{t('settings.profile.role')}</Label>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance.title')}</CardTitle>
            <CardDescription>{t('settings.appearance.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
              >
                {t('settings.appearance.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
              >
                {t('settings.appearance.dark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
              >
                {t('settings.appearance.system')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language.title')}</CardTitle>
            <CardDescription>{t('settings.language.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(Object.keys(locales) as Locale[]).map((loc) => (
                <Button
                  key={loc}
                  variant={locale === loc ? 'default' : 'outline'}
                  onClick={() => setLocale(loc)}
                >
                  {locales[loc]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
