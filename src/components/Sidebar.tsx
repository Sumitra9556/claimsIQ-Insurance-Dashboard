import { BarChart3, Kanban, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import type { Role } from '../types';

interface SidebarProps {
  page: 'dashboard' | 'claims';
  onNavigate: (page: 'dashboard' | 'claims') => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  userName: string;
  onLogout: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ page, onNavigate, role, onRoleChange, userName, onLogout, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b1f3a] text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-white">ClaimsIQ</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Claims Operations</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          <SidebarLink
            icon={<BarChart3 className="h-4.5 w-4.5" />}
            label="Dashboard"
            active={page === 'dashboard'}
            onClick={() => {
              onNavigate('dashboard');
              onClose();
            }}
          />
          <SidebarLink
            icon={<Kanban className="h-4.5 w-4.5" />}
            label="Claims"
            active={page === 'claims'}
            onClick={() => {
              onNavigate('claims');
              onClose();
            }}
          />
        </nav>

        <div className="mx-3 mb-3 rounded-xl bg-white/5 p-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">View as role</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#0b1f3a] p-1">
            <RoleButton
              active={role === 'adjuster'}
              onClick={() => onRoleChange('adjuster')}
              icon={<UserCircle2 className="h-3.5 w-3.5" />}
              label="Adjuster"
            />
            <RoleButton
              active={role === 'admin'}
              onClick={() => onRoleChange('admin')}
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Admin"
            />
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {userName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="text-xs capitalize text-slate-400">{role}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RoleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
