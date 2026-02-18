import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Phone, Stethoscope, User, Mail, Lock, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginSignupDialog({ open, onOpenChange }: LoginSignupDialogProps) {
  // Doctor state
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorMobile, setDoctorMobile] = useState('');
  const [doctorConfirmPassword, setDoctorConfirmPassword] = useState('');

  // Patient OTP state
  const [patientMobile, setPatientMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('doctor');
  const [doctorMode, setDoctorMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const { doctorLogin, doctorRegister, sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();

  // ============================================================
  // DOCTOR HANDLERS
  // ============================================================
  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorEmail || !doctorPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await doctorLogin(doctorEmail, doctorPassword);
      toast({ title: "Welcome, Doctor!", description: "Login successful" });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorName || !doctorEmail || !doctorMobile || !doctorPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (doctorPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (doctorPassword !== doctorConfirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (!/^\d{10,12}$/.test(doctorMobile)) {
      toast({ title: "Error", description: "Please enter a valid mobile number (10-12 digits)", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await doctorRegister({
        name: doctorName,
        email: doctorEmail,
        mobile: doctorMobile,
        password: doctorPassword
      });
      toast({ title: "Success!", description: "Doctor account created successfully" });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // PATIENT OTP HANDLERS
  // ============================================================
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{10,12}$/.test(patientMobile)) {
      toast({ title: "Error", description: "Please enter a valid mobile number (10-12 digits)", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(patientMobile);
      setOtpSent(true);
      toast({ title: "OTP Sent!", description: "Please check your mobile for the OTP code" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({ title: "Error", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(patientMobile, otp);
      toast({ title: "Welcome!", description: "Login successful" });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDoctorEmail('');
    setDoctorPassword('');
    setDoctorName('');
    setDoctorMobile('');
    setDoctorConfirmPassword('');
    setPatientMobile('');
    setOtp('');
    setOtpSent(false);
    setDoctorMode('login');
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
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

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetForm(); }} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctor" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Doctor
            </TabsTrigger>
            <TabsTrigger value="patient" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Patient
            </TabsTrigger>
          </TabsList>

          {/* ============ DOCTOR TAB ============ */}
          <TabsContent value="doctor" className="space-y-4">
            {doctorMode === 'login' ? (
              <>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-medical-dark">Doctor Sign In</h3>
                  <p className="text-sm text-muted-foreground">Login with your email and password</p>
                </div>

                <form onSubmit={handleDoctorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-medical-dark">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
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
                        value={doctorPassword}
                        onChange={(e) => setDoctorPassword(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : 'Sign In as Doctor'}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline font-medium"
                    onClick={() => setDoctorMode('register')}
                  >
                    Don't have an account? Register here
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => setDoctorMode('login')} className="text-muted-foreground hover:text-primary">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-medical-dark">Create Doctor Account</h3>
                    <p className="text-sm text-muted-foreground">Register as the clinic doctor</p>
                  </div>
                </div>

                <form onSubmit={handleDoctorRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Dr. Full Name"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Email Address</label>
                    <Input
                      type="email"
                      placeholder="doctor@email.com"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={doctorMobile}
                      onChange={(e) => setDoctorMobile(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Password</label>
                    <Input
                      type="password"
                      placeholder="Min 6 characters"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={doctorConfirmPassword}
                      onChange={(e) => setDoctorConfirmPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Create Doctor Account'}
                  </Button>
                </form>
              </>
            )}
          </TabsContent>

          {/* ============ PATIENT TAB ============ */}
          <TabsContent value="patient" className="space-y-4">
            {!otpSent ? (
              <>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-medical-dark">Patient Login</h3>
                  <p className="text-sm text-muted-foreground">Enter your mobile number to receive OTP</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Enter your registered mobile number"
                        value={patientMobile}
                        onChange={(e) => setPatientMobile(e.target.value)}
                        className="pl-10 h-12"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : 'Send OTP'}
                  </Button>
                </form>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Only patients whose case has been created by the doctor can log in.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="text-muted-foreground hover:text-primary">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-medical-dark">Enter OTP</h3>
                    <p className="text-sm text-muted-foreground">OTP sent to {patientMobile}</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-medical-dark">Enter 6-digit OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 h-12 text-center text-lg tracking-widest font-mono"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="medical" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify & Login'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline font-medium"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      Didn't receive OTP? Resend
                    </button>
                  </div>
                </form>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}