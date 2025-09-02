import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Heart, Phone, Lock, User, Stethoscope, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginSignupDialog({ open, onOpenChange }: LoginSignupDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent, isSignup: boolean) => {
    e.preventDefault();
    
    if (!mobile || !password || (isSignup && !name)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const displayName = isSignup ? name : 
      selectedRole === 'doctor' ? 'Dr. Himanshu Sonagara' : 
      mobile; // Use mobile as fallback for login

    login(mobile, selectedRole, displayName);
    
    toast({
      title: isSignup ? "Welcome!" : "Welcome Back!",
      description: `${isSignup ? 'Account created and logged in' : 'Logged in'} successfully as ${selectedRole}`,
    });
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMobile('');
    setPassword('');
    setName('');
    setSelectedRole('patient');
    setActiveTab('login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-card border-0 shadow-medical">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-gradient-primary rounded-full shadow-glow">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-medical-dark">
            HealConnect
          </DialogTitle>
          <p className="text-sm text-primary font-medium">by Shree Hari Clinic</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-medical-dark">Welcome Back</h3>
              <p className="text-sm text-muted-foreground">Sign in to access your healthcare portal</p>
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

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
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
                    placeholder="Enter password"
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
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-medical-dark">Create Account</h3>
              <p className="text-sm text-muted-foreground">Join our healthcare portal</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedRole === 'patient' ? 'medical' : 'outline'}
                className="h-12 flex-col gap-1"
                onClick={() => setSelectedRole('patient')}
              >
                <UserPlus className="w-4 h-4" />
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

            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter full name"
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
                    placeholder="Enter mobile number"
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
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold">
                Create {selectedRole === 'patient' ? 'Patient' : 'Doctor'} Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Demo Mode - Use any credentials to access the portal
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}