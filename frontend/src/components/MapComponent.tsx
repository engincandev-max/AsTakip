import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

const defaultCenter = {
    lat: 41.0082, // Istanbul
    lng: 28.9784,
};

interface MapComponentProps {
    onLocationSelect?: (lat: number, lng: number) => void;
    initialLocation?: { lat: number; lng: number };
    readOnly?: boolean;
    markers?: { lat: number; lng: number; title?: string; id?: string }[];
    onMarkerClick?: (id: string, lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect, initialLocation, readOnly = false, markers = [], onMarkerClick }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    const [, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialLocation || null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (readOnly || !onLocationSelect || !e.latLng) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setMarker({ lat, lng });
        onLocationSelect(lat, lng);
    };

    const handleMarkerClick = () => {
        if (readOnly && marker) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`, '_blank');
        }
    };

    if (!isLoaded) return <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Harita Yükleniyor...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={marker || defaultCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
            }}
        >
            {markers.length > 0 ? (
                markers.map((m, index) => (
                    <Marker
                        key={m.id || index}
                        position={{ lat: m.lat, lng: m.lng }}
                        title={m.title}
                        onClick={() => {
                            if (onMarkerClick && m.id) {
                                onMarkerClick(m.id, m.lat, m.lng);
                            } else if (readOnly) {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`, '_blank');
                            }
                        }}
                    />
                ))
            ) : (
                marker && <Marker position={marker} onClick={handleMarkerClick} />
            )}
        </GoogleMap>
    );
};

export default React.memo(MapComponent);
