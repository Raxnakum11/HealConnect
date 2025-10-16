import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-medical">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-medical-dark">HealConnect</h1>
                <p className="text-xs text-muted-foreground">Healthcare Portal</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-medical-dark">{user?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user?.role} • {user?.mobile}
                </p>
              </div>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 py-4">
              <div className="space-y-3">
                <div className="px-4">
                  <p className="font-medium text-medical-dark">{user?.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user?.role} • {user?.mobile}
                  </p>
                </div>
                <div className="px-4">
                  <Button variant="outline" onClick={logout} className="w-full gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-medical-dark">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}