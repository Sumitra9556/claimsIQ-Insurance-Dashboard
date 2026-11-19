import { useState } from 'react';
import { Menu } from 'lucide-react';
import { api } from './api';
import type { Role } from './types';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClaimsBoardPage } from './pages/ClaimsBoardPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';

type Page = 'dashboard' | 'claims' | 'claim-detail';

function App() {
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <LoginPage
        onLogin={async (email, password) => {
          try {
            const u = await api.login(email, password);
            setUser(u);
            setLoginError(null);
          } catch (e) {
            setLoginError(e instanceof Error ? e.message : 'Sign-in failed.');
          }
        }}
        error={loginError}
      />
    );
  }

  const navigate = (p: 'dashboard' | 'claims') => {
    setPage(p);
    setSelectedClaimId(null);
  };

  const openClaim = (id: string) => {
    setSelectedClaimId(id);
    setPage('claim-detail');
  };

  const titles: Record<Page, string> = {
    dashboard: 'Dashboard',
    claims: 'Claims',
    'claim-detail': 'Claim Detail',
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        page={page === 'claim-detail' ? 'claims' : page}
        onNavigate={navigate}
        role={user.role}
        onRoleChange={(role) => setUser({ ...user, role })}
        userName={user.name}
        onLogout={() => {
          setUser(null);
          setPage('dashboard');
        }}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">{titles[page]}</h1>
          <span className="ml-auto hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700 sm:inline">
            {user.role} view
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'claims' && <ClaimsBoardPage onSelectClaim={openClaim} />}
          {page === 'claim-detail' && selectedClaimId && (
            <ClaimDetailPage claimId={selectedClaimId} role={user.role} onBack={() => navigate('claims')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
