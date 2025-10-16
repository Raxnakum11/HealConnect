import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Heart, Phone, User, Stethoscope, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function LoginSignupDialog({ open, onOpenChange }: LoginSignupDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [specialization] = useState<'homeopathy' | 'allopathy'>('homeopathy');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, isSignup: boolean) => {
    e.preventDefault();
    
    if (isSignup) {
      // Signup validation
      if (!mobile || !name || !email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error", 
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      const mobileRegex = /^\d{10,12}$/;
      if (!mobileRegex.test(mobile)) {
        toast({
          title: "Error",
          description: "Please enter a valid mobile number (10-12 digits)",
          variant: "destructive"
        });
        return;
      }

    } else {
      // Login validation - support both email/password and mobile/name
      if (email && password) {
        // Email login
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
          toast({
            title: "Error",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
          return;
        }
      } else if (mobile) {
        // Mobile login (backward compatibility)
        if (!name) {
          toast({
            title: "Error",
            description: "Please enter your name for mobile login",
            variant: "destructive"
          });
          return;
        }
      } else {
        toast({
          title: "Error",
          description: "Please enter either email/password or mobile/name",
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        // Register new user
        await register({
          name,
          email,
          mobile,
          password,
          role: selectedRole,
          specialization: selectedRole === 'doctor' ? specialization : undefined
        });
        
        toast({
          title: "Success",
          description: "Account created successfully! You are now logged in.",
        });
      } else {
        // Login existing user
        if (email && password) {
          // Email/password login
          await login(email, password, selectedRole, true);
        } else {
          // Mobile/name login (backward compatibility)
          await login(mobile, name, selectedRole, false);
        }

        toast({
          title: "Success", 
          description: "Logged in successfully!",
        });
      }

      // Clear form and close dialog
      setMobile('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onOpenChange(false);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (isSignup ? "Registration failed" : "Login failed"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMobile('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSelectedRole('patient');
    setActiveTab('login');
    setIsLoading(false);
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
          <DialogDescription className="text-sm text-primary font-medium">
            by Shree Hari Clinic
          </DialogDescription>
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
              {/* Email/Password Login */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <span>OR</span>
              </div>

              {/* Mobile Login (Backward Compatibility) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Mobile Number (Alternative)</label>
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

              {mobile && !email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-medical-dark">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                {isLoading ? 'Signing In...' : `Sign In as ${selectedRole === 'patient' ? 'Patient' : 'Doctor'}`}
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Enter mobile number (10-12 digits)"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-dark">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : `Create ${selectedRole === 'patient' ? 'Patient' : 'Doctor'} Account`}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}