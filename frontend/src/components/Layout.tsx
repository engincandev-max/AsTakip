import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const Layout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Müşteriler' },
        { path: '/customers/new', label: 'Yeni Müşteri' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-md mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="font-bold text-xl text-indigo-600 tracking-tight">
                            AsTakip
                        </Link>
                        <div className="flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        location.pathname === item.path
                                            ? 'text-indigo-600 bg-indigo-50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-md mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
