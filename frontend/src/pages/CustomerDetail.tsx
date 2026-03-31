import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { customerService, visitService, attachmentService } from '../services/api';
import type { Customer, CreateVisitDto, Attachment, LocationPin } from '../types';
import MapComponent from '../components/MapComponent';
import { Trash2, Upload, Loader2, FileText, MapPin } from 'lucide-react';

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    
    // Inline phone adding state
    const [isAddingPhone, setIsAddingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');

    // Named locations state
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

    const handleAddPhone = async () => {
        if (!newPhone.trim() || !customer) return;
        try {
            const updatedPhones = [...(customer.additionalPhones || []), newPhone.trim()];
            await customerService.update(customer.id, { additionalPhones: updatedPhones });
            setCustomer({ ...customer, additionalPhones: updatedPhones });
            setNewPhone('');
            setIsAddingPhone(false);
        } catch (error) {
            console.error('Failed to add phone:', error);
            alert('Telefon eklenemedi.');
        }
    };
    
    const handleDeletePhone = async (indexToDelete: number) => {
        if (!customer || !window.confirm('Bu numarayı silmek istediğinize emin misiniz?')) return;
        try {
            const updatedPhones = customer.additionalPhones!.filter((_, idx) => idx !== indexToDelete);
            await customerService.update(customer.id, { additionalPhones: updatedPhones });
            setCustomer({ ...customer, additionalPhones: updatedPhones });
        } catch (error) {
            console.error('Failed to delete phone:', error);
            alert('Telefon silinemedi.');
        }
    };

    const handleAddLocation = async () => {
        if (!newLocationName.trim() || !newLocationCoords || !customer) return;
        try {
            const newPin: LocationPin = { name: newLocationName.trim(), ...newLocationCoords };
            const updatedLocations = [...(customer.locations || []), newPin];
            await customerService.update(customer.id, { locations: updatedLocations });
            setCustomer({ ...customer, locations: updatedLocations });
            setIsAddingLocation(false);
            setNewLocationName('');
            setNewLocationCoords(null);
        } catch (error) {
            console.error('Failed to add location:', error);
            alert('Konum eklenemedi.');
        }
    };

    const handleDeleteLocation = async (indexToDelete: number) => {
        if (!customer || !window.confirm('Bu konumu silmek istediğinize emin misiniz?')) return;
        try {
            const updatedLocations = customer.locations!.filter((_, idx) => idx !== indexToDelete);
            await customerService.update(customer.id, { locations: updatedLocations });
            setCustomer({ ...customer, locations: updatedLocations });
        } catch (error) {
            console.error('Failed to delete location:', error);
            alert('Konum silinemedi.');
        }
    };

    useEffect(() => {
        if (id) loadCustomer(id);
    }, [id]);

    const loadCustomer = async (customerId: string) => {
        try {
            const data = await customerService.getOne(customerId);
            setCustomer(data);
        } catch (error) {
            console.error('Failed to load customer:', error);
            alert('Müşteri bulunamadı.');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
            try {
                if (customer?.id) await customerService.delete(customer.id);
                navigate('/');
            } catch (error) {
                console.error('Failed to delete customer:', error);
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        try {
            setUploading(true);
            await attachmentService.upload(id, file);
            await loadCustomer(id); // Reload to show new file
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Dosya yüklenemedi.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
            try {
                await attachmentService.delete(attachmentId);
                if (id) await loadCustomer(id);
            } catch (error) {
                console.error('Failed to delete attachment:', error);
                alert('Dosya silinemedi.');
            }
        }
    };

    const handleViewAttachment = async (attachment: Attachment) => {
        try {
            const blob = await attachmentService.getBlob(attachment.id);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            // Optional: clean up URL after some time
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('Failed to view attachment:', error);
            alert('Dosya görüntülenemedi.');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Yükleniyor...</div>;
    if (!customer) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                    <div className="flex flex-col gap-1 mt-1">
                        <p className="text-gray-600 font-medium flex items-center gap-2">
                            <span>📞 {customer.phoneNumber}</span> 
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Ana Telefon</span>
                        </p>
                        
                        {customer.additionalPhones?.map((phone, idx) => (
                            <div key={idx} className="flex items-center gap-2 group ml-1">
                                <p className="text-gray-500 text-sm">📞 {phone}</p>
                                <button onClick={() => handleDeletePhone(idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1" title="Sil">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {isAddingPhone ? (
                            <div className="flex items-center gap-2 mt-2 ml-1">
                                <input 
                                    type="text" 
                                    value={newPhone} 
                                    onChange={(e) => setNewPhone(e.target.value)} 
                                    placeholder="05XX XXX XX XX"
                                    className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    autoFocus
                                />
                                <button onClick={handleAddPhone} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 font-bold transition-colors">Kaydet</button>
                                <button onClick={() => { setIsAddingPhone(false); setNewPhone(''); }} className="text-xs bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 font-bold transition-colors">İptal</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingPhone(true)} className="w-fit mt-1 ml-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md transition-colors">
                                + Ek Telefon Ekle
                            </button>
                        )}
                    </div>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => setIsVisitModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        + Ziyaret Ekle
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        Sil
                    </button>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Details & Documents */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900 border-b border-gray-50 pb-2">Bilgiler</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500 mb-1">İnşaat Türü</span>
                                <span className="font-medium text-gray-900">{customer.constructionType || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">Aşama</span>
                                <span className={clsx("font-medium", customer.stage ? "text-indigo-600" : "text-gray-900")}>
                                    {customer.stage || '-'}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-gray-500 mb-1">Adres</span>
                                <span className="text-gray-900">{customer.address || '-'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-gray-500 mb-1">Açıklama</span>
                                <p className="text-gray-900">{customer.description || '-'}</p>
                            </div>
                            {customer.createdByUsername && (
                                <div className="col-span-2 pt-2 border-t border-gray-50 flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">Kaydeden:</span>
                                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                                        👤 {customer.createdByUsername}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-4">
                            <h2 className="font-semibold text-gray-900">Belgeler (PDF, vb.)</h2>
                            <label className="cursor-pointer bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                Dosya Yükle
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="space-y-3">
                            {customer.attachments && customer.attachments.length > 0 ? (
                                customer.attachments.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                                                    {file.originalName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewAttachment(file)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
                                            >
                                                Görüntüle
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAttachment(file.id)}
                                                className="text-gray-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-400 italic text-center py-4">Henüz belge yüklenmemiş.</div>
                            )}
                        </div>
                    </div>

                    {/* Visits Timeline */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="font-semibold text-gray-900 border-b border-gray-50 pb-2 mb-4">Ziyaret Geçmişi</h2>
                        <div className="space-y-6 relative border-l-2 border-gray-100 ml-3 pl-6 py-2">
                            {customer.visits && customer.visits.length > 0 ? (
                                customer.visits.map((visit) => (
                                    <div key={visit.id} className="relative">
                                        <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-indigo-100 border-2 border-indigo-600"></span>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-semibold text-indigo-600">
                                                    {new Date(visit.date).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{visit.note || 'Not girilmemiş.'}</p>
                                            {visit.latitude && visit.longitude && (
                                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    Konum İşaretli
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-400 italic">Henüz ziyaret kaydı yok.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Map + Locations */}
                <div className="space-y-6">
                    <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm h-fit">
                        <MapComponent
                            readOnly
                            initialLocation={customer.latitude && customer.longitude ? { lat: customer.latitude, lng: customer.longitude } : undefined}
                        />
                        <div className="p-3">
                            <p className="text-xs text-center text-gray-400">Yol tarifi için haritadaki işarete tıklayınız</p>
                        </div>
                    </div>

                    {/* Named Locations Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> Konumlar</h2>
                            {!isAddingLocation && (
                                <button onClick={() => setIsAddingLocation(true)} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium transition-colors">
                                    + Konum Ekle
                                </button>
                            )}
                        </div>

                        {isAddingLocation && (
                            <div className="mb-4 space-y-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                <input
                                    type="text"
                                    value={newLocationName}
                                    onChange={(e) => setNewLocationName(e.target.value)}
                                    placeholder="Konum adı (örn: Şantiye Girişi)"
                                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500">Haritaya tıklayarak konum seçin:</p>
                                <MapComponent
                                    onLocationSelect={(lat, lng) => setNewLocationCoords({ lat, lng })}
                                    initialLocation={newLocationCoords || undefined}
                                />
                                {newLocationCoords && (
                                    <p className="text-xs text-emerald-600 font-medium">✓ Konum seçildi: {newLocationCoords.lat.toFixed(5)}, {newLocationCoords.lng.toFixed(5)}</p>
                                )}
                                <div className="flex gap-2">
                                    <button onClick={handleAddLocation} disabled={!newLocationName.trim() || !newLocationCoords} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors">Kaydet</button>
                                    <button onClick={() => { setIsAddingLocation(false); setNewLocationName(''); setNewLocationCoords(null); }} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium transition-colors">İptal</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {customer.locations && customer.locations.length > 0 ? (
                                customer.locations.map((loc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg group">
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                                                <p className="text-xs text-gray-400">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank')} className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 font-medium">Yol Tarifi</button>
                                            <button onClick={() => handleDeleteLocation(idx)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic text-center py-3">Henüz konum eklenmemiş.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Visit Modal */}
            {isVisitModalOpen && (
                <VisitModal
                    customerId={customer.id}
                    onClose={() => setIsVisitModalOpen(false)}
                    onSuccess={() => {
                        setIsVisitModalOpen(false);
                        if (id) loadCustomer(id);
                    }}
                />
            )}
        </div>
    );
};

const VisitModal: React.FC<{ customerId: string; onClose: () => void; onSuccess: () => void }> = ({ customerId, onClose, onSuccess }) => {
    const { register, handleSubmit } = useForm<CreateVisitDto>();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleGetLocation = () => {
        setLocationStatus('loading');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('success');
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    setLocationStatus('error');
                    alert('Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocationStatus('error');
            alert('Tarayıcınız konum özelliğini desteklemiyor.');
        }
    };

    const onSubmit = async (data: CreateVisitDto) => {
        try {
            setLoading(true);

            await visitService.create({
                ...data,
                customerId,
                latitude: location?.lat,
                longitude: location?.lng
            });
            onSuccess();
        } catch (error) {
            console.error('Failed to add visit:', error);
            alert('Ziyaret eklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Ziyaret Ekle</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                        <input
                            type="datetime-local"
                            {...register('date', { required: 'Tarih zorunludur' })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            defaultValue={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                        <textarea
                            {...register('note')}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ziyaret detayı..."
                        />
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm">
                            <span className="font-medium text-gray-700 block mb-1">Konum Ekle</span>
                            {locationStatus === 'idle' && <span className="text-gray-500 text-xs">Mevcut konumunuzu ziyaret hedefine ekleyin</span>}
                            {locationStatus === 'loading' && <span className="text-indigo-500 text-xs animate-pulse">Konum bulunuyor...</span>}
                            {locationStatus === 'success' && <span className="text-emerald-600 text-xs font-medium">✓ Konum başarıyla alındı</span>}
                            {locationStatus === 'error' && <span className="text-red-500 text-xs">⚠️ Konum alınamadı</span>}
                        </div>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationStatus === 'loading' || locationStatus === 'success'}
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {locationStatus === 'success' ? 'Alındı' : 'Konumumu Bul'}
                        </button>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerDetail;
