import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Navigation, Car, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  type: string;
  name: string;
  description: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  icon: string;
  eta: string;
}

const vehicles: Vehicle[] = [
  {
    type: 'economy',
    name: 'Economy',
    description: 'Affordable, everyday rides',
    baseFare: 25,
    perKmRate: 12,
    perMinuteRate: 2.5,
    icon: 'car',
    eta: '3-5 min'
  },
  {
    type: 'comfort',
    name: 'Comfort',
    description: 'Newer cars with extra legroom',
    baseFare: 35,
    perKmRate: 15,
    perMinuteRate: 3.0,
    icon: 'car-front',
    eta: '2-4 min'
  },
  {
    type: 'premium',
    name: 'Premium',
    description: 'Luxury cars for special occasions',
    baseFare: 50,
    perKmRate: 20,
    perMinuteRate: 4.0,
    icon: 'car-taxi',
    eta: '1-3 min'
  }
];

const TripBooking = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { currentLocation, calculateDistance, calculateETA } = useLocation();
  const { isConnected } = useSocket();
  
  const [pickupAddress, setPickupAddress] = useState('Current Location');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('economy');
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mock dropoff location for demo
  const mockDropoffLocation = currentLocation ? {
    latitude: currentLocation.latitude + 0.05,
    longitude: currentLocation.longitude + 0.05
  } : null;

  useEffect(() => {
    if (currentLocation && mockDropoffLocation) {
      calculateTripDetails();
    }
  }, [currentLocation, selectedVehicle]);

  const calculateTripDetails = () => {
    if (!currentLocation || !mockDropoffLocation) return;

    const distanceKm = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      mockDropoffLocation.latitude,
      mockDropoffLocation.longitude
    );

    const vehicle = vehicles.find(v => v.type === selectedVehicle)!;
    const estimatedMinutes = calculateETA(distanceKm);
    const fare = Math.round(
      vehicle.baseFare + 
      (distanceKm * vehicle.perKmRate) + 
      (estimatedMinutes * vehicle.perMinuteRate)
    );

    setDistance(Math.round(distanceKm * 10) / 10);
    setEstimatedTime(estimatedMinutes);
    setEstimatedFare(fare);
  };

  const handleBookTrip = async () => {
    if (!dropoffAddress) {
      toast.error('Please enter a destination');
      return;
    }

    if (!isConnected) {
      toast.error('Please check your internet connection');
      return;
    }

    setIsLoading(true);

    try {
      // In production, this would call your backend API
      toast.success('Trip booked successfully!');
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      toast.error('Failed to book trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Book a Ride</h1>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Location Inputs */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <Navigation className="w-5 h-5 text-green-500" />
              <div className="w-0.5 h-8 bg-border my-1" />
            </div>
            <div className="flex-1">
              <Label>Pickup Location</Label>
              <Input
                value={pickupAddress}
                readOnly
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <Label>Destination</Label>
              <Input
                placeholder="Enter destination address"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Choose your ride</h2>
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.type}
                className={`p-4 cursor-pointer transition-all ${
                  selectedVehicle === vehicle.type
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedVehicle(vehicle.type)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedVehicle === vehicle.type ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <Car className={`w-6 h-6 ${
                        selectedVehicle === vehicle.type ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">{vehicle.name}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{vehicle.eta}</p>
                    {selectedVehicle === vehicle.type && (
                      <p className="font-semibold text-primary">R{estimatedFare}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trip Summary */}
        {dropoffAddress && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Trip Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{distance} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Estimated Time
                </span>
                <span className="font-medium">{estimatedTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vehicle Type</span>
                <span className="font-medium">{selectedVehicleData.name}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  Total Fare
                </span>
                <span className="text-xl font-bold text-primary">R{estimatedFare}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t">
        <Button
          onClick={handleBookTrip}
          className="w-full h-12"
          size="lg"
          disabled={!dropoffAddress || isLoading}
        >
          {isLoading ? 'Booking...' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
};

export default TripBooking;
