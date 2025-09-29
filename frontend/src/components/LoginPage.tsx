import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Heart, Phone, User, Stethoscope, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || !name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await login(mobileNumber, name, selectedRole);
      toast({
        title: "Welcome!",
        description: `Logged in successfully as ${selectedRole}`,
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

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
                variant={selectedRole === 'patient' ? 'default' : 'outline'}
                className="h-12 flex-col gap-1"
                onClick={() => setSelectedRole('patient')}
              >
                <User className="w-4 h-4" />
                <span className="text-xs">Patient</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'doctor' ? 'default' : 'outline'}
                className="h-12 flex-col gap-1"
                onClick={() => setSelectedRole('doctor')}
              >
                <Stethoscope className="w-4 h-4" />
                <span className="text-xs">Doctor</span>
              </Button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="pl-10 h-12"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-glow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  `Sign In as ${selectedRole === 'patient' ? 'Patient' : 'Doctor'}`
                )}
              </Button>
            </form>

            <div className="text-center mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary font-medium">Welcome to Shree Hari Clinic!</p>
              <p className="text-xs text-muted-foreground">Your trusted healthcare partner</p>
            </div>
          </div>
        </Card>

        {/* Demo Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">How to Login</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div>
              • Enter your full name and mobile number
            </div>
            <div>
              • Select your role (Patient or Doctor)
            </div>
            <div>
              • No password required - just click Sign In!
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}