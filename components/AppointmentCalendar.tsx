
import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';
import { db } from '../services/db';

const AppointmentCalendar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [newTask, setNewTask] = useState({ title: '', time: '' });
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = async () => {
    const data = await db.getTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayTasks = tasks.filter(t => t.date === selectedDateStr);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.time) return;

    setIsLoading(true);
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      time: newTask.time,
      completed: false,
      date: selectedDateStr
    };

    const updated = await db.saveTask(task);
    setTasks(updated);
    setNewTask({ title: '', time: '' });
    setIsLoading(false);
  };

  const toggleTask = async (task: Task) => {
    const updatedTask = { ...task, completed: !task.completed };
    const updated = await db.updateTask(updatedTask);
    setTasks(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = await db.deleteTask(id);
    setTasks(updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Section */}
        <div className="flex-grow bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                Agenda de <span className="text-emerald-500">Compromissos</span>
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={handleNextMonth} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
              
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDateStr;
              const hasTasks = tasks.some(t => t.date === dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border ${
                    isSelected 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20 scale-105 z-10' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-emerald-500' : ''}`}>
                    {date.getDate()}
                  </span>
                  {hasTasks && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details Section */}
        <div className="w-full lg:w-96 bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">
              {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Compromissos do dia</p>
          </div>

          <form onSubmit={handleAddTask} className="space-y-3 mb-8">
            <input 
              type="text" 
              placeholder="Título do compromisso" 
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-white text-xs font-bold outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <input 
                type="time" 
                value={newTask.time}
                onChange={e => setNewTask({...newTask, time: e.target.value})}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-white text-xs font-bold outline-none focus:border-emerald-500"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
            {dayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-30">
                <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum agendamento</p>
              </div>
            ) : (
              dayTasks.sort((a, b) => a.time.localeCompare(b.time)).map(t => (
                <div key={t.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${t.completed ? 'bg-slate-950 border-slate-900 opacity-50' : 'bg-slate-800 border-slate-700'}`}>
                  <div className="flex items-center gap-4 overflow-hidden">
                    <button 
                      onClick={() => toggleTask(t)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 text-transparent hover:border-emerald-500'}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                    </button>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate ${t.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{t.title}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTask(t.id)}
                    className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
