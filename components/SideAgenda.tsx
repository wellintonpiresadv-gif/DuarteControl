
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { db } from '../services/db';

interface SideAgendaProps {
  onClose: () => void;
}

const SideAgenda: React.FC<SideAgendaProps> = ({ onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', time: '' });
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = async () => {
    const data = await db.getTasks();
    // Filter for today's tasks or just show all for now
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.time) return;

    setIsLoading(true);
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      time: newTask.time,
      completed: false,
      date: new Date().toISOString().split('T')[0]
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
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-[70] animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-black text-white uppercase tracking-tighter">Agenda <span className="text-emerald-500">Eletrônica</span></h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
        <form onSubmit={handleAddTask} className="space-y-3">
          <input 
            type="text" 
            placeholder="O que fazer?" 
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <input 
              type="time" 
              value={newTask.time}
              onChange={e => setNewTask({...newTask, time: e.target.value})}
              className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarefas de Hoje</p>
          {tasks.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic uppercase font-bold text-center py-4">Nenhuma tarefa agendada</p>
          ) : (
            tasks.sort((a, b) => a.time.localeCompare(b.time)).map(t => (
              <div key={t.id} className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${t.completed ? 'bg-slate-950 border-slate-900 opacity-50' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={() => toggleTask(t)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 text-transparent hover:border-emerald-500'}`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                  </button>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-bold truncate ${t.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{t.title}</p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(t.id)}
                  className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-950 border-t border-slate-800">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">DuarteControl Agenda</p>
      </div>
    </div>
  );
};

export default SideAgenda;
