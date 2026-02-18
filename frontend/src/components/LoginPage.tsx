import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Phone, Mail, Lock, Stethoscope, User, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [activePanel, setActivePanel] = useState<'doctor' | 'patient'>('doctor');
  const [doctorMode, setDoctorMode] = useState<'login' | 'register'>('login');

  // Doctor state
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorMobile, setDoctorMobile] = useState('');
  const [doctorConfirmPassword, setDoctorConfirmPassword] = useState('');
  const [doctorSpecialization, setDoctorSpecialization] = useState<'homeopathy' | 'allopathy'>('homeopathy');

  // Patient OTP state
  const [patientMobile, setPatientMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const { doctorLogin, doctorRegister, sendOtp, verifyOtp, loading: authLoading } = useAuth();
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
    setLoading(true);
    try {
      await doctorLogin(doctorEmail, doctorPassword);
      toast({ title: "Welcome, Doctor!", description: "Login successful" });
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await doctorRegister({
        name: doctorName,
        email: doctorEmail,
        mobile: doctorMobile,
        password: doctorPassword,
        specialization: doctorSpecialization
      });
      toast({ title: "Success!", description: "Doctor account created" });
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await sendOtp(patientMobile);
      setOtpSent(true);
      toast({ title: "OTP Sent!", description: "Check your mobile for the OTP" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({ title: "Error", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(patientMobile, otp);
      toast({ title: "Welcome!", description: "Login successful" });
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
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
        </div>

        {/* Login Card */}
        <Card className="p-6 bg-gradient-card shadow-medical border-0">
          <div className="space-y-6">
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={activePanel === 'doctor' ? 'default' : 'outline'}
                className="h-14 flex-col gap-1"
                onClick={() => { setActivePanel('doctor'); setDoctorMode('login'); setOtpSent(false); }}
              >
                <Stethoscope className="w-5 h-5" />
                <span className="text-xs font-medium">Doctor</span>
              </Button>
              <Button
                type="button"
                variant={activePanel === 'patient' ? 'default' : 'outline'}
                className="h-14 flex-col gap-1"
                onClick={() => { setActivePanel('patient'); setOtpSent(false); }}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Patient</span>
              </Button>
            </div>

            {/* ============ DOCTOR PANEL ============ */}
            {activePanel === 'doctor' && doctorMode === 'login' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-medical-dark">Doctor Sign In</h2>
                  <p className="text-muted-foreground">Sign in with your email and password</p>
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

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-glow"
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : 'Sign In as Doctor'}
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
              </div>
            )}

            {activePanel === 'doctor' && doctorMode === 'register' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setDoctorMode('login')} className="text-muted-foreground hover:text-primary">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-medical-dark">Create Doctor Account</h2>
                    <p className="text-sm text-muted-foreground">Register as the clinic doctor</p>
                  </div>
                </div>

                <form onSubmit={handleDoctorRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Full Name</label>
                    <Input type="text" placeholder="Dr. Full Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="h-11" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Email</label>
                    <Input type="email" placeholder="doctor@email.com" value={doctorEmail} onChange={(e) => setDoctorEmail(e.target.value)} className="h-11" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                    <Input type="tel" placeholder="10-digit mobile" value={doctorMobile} onChange={(e) => setDoctorMobile(e.target.value)} className="h-11" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Specialization</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant={doctorSpecialization === 'homeopathy' ? 'default' : 'outline'} className="h-10" onClick={() => setDoctorSpecialization('homeopathy')}>Homeopathy</Button>
                      <Button type="button" variant={doctorSpecialization === 'allopathy' ? 'default' : 'outline'} className="h-10" onClick={() => setDoctorSpecialization('allopathy')}>Allopathy</Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Password</label>
                    <Input type="password" placeholder="Min 6 characters" value={doctorPassword} onChange={(e) => setDoctorPassword(e.target.value)} className="h-11" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-medical-dark">Confirm Password</label>
                    <Input type="password" placeholder="Confirm password" value={doctorConfirmPassword} onChange={(e) => setDoctorConfirmPassword(e.target.value)} className="h-11" required />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-glow" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Doctor Account'}
                  </Button>
                </form>
              </div>
            )}

            {/* ============ PATIENT PANEL ============ */}
            {activePanel === 'patient' && !otpSent && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-medical-dark">Patient Login</h2>
                  <p className="text-muted-foreground">Enter your mobile number to receive OTP</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-medical-dark">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Enter registered mobile number"
                        value={patientMobile}
                        onChange={(e) => setPatientMobile(e.target.value)}
                        className="pl-10 h-12"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-glow" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : 'Send OTP'}
                  </Button>
                </form>

                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Only patients registered by the doctor can login.
                  </p>
                </div>
              </div>
            )}

            {activePanel === 'patient' && otpSent && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="text-muted-foreground hover:text-primary">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-medical-dark">Enter OTP</h2>
                    <p className="text-sm text-muted-foreground">Sent to {patientMobile}</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-medical-dark">6-Digit OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 h-12 text-center text-xl tracking-[0.5em] font-mono"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-glow" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Login'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline font-medium"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Didn't receive OTP? Resend
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary font-medium">Welcome to Shree Hari Clinic!</p>
              <p className="text-xs text-muted-foreground">Your trusted healthcare partner</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}