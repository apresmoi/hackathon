
"use client";

import type { NextPage } from 'next';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Users, Coffee, Croissant, CheckCircle2, XCircle, PartyPopper, Car, Armchair, MapPinned, UserPlus, UserMinus, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ParsedRoute {
  from: string;
  to: string;
}

interface Participant {
  name: string;
  isRegistered: boolean;
  bringingMate: boolean;
  bringingFacturas: boolean;
  // Carpool details
  isDriving: boolean;
  driverSeatsOffered: number; // Total seats driver initially offered
  mapsLink: string;
  passengers: string[]; // Array of passenger names
  parsedRoute?: ParsedRoute;
}

function extractRouteFromGoogleMapsLink(link: string): ParsedRoute | null {
  if (!link) return null;
  try {
    // Improved regex to handle various Google Maps /dir/ URL formats
    const regex = /google\.[a-z\.]{2,}\/maps\/dir\/([^\/]+)\/([^\/]+)/i;
    const matches = link.match(regex);
    if (matches && matches.length >= 3) {
      const from = decodeURIComponent(matches[1].replace(/\+/g, ' '));
      const to = decodeURIComponent(matches[2].replace(/\+/g, ' '));
      if (from && to) {
        return { from, to };
      }
    }
  } catch (error) {
    console.error('Error parsing Google Maps link:', error);
  }
  return null;
}


const RegistrationsPage: NextPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentMonthYear, setCurrentMonthYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(() => {
    if (typeof window !== "undefined" && currentMonthYear) {
      setIsLoading(true);
      const currentLoggedInUser = localStorage.getItem('officeConnectUserName');
      if (currentLoggedInUser) {
        setLoggedInUserName(JSON.parse(currentLoggedInUser));
      }

      const allUserNames = new Set<string>();
      const keys = Object.keys(localStorage);
      const basePrefix = 'officeConnectEvent_';
      const registeredSuffix = `_${currentMonthYear}_registered`;

      // First, gather all potential user names from registration keys
      keys.forEach(key => {
        if (key.startsWith(basePrefix) && key.endsWith(registeredSuffix)) {
          const userName = key.substring(basePrefix.length, key.length - registeredSuffix.length);
          allUserNames.add(userName);
        }
      });
      
      // Also add any users who might only have a username stored
      const mainUserKey = 'officeConnectUserName';
      if(localStorage.getItem(mainUserKey)) {
        try {
            const mainUserName = JSON.parse(localStorage.getItem(mainUserKey)!);
            if(mainUserName) allUserNames.add(mainUserName);
        } catch (e) { console.error("Error parsing officeConnectUserName", e); }
      }


      const loadedParticipants: Participant[] = [];
      allUserNames.forEach(userName => {
        try {
          const isRegisteredItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_registered`);
          const isRegistered = isRegisteredItem ? JSON.parse(isRegisteredItem) : false;

          // Only add users if they are registered for the current event or if they are the logged-in user (to show their status)
          if (isRegistered || userName === loggedInUserName) {
            const mateItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_mate`);
            const bringingMate = mateItem ? JSON.parse(mateItem) : false;

            const facturasItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_facturas`);
            const bringingFacturas = facturasItem ? JSON.parse(facturasItem) : false;
            
            // Carpool Data
            const isDrivingItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_isDriving`);
            const isDriving = isDrivingItem ? JSON.parse(isDrivingItem) : false;

            const driverSeatsItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_driverSeatsOffered`);
            const driverSeatsOffered = driverSeatsItem ? JSON.parse(driverSeatsItem) : 0;
            
            const mapsLinkItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_mapsLink`);
            const mapsLink = mapsLinkItem ? JSON.parse(mapsLinkItem) : '';
            
            const passengersItem = localStorage.getItem(`${basePrefix}${userName}_${currentMonthYear}_driverPassengers`);
            const passengers = passengersItem ? JSON.parse(passengersItem) : [];

            loadedParticipants.push({
              name: userName,
              isRegistered,
              bringingMate,
              bringingFacturas,
              isDriving,
              driverSeatsOffered,
              mapsLink,
              passengers,
              parsedRoute: extractRouteFromGoogleMapsLink(mapsLink),
            });
          }
        } catch (error) {
          console.error('Error parsing localStorage item for user:', userName, error);
        }
      });
      
      setParticipants(loadedParticipants.filter(p => p.isRegistered).sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    }
  }, [currentMonthYear, loggedInUserName]);


  useEffect(() => {
    setIsClient(true);
    const date = new Date();
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    setCurrentMonthYear(monthYear);
  }, []);

  useEffect(() => {
    if (isClient && currentMonthYear) {
      loadData();
    }
  }, [isClient, currentMonthYear, loadData]);


  const handleJoinRide = (driverName: string) => {
    if (!loggedInUserName) {
      toast({ title: "Error", description: "You must be logged in to join a ride.", variant: "destructive" });
      return;
    }
    if (loggedInUserName === driverName) {
        toast({ title: "Oops!", description: "You cannot join your own ride.", variant: "destructive"});
        return;
    }

    const driverKeyPrefix = `officeConnectEvent_${driverName}_${currentMonthYear}`;
    const passengersKey = `${driverKeyPrefix}_driverPassengers`;
    const seatsKey = `${driverKeyPrefix}_driverSeatsOffered`;

    try {
        const currentPassengersItem = localStorage.getItem(passengersKey);
        let currentPassengers: string[] = currentPassengersItem ? JSON.parse(currentPassengersItem) : [];
        
        const seatsOfferedItem = localStorage.getItem(seatsKey);
        const seatsOffered: number = seatsOfferedItem ? JSON.parse(seatsOfferedItem) : 0;

        if (currentPassengers.includes(loggedInUserName)) {
            toast({ title: "Already Joined", description: `You are already a passenger in ${driverName}'s car.`});
            return;
        }
        
        if (currentPassengers.length >= seatsOffered) {
            toast({ title: "Car Full", description: `${driverName}'s car is already full.`, variant: "destructive"});
            return;
        }

        currentPassengers.push(loggedInUserName);
        localStorage.setItem(passengersKey, JSON.stringify(currentPassengers));
        toast({ title: "Ride Joined!", description: `You have successfully joined ${driverName}'s car.`});
        loadData(); // Refresh list
    } catch (error) {
        console.error("Error joining ride:", error);
        toast({ title: "Error", description: "Could not join the ride. Please try again.", variant: "destructive" });
    }
  };

  const handleLeaveRide = (driverName: string) => {
    if (!loggedInUserName) {
      toast({ title: "Error", description: "You must be logged in to leave a ride.", variant: "destructive" });
      return;
    }
    const driverKeyPrefix = `officeConnectEvent_${driverName}_${currentMonthYear}`;
    const passengersKey = `${driverKeyPrefix}_driverPassengers`;
    try {
        const currentPassengersItem = localStorage.getItem(passengersKey);
        let currentPassengers: string[] = currentPassengersItem ? JSON.parse(currentPassengersItem) : [];
        
        if (!currentPassengers.includes(loggedInUserName)) {
            toast({ title: "Not a Passenger", description: `You are not currently a passenger in ${driverName}'s car.`});
            return;
        }

        currentPassengers = currentPassengers.filter(p => p !== loggedInUserName);
        localStorage.setItem(passengersKey, JSON.stringify(currentPassengers));
        toast({ title: "Ride Left", description: `You have left ${driverName}'s car.`});
        loadData(); // Refresh list
    } catch (error) {
        console.error("Error leaving ride:", error);
        toast({ title: "Error", description: "Could not leave the ride. Please try again.", variant: "destructive" });
    }
  };


  if (!isClient || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="animate-pulse text-primary">
          <Users size={48} />
        </div>
        <p className="text-muted-foreground mt-2">Loading Registrations & Rides...</p>
      </div>
    );
  }
  
  const registeredParticipants = participants.filter(p => p.isRegistered);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 selection:bg-primary/30 selection:text-primary-foreground">
      <main className="w-full max-w-4xl mt-8 mb-8">
        <Card className="shadow-2xl overflow-hidden rounded-xl border-2 border-primary/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PartyPopper size={32} className="text-primary" />
                Event Registrations & Rides
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <CardDescription>
              Colleagues registered for 'Come Together' - {currentMonthYear}. See who's bringing goodies and offering rides!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!loggedInUserName && (
                 <Alert variant="default" className="mb-4 bg-primary/10 border-primary/30">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary/90">Not Logged In</AlertTitle>
                    <AlertDescription className="text-primary/80">
                        You are viewing as a guest. To join rides, please <Link href="/" className="underline">register or log in</Link> first.
                    </AlertDescription>
                </Alert>
            )}
            {registeredParticipants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Mate</TableHead>
                    <TableHead className="text-center">Facturas</TableHead>
                    <TableHead className="text-center">Driving</TableHead>
                    <TableHead className="text-center">Seats Left</TableHead>
                    <TableHead>Route / Passengers</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registeredParticipants.map((participant) => {
                    const seatsLeft = Math.max(0, participant.driverSeatsOffered - participant.passengers.length);
                    const isCurrentUserPassenger = participant.passengers.includes(loggedInUserName || '');
                    const canJoin = loggedInUserName && participant.name !== loggedInUserName && !isCurrentUserPassenger && seatsLeft > 0 && participant.isDriving;
                    
                    return (
                      <TableRow key={participant.name}>
                        <TableCell className="font-medium">{participant.name} {participant.name === loggedInUserName && "(You)"}</TableCell>
                        <TableCell className="text-center">
                          {participant.bringingMate ? (
                            <CheckCircle2 className="h-5 w-5 text-primary inline-block" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground inline-block" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {participant.bringingFacturas ? (
                            <CheckCircle2 className="h-5 w-5 text-primary inline-block" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground inline-block" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {participant.isDriving ? (
                            <Car className="h-5 w-5 text-primary inline-block" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground inline-block" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {participant.isDriving ? (
                            <span className={`font-semibold ${seatsLeft > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                              {seatsLeft}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {participant.isDriving ? (
                            <div className="text-xs">
                              {participant.parsedRoute ? (
                                <p><strong>From:</strong> {participant.parsedRoute.from}<br/><strong>To:</strong> {participant.parsedRoute.to}</p>
                              ) : participant.mapsLink ? (
                                <a href={participant.mapsLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                  <MapPinned size={14} /> View Full Route
                                </a>
                              ) : (
                                <span className="text-muted-foreground">Route not specified</span>
                              )}
                              {participant.passengers.length > 0 && (
                                <div className="mt-1">
                                  <strong>Passengers:</strong> {participant.passengers.join(', ')}
                                </div>
                              )}
                            </div>
                          ) : (
                             <span className="text-muted-foreground">Not driving</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {loggedInUserName && participant.name !== loggedInUserName && participant.isDriving && (
                            <>
                              {isCurrentUserPassenger ? (
                                <Button variant="destructive" size="sm" onClick={() => handleLeaveRide(participant.name)}>
                                  <UserMinus className="mr-1 h-4 w-4" /> Leave
                                </Button>
                              ) : canJoin ? (
                                <Button variant="default" size="sm" onClick={() => handleJoinRide(participant.name)}>
                                  <UserPlus className="mr-1 h-4 w-4" /> Join
                                </Button>
                              ) : seatsLeft === 0 && !isCurrentUserPassenger ? (
                                <span className="text-xs text-muted-foreground">Full</span>
                              ) : null}
                            </>
                          )}
                          {loggedInUserName && participant.name === loggedInUserName && participant.isDriving && (
                            <span className="text-xs text-muted-foreground italic">Your car</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Users size={48} className="mx-auto mb-4" />
                <p>No users are registered for this event yet.</p>
                <p className="text-sm mt-1">Be the first to register from the home page!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RegistrationsPage;

    