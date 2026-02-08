import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { customerService, visitService, attachmentService } from '../services/api';
import type { Customer, CreateVisitDto, Attachment, Visit } from '../types';
import MapComponent from '../components/MapComponent';
import { Trash2, Upload, Loader2, FileText } from 'lucide-react';

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [editData, setEditData] = useState<{ name?: string; phoneNumber?: string; constructionType?: string; stage?: string; description?: string; address?: string }>({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

    useEffect(() => {
        if (id) loadCustomer(id);
    }, [id]);

    const loadCustomer = async (customerId: string) => {
        try {
            const data = await customerService.getOne(customerId);
            setCustomer(data);
            setEditData({
                name: data.name,
                phoneNumber: data.phoneNumber,
                constructionType: data.constructionType,
                stage: data.stage,
                description: data.description,
                address: data.address
            });
        } catch (error) {
            console.error('Failed to load customer:', error);
            alert('Müşteri bulunamadı.');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInfo = async () => {
        if (!id) return;
        try {
            setUpdating(true);
            await customerService.update(id, editData);
            await loadCustomer(id);
            setIsEditing(false);
            alert('Müşteri bilgileri güncellendi.');
        } catch (error) {
            console.error('Failed to update customer info:', error);
            alert('Güncelleme sırasında hata oluştu.');
        } finally {
            setUpdating(false);
        }
    };

    const handleEditChange = (field: string, value: string) => {
        setEditData(prev => ({ ...prev, [field]: value }));
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

    const handleDeleteVisit = async (visitId: string) => {
        if (window.confirm('Bu ziyareti silmek istediğinize emin misiniz?')) {
            try {
                await visitService.delete(visitId);
                if (id) await loadCustomer(id);
            } catch (error) {
                console.error('Failed to delete visit:', error);
                alert('Ziyaret silinemedi.');
            }
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
                    <p className="text-gray-500">{customer.phoneNumber}</p>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => {
                            setEditingVisit(null);
                            setIsVisitModalOpen(true);
                        }}
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
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <h2 className="font-semibold text-gray-900">Bilgiler</h2>
                            <div className="flex items-center gap-2">
                                {updating && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                                >
                                    {isEditing ? 'İptal' : 'Düzenle'}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2">
                                    <label className="block text-gray-500 mb-1">Müşteri Adı</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.name || ''}
                                            onChange={(e) => handleEditChange('name', e.target.value)}
                                            disabled={updating}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 font-medium"
                                        />
                                    ) : (
                                        <span className="text-gray-900 font-semibold">{customer.name}</span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-gray-500 mb-1">Telefon</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.phoneNumber || ''}
                                            onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                                            disabled={updating}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                        />
                                    ) : (
                                        <span className="text-gray-900">{customer.phoneNumber}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">İnşaat Türü</span>
                                    {isEditing ? (
                                        <select
                                            value={editData.constructionType || ''}
                                            onChange={(e) => handleEditChange('constructionType', e.target.value)}
                                            disabled={updating}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value="Müşteri">Müşteri</option>
                                            <option value="Konut">Konut</option>
                                            <option value="Ticari">Ticari</option>
                                            <option value="Devlet">Devlet</option>
                                            <option value="Diğer">Diğer</option>
                                        </select>
                                    ) : (
                                        <span className="text-gray-900">{customer.constructionType || '-'}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">Aşama</span>
                                    {isEditing ? (
                                        <select
                                            value={editData.stage || ''}
                                            onChange={(e) => handleEditChange('stage', e.target.value)}
                                            disabled={updating}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-indigo-600"
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value="Müşteri">Müşteri</option>
                                            <option value="Proje">Proje</option>
                                            <option value="Temel">Temel</option>
                                            <option value="Kaba İnşaat">Kaba İnşaat</option>
                                            <option value="İnce İşçilik">İnce İşçilik</option>
                                            <option value="Tamamlandı">Tamamlandı</option>
                                        </select>
                                    ) : (
                                        <span className="font-medium text-indigo-600">{customer.stage || '-'}</span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-gray-500 mb-1">Adres</span>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.address || ''}
                                            onChange={(e) => handleEditChange('address', e.target.value)}
                                            disabled={updating}
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                            placeholder="Adres bilgisi..."
                                        />
                                    ) : (
                                        <span className="text-gray-900">{customer.address || '-'}</span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-gray-500 mb-1">Açıklama</span>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.description || ''}
                                            onChange={(e) => handleEditChange('description', e.target.value)}
                                            disabled={updating}
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                            placeholder="Notlar veya açıklama..."
                                        />
                                    ) : (
                                        <p className="text-gray-900 italic text-xs">{customer.description || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <button
                                    onClick={handleSaveInfo}
                                    disabled={updating}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                                </button>
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
                                        <div className="bg-gray-50 p-3 rounded-lg group">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-semibold text-indigo-600">
                                                    {new Date(visit.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingVisit(visit);
                                                            setIsVisitModalOpen(true);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-indigo-600"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVisit(visit.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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

                {/* Right Column: Map */}
                <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm h-fit">
                    <MapComponent
                        readOnly
                        initialLocation={customer.latitude && customer.longitude ? { lat: customer.latitude, lng: customer.longitude } : undefined}
                    />
                    <div className="p-3">
                        <p className="text-xs text-center text-gray-400">Yol tarifi için haritadaki işarete tıklayınız</p>
                    </div>
                </div>
            </div>

            {/* Add Visit Modal */}
            {isVisitModalOpen && (
                <VisitModal
                    customerId={customer.id}
                    editVisit={editingVisit}
                    onClose={() => {
                        setIsVisitModalOpen(false);
                        setEditingVisit(null);
                    }}
                    onSuccess={() => {
                        setIsVisitModalOpen(false);
                        setEditingVisit(null);
                        if (id) loadCustomer(id);
                    }}
                />
            )}
        </div>
    );
};

const VisitModal: React.FC<{ customerId: string; editVisit?: Visit | null; onClose: () => void; onSuccess: () => void }> = ({ customerId, editVisit, onClose, onSuccess }) => {
    const { register, handleSubmit, setValue } = useForm<CreateVisitDto>();
    const [loading, setLoading] = useState(false);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    useEffect(() => {
        if (editVisit) {
            setValue('date', new Date(editVisit.date).toISOString().slice(0, 16));
            setValue('note', editVisit.note || '');
        }
    }, [editVisit, setValue]);

    const onSubmit = async (data: CreateVisitDto & { constructionType?: string; stage?: string }) => {
        try {
            setLoading(true);
            let lat, lng;

            if (useCurrentLocation) {
                try {
                    const pos: GeolocationPosition = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (e) {
                    console.error("Location error", e);
                    alert("Konum alınamadı. Lütfen izinleri kontrol edin.");
                    return;
                }
            }

            // Update customer details first if provided
            if (data.constructionType || data.stage) {
                await customerService.update(customerId, {
                    constructionType: data.constructionType,
                    stage: data.stage
                });
            }

            const { constructionType, stage, ...visitData } = data;

            if (editVisit) {
                await visitService.update(editVisit.id, {
                    ...visitData,
                    latitude: lat,
                    longitude: lng
                });
            } else {
                await visitService.create({
                    ...visitData,
                    customerId,
                    latitude: lat,
                    longitude: lng
                });
            }
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
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {editVisit ? 'Ziyareti Düzenle' : 'Yeni Ziyaret Ekle'}
                </h2>
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

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">İnşaat Türü</label>
                            <select
                                {...register('constructionType' as any)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none bg-white"
                            >
                                <option value="">Değiştirme</option>
                                <option value="Müşteri">Müşteri</option>
                                <option value="Konut">Konut</option>
                                <option value="Ticari">Ticari</option>
                                <option value="Devlet">Devlet</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Aşama</label>
                            <select
                                {...register('stage' as any)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none bg-white"
                            >
                                <option value="">Değiştirme</option>
                                <option value="Müşteri">Müşteri</option>
                                <option value="Proje">Proje</option>
                                <option value="Temel">Temel</option>
                                <option value="Kaba İnşaat">Kaba İnşaat</option>
                                <option value="İnce İşçilik">İnce İşçilik</option>
                                <option value="Tamamlandı">Tamamlandı</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="location"
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={useCurrentLocation}
                            onChange={(e) => setUseCurrentLocation(e.target.checked)}
                        />
                        <label htmlFor="location" className="text-sm text-gray-700">Şu anki konumumu kaydet</label>
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
