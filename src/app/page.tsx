'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, CheckCircle2, Loader2, Activity, Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import type { ClientStatus, PhoneNumberInfo } from '@/types/whatsapp';

type Stats = {
  totalConversations: number;
  activeConversations: number;
  totalContacts: number;
  contactsWithStatus: number;
  statusBreakdown: Record<ClientStatus, number>;
};

export default function Home() {
  const router = useRouter();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const studyMix = [
    { label: 'Oncogenómico integral', value: 38 },
    { label: 'Panel cáncer de mama', value: 24 },
    { label: 'Cáncer ginecológico', value: 18 },
    { label: 'Cáncer gastrointestinal', value: 14 },
    { label: 'Otros estudios', value: 9 },
  ];
  const totalStudies = studyMix.reduce((sum, item) => sum + item.value, 0);
  const monthlySales = [
    { month: 'Jun', value: 32 },
    { month: 'Jul', value: 36 },
    { month: 'Ago', value: 39 },
    { month: 'Sep', value: 42 },
    { month: 'Oct', value: 46 },
    { month: 'Nov', value: 50 },
  ];
  const maxMonthlySales = Math.max(...monthlySales.map(item => item.value), 1);
  const lineChartPoints = monthlySales
    .map((item, index) => {
      const x = (index / (monthlySales.length - 1)) * 100;
      const y = 100 - (item.value / maxMonthlySales) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const response = await fetch('/api/phone-numbers');
        if (response.ok) {
          const data = await response.json();
          setPhoneNumbers(data);
        }
      } catch (error) {
        console.error('Error cargando números:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, []);

  const adminPhoneNumberId = useMemo(() => {
    const firstWithReal = phoneNumbers.find(phone => phone.realPhoneNumberId);
    if (firstWithReal?.realPhoneNumberId) {
      return firstWithReal.realPhoneNumberId;
    }
    return phoneNumbers[0]?.id;
  }, [phoneNumbers]);

  useEffect(() => {
    if (!adminPhoneNumberId) {
      setStats(null);
      setStatsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await fetch(`/api/stats?phoneNumberId=${adminPhoneNumberId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [adminPhoneNumberId]);

  const AUTH_KEY = 'zogen-authenticated';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);


  const handleSelectNumber = (phone: PhoneNumberInfo) => {
    // Si es un vendedor dummy, usa el realPhoneNumberId, sino usa el id
    const targetId = phone.realPhoneNumberId || phone.id;
    router.push(`/${targetId}`);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setLoginError(null);

    setTimeout(() => {
      if (username === 'zogen' && password === 'zogen123') {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_KEY, 'true');
        }
      } else {
        setLoginError('Credenciales incorrectas, intenta nuevamente.');
      }
      setAuthLoading(false);
    }, 600);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_KEY);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#9B7CB8]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-white p-6">
        <Card className="w-full max-w-md shadow-xl border-purple-100">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <Image src="/images/zogen-logo.png" alt="Zogen" width={160} height={40} className="h-12 w-auto" priority />
              <CardTitle className="text-2xl text-center">Acceso al panel</CardTitle>
              <CardDescription>Ingresa con tu usuario corporativo para continuar</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Usuario</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Escribe tu usuario"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  required
                />
              </div>
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <Button type="submit" className="w-full bg-[#9B7CB8] hover:bg-[#8A6BA7]" disabled={authLoading}>
                {authLoading ? 'Validando...' : 'Entrar'}
              </Button>
              <p className="text-xs text-center text-gray-500">Usuario demo: zogen · Contraseña: zogen123</p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8 pt-10">
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-purple-100">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <Image
                  src="/images/zogen-logo.png"
                  alt="Zogen"
                  width={220}
                  height={60}
                  className="h-14 w-auto"
                  priority
                />
                <div className="flex-1 min-w-[240px]">
                  <p className="text-xs font-semibold tracking-widest text-purple-500 uppercase">Dashboard principal</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Proyecto Agile: Supervisión de vendedores
                  </h1>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            title="Leads capturados"
            value={stats?.totalConversations ?? 0}
            description="Conversaciones gestionadas en el mes"
            icon={<MessageSquare className="h-4 w-4 text-[#9B7CB8]" />}
            loading={statsLoading}
          />
          <ScoreCard
            title="Clientes activos"
            value={stats?.totalContacts ?? 0}
            description="Pacientes con seguimiento"
            icon={<Users className="h-4 w-4 text-[#9B7CB8]" />}
            loading={statsLoading}
          />
          <ScoreCard
            title="Procesos con estado"
            value={stats?.contactsWithStatus ?? 0}
            description="Casos en pipeline"
            icon={<Activity className="h-4 w-4 text-[#9B7CB8]" />}
            loading={statsLoading}
          />
          <ScoreCard
            title="Canales conectados"
            value={phoneNumbers.length}
            description="Bandejas de WhatsApp operativas"
            icon={<Phone className="h-4 w-4 text-[#9B7CB8]" />}
            loading={false}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendedores activos</CardTitle>
              <CardDescription>Selecciona a quién acompañar, monitorea estados y entra a su bandeja.</CardDescription>
            </CardHeader>
            <CardContent>
              {phoneNumbers.length === 0 ? (
                <div className="py-10 text-sm text-gray-500">No hay números conectados actualmente.</div>
              ) : (
                <ScrollArea className="max-h-[320px] pr-4">
                  <div className="space-y-4">
                    {phoneNumbers.map((phone) => (
                      <div
                        key={phone.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-purple-100 bg-white/60 p-4 hover:border-[#9B7CB8] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Phone className="h-6 w-6 text-[#9B7CB8]" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{phone.displayName || 'Vendedor'}</p>
                            <p className="text-sm text-gray-500 font-mono">{phone.phoneNumber}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Última actualización: seguimiento de pacientes prioritarios.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {phone.isConnected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              <CheckCircle2 className="h-3 w-3" /> Conectado
                            </span>
                          )}
                          <Button
                            size="sm"
                            className="bg-[#9B7CB8] hover:bg-[#8A6BA7] text-white"
                            onClick={() => handleSelectNumber(phone)}
                          >
                            Abrir dashboard
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 lg:space-y-4">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Histórico mensual de estudios</CardTitle>
                <CardDescription>Periodo de tiempo: Enero a Noviembre 2025</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-start gap-2 pt-0 pb-2">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-28 text-[#7c3aed] mt-2">
                  <polyline
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="3"
                    points={lineChartPoints}
                  />
                  {monthlySales.map((item, index) => {
                    const x = (index / (monthlySales.length - 1)) * 100;
                    const y = 100 - (item.value / maxMonthlySales) * 100;
                    return (
                      <g key={item.month}>
                        <circle cx={x} cy={y} r={2} fill="#a855f7" stroke="#7c3aed" strokeWidth="0.8" />
                        <text x={x} y={y - 4} textAnchor="middle" fontSize="4" fill="#4c1d95">
                          {item.value}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
                  {monthlySales.map((item) => (
                    <span key={item.month}>{item.month}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Portfolio de estudios</CardTitle>
                <CardDescription>Reporte por categoría de estudios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-1">
                {studyMix.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-purple-100">
                      <div
                        className="h-full rounded-full bg-[#9B7CB8]"
                        style={{ width: `${(item.value / totalStudies) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </section>


      </div>
    </div>
  );
}

function ScoreCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <Card className="border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{loading ? '—' : value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
