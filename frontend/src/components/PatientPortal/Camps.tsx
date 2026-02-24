import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar as CalendarIcon, Clock, Heart, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Camp {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  organizer: string;
  description: string;
  type: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface CampsProps {
  camps: Camp[];
  registerForCamp: (campId: string) => void;
}

export default function Camps({ camps, registerForCamp }: CampsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'ongoing': return <Heart className="h-4 w-4" />;
      case 'completed': return <CalendarIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getCapacityColor = (registered: number, capacity: number) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Health Camps</h2>
        <Badge variant="outline" className="w-fit">
          {camps.filter(camp => camp.status === 'upcoming').length} Upcoming
        </Badge>
      </div>

      <div className="grid gap-4">
        {camps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No health camps available</p>
              <p className="text-sm text-gray-400 text-center mt-2">
                Check back later for upcoming health camps in your area
              </p>
            </CardContent>
          </Card>
        ) : (
          camps.map((camp) => (
            <Card key={camp.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{camp.title}</CardTitle>
                  <Badge className={getStatusColor(camp.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(camp.status)}
                      {camp.status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{camp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(camp.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{camp.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Organized by {camp.organizer}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{camp.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm font-medium ${getCapacityColor(camp.registered, camp.capacity)}`}>
                        {camp.registered}/{camp.capacity} registered
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {camp.type}
                    </Badge>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((camp.registered / camp.capacity) * 100, 100)}%` }}
                    />
                  </div>

                  {camp.status === 'upcoming' && camp.registered < camp.capacity && (
                    <Button 
                      onClick={() => registerForCamp(camp.id)}
                      className="w-full"
                    >
                      Register for Camp
                    </Button>
                  )}

                  {camp.status === 'upcoming' && camp.registered >= camp.capacity && (
                    <Button disabled className="w-full">
                      Camp Full
                    </Button>
                  )}

                  {camp.status === 'ongoing' && (
                    <Button variant="outline" className="w-full" disabled>
                      Camp in Progress
                    </Button>
                  )}

                  {camp.status === 'completed' && (
                    <Button variant="secondary" className="w-full" disabled>
                      Camp Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
