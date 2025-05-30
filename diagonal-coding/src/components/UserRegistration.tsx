
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from 'lucide-react';

interface UserRegistrationProps {
  onRegister: (name: string) => void;
}

const UserRegistration: FC<UserRegistrationProps> = ({ onRegister }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRegister(name.trim());
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus size={28} className="text-primary" />
          Register for Improving ComeTogether
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground/80">Your Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="mt-1 bg-background/80"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full transition-transform active:scale-95">
            Save Name
          </Button>
        </CardFooter>
      </form>
    </>
  );
};

export default UserRegistration;

