import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/api';
import type { CreateCustomerDto } from '../types';
import MapComponent from '../components/MapComponent';

const CustomerCreate: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateCustomerDto>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(true);
    const [additionalPhones, setAdditionalPhones] = useState<string[]>([]);

    const addPhoneField = () => {
        setAdditionalPhones([...additionalPhones, '']);
    };

    const updatePhoneField = (index: number, value: string) => {
        const newPhones = [...additionalPhones];
        newPhones[index] = value;
        setAdditionalPhones(newPhones);
    };

    const removePhoneField = (index: number) => {
        const newPhones = additionalPhones.filter((_, i) => i !== index);
        setAdditionalPhones(newPhones);
    };

    React.useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsFetchingLocation(false);
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    setLocationError('Konum alınamadı. Haritadan seçebilirsiniz.');
                    setIsFetchingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocationError('Tarayıcınız konum özelliğini desteklemiyor.');
            setIsFetchingLocation(false);
        }
    }, []);

    const onSubmit = async (data: CreateCustomerDto) => {
        try {
            setLoading(true);
            await customerService.create({
                ...data,
                additionalPhones: additionalPhones.filter(p => p.trim() !== ''),
                latitude: location?.lat,
                longitude: location?.lng,
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to create customer:', error);
            alert('Müşteri oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Yeni Müşteri Ekle</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı</label>
                        <input
                            {...register('name', { required: 'İsim zorunludur' })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="Örn: Ahmet Yılmaz"
                        />
                        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ana Telefon Numarası</label>
                        <div className="flex items-center gap-2">
                            <input
                                {...register('phoneNumber', { required: 'Telefon zorunludur' })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="05XX XXX XX XX"
                            />
                            <button
                                type="button"
                                onClick={addPhoneField}
                                className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                + Ek Telefon
                            </button>
                        </div>
                        {errors.phoneNumber && <span className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</span>}
                    </div>

                    {additionalPhones.length > 0 && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Ek Telefon Numaraları</label>
                            {additionalPhones.map((phone, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => updatePhoneField(index, e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder={`Ek telefon ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoneField(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İnşaat Türü</label>
                            <select
                                {...register('constructionType')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">Seçiniz</option>
                                <option value="Konut">Konut</option>
                                <option value="Ticari">Ticari</option>
                                <option value="Devlet">Devlet</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aşama</label>
                            <select
                                {...register('stage')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">Seçiniz</option>
                                <option value="Proje">Proje</option>
                                <option value="Temel">Temel</option>
                                <option value="Kaba İnşaat">Kaba İnşaat</option>
                                <option value="İnce İşçilik">İnce İşçilik</option>
                                <option value="Tamamlandı">Tamamlandı</option>
                                <option value="Satıcı">Satıcı</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                        <textarea
                            {...register('address')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            rows={3}
                            placeholder="Mahalle, sokak, kapı no..."
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-medium text-gray-700">Konum İşaretle</label>
                            {isFetchingLocation && (
                                <span className="text-xs text-indigo-500 animate-pulse">Konum aranıyor...</span>
                            )}
                            {locationError && !isFetchingLocation && (
                                <span className="text-xs text-amber-500">{locationError}</span>
                            )}
                        </div>
                        <MapComponent initialLocation={location || undefined} onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                        <p className="text-xs text-gray-500 mt-2">
                            * Harita üzerinden konum seçmek için tıklayınız.
                            {location && !isFetchingLocation && <span className="text-green-600 font-medium ml-2">Konum seçildi ✓</span>}
                        </p>
                    </div>

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    {loading ? 'Kaydediliyor...' : 'Müşteriyi Kaydet'}
                </button>
            </form>
        </div>
    );
};

export default CustomerCreate;
