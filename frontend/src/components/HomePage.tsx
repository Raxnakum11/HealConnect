import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MapPin, Phone, Mail, Clock, Award, Calendar, Pill } from 'lucide-react';
import { LoginSignupDialog } from '@/components/LoginSignupDialog';

export function HomePage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-blue-100/30 to-blue-300/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/10 via-transparent to-blue-100/20"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-medical sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-full shadow-glow">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-medical-dark">HealConnect</h1>
                <p className="text-sm text-primary font-medium">by Shree Hari Clinic</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowLoginDialog(true)}
              variant="medical" 
              className="px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-blue-100/50 to-blue-300/30 rounded-3xl backdrop-blur-sm border border-blue-300/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300/25 via-blue-200/15 to-blue-400/20 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-100/20 to-blue-200/30 rounded-3xl"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-medical-dark">HealConnect</h1>
                    <p className="text-primary font-semibold">Digital Healthcare Platform</p>
                  </div>
                </div>
                
                <h2 className="text-5xl lg:text-6xl font-bold text-medical-dark leading-tight">
                  Shree Hari<br />
                  <span className="text-primary">Clinic</span>
                </h2>
                
                <p className="text-2xl text-muted-foreground font-semibold">
                  Skin, Child & Homeo Care
                </p>
                
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Experience modern healthcare with our comprehensive digital platform. 
                  Connect with Dr. Himanshu Sonagara for expert medical care and personalized treatment.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  variant="medical" 
                  size="lg" 
                  className="px-8 py-6 text-lg font-semibold shadow-glow"
                >
                  Get Started Today
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-8 py-6 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Learn More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-medical-dark">About Shree Hari Clinic</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-3">Our Services</h3>
                          <ul className="space-y-2 text-sm">
                            <li>• Comprehensive Skin Care Treatment</li>
                            <li>• Pediatric Healthcare Services</li>
                            <li>• Homeopathic Medicine & Treatment</li>
                            <li>• Digital Health Monitoring</li>
                            <li>• Regular Health Camps</li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-3">Why Choose Us?</h3>
                          <ul className="space-y-2 text-sm">
                            <li>• 15+ Years of Experience</li>
                            <li>• Modern Digital Platform</li>
                            <li>• Personalized Treatment Plans</li>
                            <li>• 24/7 Digital Access</li>
                            <li>• Professional Healthcare Team</li>
                          </ul>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-primary mb-3">HealConnect Platform Features</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium">For Patients</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Online Appointment Booking</li>
                              <li>• Medicine Reminders</li>
                              <li>• Health Records Access</li>
                              <li>• Camp Notifications</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium">For Doctors</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Patient Management</li>
                              <li>• Digital Prescriptions</li>
                              <li>• Inventory Management</li>
                              <li>• Camp Organization</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium">Digital Benefits</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Paperless Records</li>
                              <li>• Real-time Updates</li>
                              <li>• Secure Data Storage</li>
                              <li>• Easy Communication</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-200/50 via-blue-100/60 to-blue-300/40 rounded-3xl p-8 backdrop-blur-sm border border-blue-300/40 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-medical-dark">Easy Booking</h3>
                    <p className="text-sm text-muted-foreground">Schedule appointments online</p>
                  </Card>
                  
                  <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-medical-dark">Expert Care</h3>
                    <p className="text-sm text-muted-foreground">Professional treatment</p>
                  </Card>
                  
                  <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-medical-dark">Digital Prescriptions</h3>
                    <p className="text-sm text-muted-foreground">Manage medicines and reminders digitally</p>
                  </Card>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Information */}
      <section className="container mx-auto px-4 py-16 relative">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/60 via-blue-50/70 to-blue-200/40 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-3xl"></div>
        <div className="relative grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Doctor Information */}
          <Card className="p-8 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-xl border border-blue-200/20 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-medical-dark mb-2">Dr. Himanshu Sonagara</h3>
              <p className="text-primary font-semibold text-lg">B.H.M.S</p>
              <p className="text-muted-foreground">Reg. No: G - 28048</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-medium">9723996594</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">drhimanshusonagara@gmail.com</span>
              </div>
            </div>
          </Card>

          {/* Clinic Information */}
          <Card className="p-8 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-xl border border-blue-200/20 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-medical-dark mb-2">Visit Our Clinic</h3>
              <p className="text-primary font-semibold">Modern Healthcare Facility</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm leading-relaxed">
                    11/2, opp. Rajwadi Party Plot, Shanti Nagar Society, Vibhag-2, 
                    Sweet Home Society, Amroli, Surat, Gujarat - 394210
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">Open Daily • Consultation Available</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16 relative">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-200/50 via-blue-100/40 to-blue-50/30 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 to-blue-100/30 rounded-3xl"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-medical-dark mb-12">Our Services</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-white via-blue-50/20 to-white shadow-xl border border-blue-200/20 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-medical-dark mb-2">Skin Care</h3>
              <p className="text-muted-foreground">Comprehensive dermatological treatments and skin health solutions</p>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-white via-blue-50/20 to-white shadow-xl border border-blue-200/20 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-medical-dark mb-2">Child Care</h3>
              <p className="text-muted-foreground">Pediatric healthcare services for your little ones' wellbeing</p>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-white via-blue-50/20 to-white shadow-xl border border-blue-200/20 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-medical-dark mb-2">Homeopathy</h3>
              <p className="text-muted-foreground">Natural healing solutions with homeopathic medicine</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Login/Signup Dialog */}
      <LoginSignupDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
      </div>
    </div>
  );
}