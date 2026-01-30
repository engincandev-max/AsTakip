import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { customerService } from "../services/api";
import type { Customer } from "../types";
import clsx from "clsx";
import { Search, Plus, Phone, MapPin, Building, Map as MapIcon, List } from "lucide-react";
import MapComponent from "../components/MapComponent";
import { useNavigate } from "react-router-dom";

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const navigate = useNavigate();

    useEffect(() => {
        void loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data ?? []);
        } catch (error) {
            console.error("Failed to load customers:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return customers;

        return customers.filter((c) => {
            const name = (c.name ?? "").toLowerCase();
            const phone = c.phoneNumber ?? "";
            return name.includes(q) || phone.includes(searchTerm.trim());
        });
    }, [customers, searchTerm]);

    const mapMarkers = useMemo(() => {
        return filteredCustomers
            .filter(c => c.latitude && c.longitude)
            .map(c => ({
                lat: c.latitude!,
                lng: c.longitude!,
                title: c.name,
                id: c.id
            }));
    }, [filteredCustomers]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Müşteriler</h1>
                    <p className="text-gray-500 mt-1">Müşteri listesi ve detaylarını yönetin</p>
                </div>

                <Link
                    to="/customers/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Müşteri
                </Link>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="İsim veya telefon ile ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-500 text-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                            "p-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-medium",
                            viewMode === 'list'
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <List className="w-5 h-5" />
                        Liste
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={clsx(
                            "p-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-medium",
                            viewMode === 'map'
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <MapIcon className="w-5 h-5" />
                        Harita
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white h-48 rounded-2xl border border-gray-200" />
                    ))}
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Kayıt Bulunamadı</h3>
                    <p className="text-gray-500 mt-1 text-sm">Aradığınız kriterlere uygun müşteri yok.</p>
                </div>
            ) : viewMode === 'map' ? (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <MapComponent
                        readOnly
                        markers={mapMarkers}
                        onMarkerClick={(id) => navigate(`/customers/${id}`)}
                    />
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Toplam {mapMarkers.length} müşteri haritada gösteriliyor. Detay için pinlere tıklayabilirsiniz.
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <Link
                            key={customer.id}
                            to={`/customers/${customer.id}`}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-50">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <span
                                    className={clsx(
                                        "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                                        customer.stage
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            : "bg-gray-50 text-gray-600 border border-gray-100"
                                    )}
                                >
                                    {customer.stage || "Taslak"}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors mb-2">
                                {customer.name}
                            </h3>

                            <div className="space-y-2 mt-auto text-sm text-gray-500">
                                {customer.phoneNumber && (
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{customer.phoneNumber}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-2.5">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="line-clamp-1">{customer.address}</span>
                                    </div>
                                )}
                                {customer.constructionType && (
                                    <div className="flex items-center gap-2.5">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        <span>{customer.constructionType}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-400">
                                <span>Kayıt: {new Date(customer.createdAt).toLocaleDateString()}</span>
                                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">
                                    Detaylar &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerList;
