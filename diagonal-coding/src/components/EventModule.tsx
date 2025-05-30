
"use client";

import type { FC } from 'react';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyPopper, CalendarCheck, Coffee, UsersRound, Croissant, LogOut, ListChecks, Car, Armchair, MapPinned } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

interface EventModuleProps {
  userName: string;
  currentMonthYear: string;
  onLogout: () => void;
}

const EventModule: FC<EventModuleProps> = ({ userName, currentMonthYear, onLogout }) => {
  const eventStorageKeyPrefix = `officeConnectEvent_${userName}_${currentMonthYear}`;
  const { toast } = useToast();

  // Event registration
  const [isRegistered, setIsRegistered] = useLocalStorage<boolean>(`${eventStorageKeyPrefix}_registered`, false);
  const [bringingMate, setBringingMate] = useLocalStorage<boolean>(`${eventStorageKeyPrefix}_mate`, false);
  const [bringingFacturas, setBringingFacturas] = useLocalStorage<boolean>(`${eventStorageKeyPrefix}_facturas`, false);

  // Carpool details
  const [isDriving, setIsDriving] = useLocalStorage<boolean>(`${eventStorageKeyPrefix}_isDriving`, false);
  const [driverSeatsOffered, setDriverSeatsOffered] = useLocalStorage<number>(`${eventStorageKeyPrefix}_driverSeatsOffered`, 0);
  const [mapsLink, setMapsLink] = useLocalStorage<string>(`${eventStorageKeyPrefix}_mapsLink`, '');
  // Passengers list is managed by drivers, so this key also includes driver's name.
  const [driverPassengers, setDriverPassengers] = useLocalStorage<string[]>(`${eventStorageKeyPrefix}_driverPassengers`, []);


  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleRegistrationToggle = useCallback(() => {
    const newRegistrationState = !isRegistered;
    setIsRegistered(newRegistrationState);
    if (!newRegistrationState) { // If unregistering
      setBringingMate(false);
      setBringingFacturas(false);
      // Also clear carpool info if they unregister
      setIsDriving(false);
      setDriverSeatsOffered(0);
      setMapsLink('');
      if (driverPassengers.length > 0) {
        toast({
            title: "Passengers Alert",
            description: `You had ${driverPassengers.length} passenger(s). They have been removed from your car.`,
            variant: "destructive",
        });
      }
      setDriverPassengers([]); // Clear passengers from their car
    }
  }, [isRegistered, setIsRegistered, setBringingMate, setBringingFacturas, setIsDriving, setDriverSeatsOffered, setMapsLink, setDriverPassengers, driverPassengers, toast]);

  const handleMateToggle = () => {
    setBringingMate(!bringingMate);
  };

  const handleFacturasToggle = () => {
    setBringingFacturas(!bringingFacturas);
  };

  const handleIsDrivingToggle = useCallback(() => {
    const newIsDrivingState = !isDriving;
    setIsDriving(newIsDrivingState);
    if (!newIsDrivingState) { // If no longer driving
      if (driverPassengers.length > 0) {
         toast({
            title: "Passengers Alert",
            description: `You had ${driverPassengers.length} passenger(s). They have been removed from your car as you are no longer driving.`,
            variant: "destructive",
        });
      }
      setDriverSeatsOffered(0);
      setMapsLink('');
      setDriverPassengers([]);
    }
  }, [isDriving, setIsDriving, setDriverSeatsOffered, setMapsLink, setDriverPassengers, driverPassengers, toast]);

  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seats = parseInt(e.target.value, 10);
    const newSeats = Math.max(0, seats); // Ensure non-negative
    
    if (newSeats < driverPassengers.length) {
        toast({
            title: "Seat Reduction Warning",
            description: `You cannot offer fewer seats (${newSeats}) than current passengers (${driverPassengers.length}). Adjust passengers first or increase seats.`,
            variant: "destructive",
        });
        // Optionally, revert to driverPassengers.length or old value if that's better UX
        // For now, we allow the state to reflect input but rely on registrations page to handle join logic
    }
    setDriverSeatsOffered(newSeats);
  };


  if (isLoading) {
    return (
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">Loading your event details...</p>
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UsersRound size={32} className="text-primary" />
              Welcome, {userName}!
            </CardTitle>
            <CardDescription className="mt-1">
              Manage your participation for the monthly 'Come Together' event.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="transition-transform active:scale-95 text-muted-foreground hover:text-foreground">
            <LogOut size={16} className="mr-1" /> Change User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-secondary/30 shadow-sm">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-primary">
            <PartyPopper size={24} />
            This Month's Event
          </h3>
          <p className="text-lg text-foreground/90 mt-1">
            Come Together - {currentMonthYear}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor="event-registration" className="flex items-center gap-2 text-md font-medium">
              <CalendarCheck size={20} className={isRegistered ? "text-primary" : "text-muted-foreground"} />
              Event Registration
            </Label>
            <Button
              id="event-registration"
              onClick={handleRegistrationToggle}
              variant={isRegistered ? "secondary" : "default"}
              className="w-32 transition-transform active:scale-95"
            >
              {isRegistered ? "Unregister" : "Register"}
            </Button>
          </div>

          {isRegistered && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="mate-contribution" className="flex items-center gap-2 text-md font-medium">
                  <Coffee size={20} className={bringingMate ? "text-primary" : "text-muted-foreground"} />
                  Will you bring Mate?
                </Label>
                <Checkbox
                  id="mate-contribution"
                  checked={bringingMate}
                  onCheckedChange={handleMateToggle}
                  aria-label="Indicate if you will bring mate"
                  className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="facturas-contribution" className="flex items-center gap-2 text-md font-medium">
                  <Croissant size={20} className={bringingFacturas ? "text-primary" : "text-muted-foreground"} />
                  Will you bring Facturas?
                </Label>
                <Checkbox
                  id="facturas-contribution"
                  checked={bringingFacturas}
                  onCheckedChange={handleFacturasToggle}
                  aria-label="Indicate if you will bring facturas"
                  className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>

              <Separator />

              {/* Carpool Section */}
              <div className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="driving-checkbox" className="flex items-center gap-2 text-md font-medium">
                    <Car size={20} className={isDriving ? "text-primary" : "text-muted-foreground"} />
                    Offering a Ride?
                  </Label>
                  <Checkbox
                    id="driving-checkbox"
                    checked={isDriving}
                    onCheckedChange={handleIsDrivingToggle}
                    aria-label="Indicate if you are driving and offering a ride"
                    className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
                {isDriving && (
                  <div className="space-y-3 animate-in fade-in duration-300 pl-2 border-l-2 border-primary/30">
                    <div className="flex items-center justify-between p-2 border rounded-md">
                       <Label htmlFor="available-seats" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                         <Armchair size={18} /> Available Seats in Your Car:
                       </Label>
                       <Input
                         id="available-seats"
                         type="number"
                         min="0"
                         value={driverSeatsOffered}
                         onChange={handleSeatsChange}
                         className="w-20 h-8 text-sm"
                         aria-label="Number of available seats in your car"
                       />
                     </div>
                     <div className="p-2 border rounded-md space-y-1">
                       <Label htmlFor="maps-link" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                         <MapPinned size={18} /> Google Maps Route Link:
                       </Label>
                       <Input
                         id="maps-link"
                         type="url"
                         value={mapsLink}
                         onChange={(e) => setMapsLink(e.target.value)}
                         placeholder="https://maps.app.goo.gl/..."
                         className="w-full h-8 text-sm"
                         aria-label="Google Maps link for your route"
                       />
                     </div>
                     {driverPassengers.length > 0 && (
                        <div className="p-2 border rounded-md bg-secondary/20">
                            <p className="text-sm font-medium text-muted-foreground">Your Passengers:</p>
                            <ul className="list-disc list-inside text-sm text-foreground/80">
                                {driverPassengers.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <Separator />

        <div>
          <Button asChild variant="outline" className="w-full transition-transform active:scale-95">
            <Link href="/registrations">
              <ListChecks className="mr-2 h-4 w-4" />
              View Event Registrations & Rides
            </Link>
          </Button>
        </div>

      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>Changes are saved automatically.</p>
      </CardFooter>
    </>
  );
};

export default EventModule;

    