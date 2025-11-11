import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Car, User, Star, Clock, Wifi, WifiOff } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Driver {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  vehicle: string;
  rating: number;
  eta: number;
}

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentLocation, requestLocationPermission, locationPermission } = useLocation();
  const { isConnected } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyDrivers();
      setIsLoading(false);
    }
  }, [currentLocation]);

  const initializeScreen = async () => {
    if (!locationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        setIsLoading(false);
      }
    }
  };

  const fetchNearbyDrivers = () => {
    if (!currentLocation) return;
    
    // Mock nearby drivers
    const mockDrivers: Driver[] = [
      {
        id: 'driver1',
        latitude: currentLocation.latitude + 0.002,
        longitude: currentLocation.longitude + 0.002,
        name: 'Alex Johnson',
        vehicle: 'Toyota Camry',
        rating: 4.9,
        eta: 3
      },
      {
        id: 'driver2',
        latitude: currentLocation.latitude - 0.003,
        longitude: currentLocation.longitude + 0.001,
        name: 'Sarah Chen',
        vehicle: 'Honda Accord',
        rating: 4.8,
        eta: 5
      }
    ];
    
    setNearbyDrivers(mockDrivers);
  };

  const handleBookRide = () => {
    navigate('/book-trip');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Good morning</p>
            <h1 className="text-xl font-bold">{user?.firstName || 'User'}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <User className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isConnected ? (
            <><Wifi className="w-4 h-4" /><span className="text-xs">Connected</span></>
          ) : (
            <><WifiOff className="w-4 h-4" /><span className="text-xs">Offline</span></>
          )}
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        {currentLocation && (
          <MapContainer
            center={[currentLocation.latitude, currentLocation.longitude]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
              <Popup>Your Location</Popup>
            </Marker>
            {nearbyDrivers.map((driver) => (
              <Marker
                key={driver.id}
                position={[driver.latitude, driver.longitude]}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{driver.name}</p>
                    <p>{driver.vehicle}</p>
                    <p className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {driver.rating}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl shadow-2xl p-6 space-y-6 max-h-[40vh] overflow-y-auto">
        <div>
          <h2 className="text-xl font-semibold mb-4">Where to?</h2>
          <Button onClick={handleBookRide} className="w-full h-12" size="lg">
            <Car className="mr-2 w-5 h-5" />
            Book a Ride
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Nearby Drivers ({nearbyDrivers.length})</h3>
          </div>
          {nearbyDrivers.map((driver) => (
            <Card key={driver.id} className="p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{driver.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {driver.eta} min
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
