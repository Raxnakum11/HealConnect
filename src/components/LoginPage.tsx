import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Heart, Phone, Lock, User, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile || !password || !name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    login(mobile, selectedRole, name);
    toast({
      title: "Welcome!",
      description: `Logged in successfully as ${selectedRole}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-medical-dark">HealConnect</h1>
          <h2 className="text-xl font-semibold text-secondary mb-1">Shree Hari Clinic</h2>
          <p className="text-sm text-muted-foreground mb-2">Skin, Child & Homeo Care</p>
          <p className="text-xs text-muted-foreground">11/2, opp. Rajwadi Party Plot, Shanti Nagar Society, Vibhag-2, Sweet Home Society, Amroli, Surat, Gujarat - 394210</p>
          <p className="text-muted-foreground mt-3">Your Healthcare Portal</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 bg-gradient-card shadow-medical border-0">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-medical-dark">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to access your healthcare dashboard</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedRole === 'patient' ? 'medical' : 'outline'}
                className="h-12 flex-col gap-1"
                onClick={() => setSelectedRole('patient')}
              >
                <User className="w-4 h-4" />
                <span className="text-xs">Patient</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'doctor' ? 'medical' : 'outline'}
                className="h-12 flex-col gap-1"
                onClick={() => setSelectedRole('doctor')}
              >
                <Stethoscope className="w-4 h-4" />
                <span className="text-xs">Doctor</span>
              </Button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold">
                Sign In as {selectedRole === 'patient' ? 'Patient' : 'Doctor'}
              </Button>
            </form>

            <div className="text-center mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary font-medium">Welcome to Shree Hari Clinic!</p>
              <p className="text-xs text-muted-foreground">Your trusted healthcare partner</p>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Demo Login - Use any mobile number and password</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}