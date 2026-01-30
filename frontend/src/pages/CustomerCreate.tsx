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

    const onSubmit = async (data: CreateCustomerDto) => {
        try {
            setLoading(true);
            await customerService.create({
                ...data,
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                        <input
                            {...register('phoneNumber', { required: 'Telefon zorunludur' })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="05XX XXX XX XX"
                        />
                        {errors.phoneNumber && <span className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</span>}
                    </div>

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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Konum İşaretle</label>
                        <MapComponent onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                        <p className="text-xs text-gray-500 mt-2">
                            * Harita üzerinden konum seçmek için tıklayınız.
                            {location && <span className="text-green-600 font-medium ml-2">Konum seçildi ✓</span>}
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
