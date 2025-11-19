'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const AUTH_KEY = 'zogen-authenticated';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Verificar si ya está autenticado
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      router.push('/dashboard/ventas/crm-zogen/solicitudes');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setLoginError(null);

    setTimeout(() => {
      if (username === 'zogen' && password === 'zogen123') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_KEY, 'true');
        }
        router.push('/dashboard/ventas/crm-zogen/solicitudes');
      } else {
        setLoginError('Credenciales incorrectas, intenta nuevamente.');
        setAuthLoading(false);
      }
    }, 600);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#9B7CB8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-white p-6">
      <Card className="w-full max-w-md shadow-xl border-purple-100">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/images/zogen-logo.png"
              alt="Zogen"
              width={160}
              height={40}
              className="h-12 w-auto"
              priority
            />
            <CardTitle className="text-2xl text-center">Acceso a Zogen Platform</CardTitle>
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
            <Button
              type="submit"
              className="w-full bg-[#9B7CB8] hover:bg-[#8A6BA7]"
              disabled={authLoading}
            >
              {authLoading ? 'Validando...' : 'Entrar'}
            </Button>
            <p className="text-xs text-center text-gray-500">
              Usuario demo: <span className="font-semibold">zogen</span> · Contraseña: <span className="font-semibold">zogen123</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
