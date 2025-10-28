import { useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { getEventColor, getEventLocation } from '../services/calendar.service';

export function CalendarPage() {
  const calendarRef = useRef<any>(null);
  const navigate = useNavigate();
  
  // ============ ESTADO DEL STORE ============
  const view = useAppStore(state => state.view);
  const dateRangeStart = useAppStore(state => state.dateRange.start);
  const dateRangeEnd = useAppStore(state => state.dateRange.end);
  const dateRangeAnchor = useAppStore(state => state.dateRange.anchor);
  const goToToday = useAppStore(state => state.goToToday);
  const goToNext = useAppStore(state => state.goToNext);
  const goToPrevious = useAppStore(state => state.goToPrevious);
  const setView = useAppStore(state => state.setView);

  // ============ DATOS DEL CALENDARIO ============
  // Usar el custom hook en lugar de llamar directamente a la API
  const { events, loading, error, refetch } = useCalendarEvents();

  // ============ TÍTULO DINÁMICO DEL MES/RANGO ============
  const calendarTitle = useMemo(() => {
    const anchor = new Date(dateRangeAnchor);
    
    if (view === 'month') {
      // Formato: "Octubre 2025"
      return anchor.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      // Formato: "1 - 7 de Octubre 2025" o "28 Oct - 3 Nov 2025"
      const start = new Date(dateRangeStart);
      const end = new Date(dateRangeEnd);
      
      const sameMonth = start.getMonth() === end.getMonth();
      
      if (sameMonth) {
        return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      } else {
        return `${start.getDate()} ${start.toLocaleDateString('es-ES', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
      }
    }
  }, [view, dateRangeStart, dateRangeEnd, dateRangeAnchor]);

  // ============ CONVERTIR EVENTOS PARA FULLCALENDAR ============
  const calendarEvents = events.map(event => ({
    id: event.id.toString(),
    title: event.name,
    start: `${event.date}T${event.scheduleFrom}`,
    end: `${event.date}T${event.scheduleTo}`,
    backgroundColor: getEventColor(event),
    borderColor: getEventColor(event),
    textColor: '#fff',
    extendedProps: {
      department: event.department?.name,
      space: event.space?.name,
      location: getEventLocation(event),
      status: event.status,
      priority: event.priority,
      internal: event.internal
    }
  }));

  // ============ HANDLERS ============

  const handleEventClick = useCallback((info: any) => {
    const eventId = parseInt(info.event.id);
    // Navegar a detalle del evento
    navigate(`/events/${eventId}`);
  }, [navigate]);

  const handleDateClick = useCallback((info: any) => {
    // Crear nuevo evento en esa fecha
    navigate(`/events/new?date=${info.dateStr}`);
  }, [navigate]);

  const handleViewChange = useCallback((newView: 'month' | 'week') => {
    setView(newView);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (newView === 'month') {
        calendarApi.changeView('dayGridMonth');
      } else {
        calendarApi.changeView('timeGridWeek');
      }
    }
  }, [setView]);

  return (
    <div className="space-y-6">
      {/* Error handling */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Error al cargar eventos</p>
                  <p className="text-xs text-red-600">
                    {typeof error === 'string' ? error : error.message || 'Error desconocido'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header con controles */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Calendario de Eventos
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1 capitalize">
                {calendarTitle}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Navegación de fecha */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={goToToday}
                  className="h-9 px-4"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Hoy
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Selector de vista */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-md p-1">
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('month')}
                  className="h-7 px-3 text-xs"
                >
                  Mes
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('week')}
                  className="h-7 px-3 text-xs"
                >
                  Semana
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="calendar-wrapper">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view === 'month' ? 'dayGridMonth' : 'timeGridWeek'}
              headerToolbar={{
                left: '',
                center: '',
                right: ''
              }}
              locale="es"
              firstDay={1} // Lunes como primer día
              height="auto"
              events={calendarEvents}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Lun-Vie
                startTime: '08:00',
                endTime: '18:00',
              }}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              nowIndicator={true}
              loading={(isLoading) => {
                // FullCalendar callback - no action needed as we handle loading state separately
              }}
              eventContent={renderEventContent}
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de colores */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Leyenda de Prioridades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-slate-600">Prioridad Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-600">Prioridad Media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-600">Prioridad Baja</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="text-sm text-slate-600">Sin prioridad</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de carga */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-slate-600">Cargando eventos...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Renderizado personalizado de eventos
function renderEventContent(eventInfo: any) {
  const location = eventInfo.event.extendedProps.location;
  
  return (
    <div className="fc-event-content-custom">
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title font-medium">{eventInfo.event.title}</div>
      {location && (
        <div className="fc-event-location text-xs opacity-80">
          📍 {location}
        </div>
      )}
    </div>
  );
}

