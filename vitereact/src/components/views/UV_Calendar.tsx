import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarEvent {
  event_id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  description: string | null;
}

const fetchEvents = async (authToken: string): Promise<CalendarEvent[]> => {
  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/calendar_events`;
    console.log('Fetching calendar events from:', apiUrl);
    
    const { data } = await axios.get(apiUrl, { 
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Calendar events response:', data);
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('Invalid response format: events array not found');
    }
    
    return data.events.map((event: any) => ({
      event_id: event.event_id,
      title: event.title,
      start_time: new Date(event.start_time),
      end_time: new Date(event.end_time),
      description: event.description,
    }));
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const createEvent = async (
  newEvent: Omit<CalendarEvent, 'event_id'>, 
  authToken: string
): Promise<any> => {
  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/calendar_events`;
    console.log('Creating calendar event at:', apiUrl, newEvent);
    
    const { data } = await axios.post(apiUrl, newEvent, { 
      headers: { 
        Authorization: `Bearer ${authToken}`, 
        'Content-Type': 'application/json' 
      },
      timeout: 10000
    });
    
    console.log('Event creation response:', data);
    return data;
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const UV_Calendar: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'event_id'>>({
    title: '',
    start_time: new Date(),
    end_time: new Date(),
    description: null,
  });

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['calendarEvents', authToken],
    queryFn: () => fetchEvents(authToken!),
    enabled: !!authToken
  });

  const mutation = useMutation({
    mutationFn: (newEvent: Omit<CalendarEvent, 'event_id'>) => createEvent(newEvent, authToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendarEvents', authToken] }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Calendar error:', error);
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Calendar</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error loading events:</strong> {error.message || 'Unknown error occurred'}
          <br />
          <small>Please check your connection and try refreshing the page.</small>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(newEvent);
    setNewEvent({ title: '', start_time: new Date(), end_time: new Date(), description: null });
  };

  const handleChange = (key: keyof CalendarEvent, value: any) => {
    setNewEvent(prev => ({ ...prev, [key]: value }));
  };

  const localizer = momentLocalizer(moment);

  return (
    <>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Calendar</h1>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start_time"
          endAccessor="end_time"
          titleAccessor="title"
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent}
        />

        <form onSubmit={handleSaveEvent} className="mt-6">
          <div className="space-y-4">
            <input
              type="text"
              value={newEvent.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Event Title"
              className="border py-2 px-3 rounded w-full"
              required
              aria-label="Event Title"
            />
            <input
              type="datetime-local"
              value={moment(newEvent.start_time).format('YYYY-MM-DDTHH:mm')}
              onChange={e => handleChange('start_time', new Date(e.target.value))}
              className="border py-2 px-3 rounded w-full"
              aria-label="Start Time"
            />
            <input
              type="datetime-local"
              value={moment(newEvent.end_time).format('YYYY-MM-DDTHH:mm')}
              onChange={e => handleChange('end_time', new Date(e.target.value))}
              className="border py-2 px-3 rounded w-full"
              aria-label="End Time"
            />
            <textarea
              value={newEvent.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Description (Optional)"
              className="border py-2 px-3 rounded w-full"
              aria-label="Description"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Add Event'}
          </button>
        </form>

        {selectedEvent && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
            <p>Start: {selectedEvent.start_time.toLocaleString()}</p>
            <p>End: {selectedEvent.end_time.toLocaleString()}</p>
            <p>Description: {selectedEvent.description}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_Calendar;