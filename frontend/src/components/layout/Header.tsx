import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Search Bar - hidden on mobile for simplicity in this template */}
                <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all w-64">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Arama yap..."
                        className="bg-transparent border-none text-sm ml-2 w-full focus:ring-0 placeholder:text-gray-400 text-gray-900"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2"
                    title="Çıkış Yap"
                >
                    <LogOut className="w-5 h-5" />
                </button>

                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-2 ring-white shadow-sm cursor-pointer"></div>
            </div>
        </header>
    );
};

export default Header;
