import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    className?: string;
    onLinkClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onLinkClick }) => {
    const { logout, username } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Müşteriler', icon: Users },
        { path: '/customers/new', label: 'Yeni Müşteri', icon: PlusCircle },
        { path: '/settings', label: 'Ayarlar', icon: Settings },
    ];

    return (
        <aside className={clsx("fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col", className)}>
            <div className="flex items-center h-16 px-6 border-b border-gray-100 shrink-0">
                <LayoutDashboard className="w-6 h-6 text-indigo-600 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    AsTakip
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                                isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 shrink-0 space-y-3">
                {username && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-indigo-700 truncate">{username}</span>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
