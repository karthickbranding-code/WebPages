import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Star, 
  Send, 
  FileText, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Search, 
  Bell, 
  Settings, 
  LayoutGrid, 
  Database, 
  Layers, 
  Calendar, 
  Clock, 
  Users, 
  Monitor, 
  PieChart, 
  User, 
  LogOut,
  Plus,
  Archive,
  MoreVertical,
  Mic,
  Play,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Report {
  id: string;
  sender: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  tags: string; // JSON string from DB
  metadata: string; // JSON string from DB
  is_starred: number;
  is_archived: number;
  created_at: string;
}

export default function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async (id: string, current: number) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: current === 0 ? 1 : 0 })
      });
      fetchReports();
      showToast(current === 0 ? 'Report starred' : 'Report unstarred');
    } catch (error) {
      console.error('Failed to toggle star:', error);
      showToast('Failed to update report', 'error');
    }
  };

  const archiveReport = async (id: string, current: number) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: current === 0 ? 1 : 0 })
      });
      fetchReports();
      showToast(current === 0 ? 'Report moved to bin' : 'Report restored');
    } catch (error) {
      console.error('Failed to archive report:', error);
      showToast('Failed to update report', 'error');
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'DELETE'
      });
      fetchReports();
      if (selectedReport?.id === id) setSelectedReport(null);
      showToast('Report permanently deleted');
    } catch (error) {
      console.error('Failed to delete report:', error);
      showToast('Failed to delete report', 'error');
    }
  };

  const generateReport = async () => {
    const types = [
      { 
        type: 'Predict AI', 
        sender: 'YodaEdge AI Engine', 
        title: 'Anomaly Detected', 
        content: 'New anomaly detected in Machine 402. Vibration levels exceeding threshold. Immediate inspection recommended.',
        priority: 'High',
        metadata: { machine_id: 'M-402', location: 'Floor 1, Zone A' }
      },
      { 
        type: 'Voice', 
        sender: 'Jedi Master Yoda', 
        title: 'Force Message', 
        content: 'A disturbance in the production flow, I sense. Check the assembly line, you must.',
        priority: 'Normal',
        metadata: { audio_url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Patience+you+must+have&filename=mt/MTI5NzY0MTI5NzY0MTY0_Patience_you_must_have.mp3', duration: '0:15' }
      },
      { 
        type: 'Data Bridge', 
        sender: 'Quality AI', 
        title: 'Batch Report', 
        content: 'Batch #1024 analysis completed with 99.9% yield. Detailed metrics available in the attached Excel file.',
        priority: 'Normal',
        metadata: { file_type: 'Excel', file_name: 'batch_1024_quality.xlsx' }
      },
      { 
        type: 'Alert', 
        sender: 'Safety Monitor', 
        title: 'Safety Warning', 
        content: 'Personnel detected in restricted zone 4B without proper clearance. Safety protocols initiated.',
        priority: 'High',
        metadata: { alert_type: 'Unauthorized Access', location: 'Zone 4B' }
      },
      { 
        type: 'Voice', 
        sender: 'Jedi Master Mace Windu', 
        title: 'Security Directive', 
        content: 'This party is over. Secure the perimeter and ensure all droids are deactivated immediately.',
        priority: 'High',
        metadata: { audio_url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=This+party+is+over&filename=mt/MTI5NzY0MTI5NzY0MTY0_This_party_is_over.mp3', duration: '0:08' }
      }
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];

    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      sender: randomType.sender,
      title: randomType.title,
      content: randomType.content,
      type: randomType.type,
      priority: randomType.priority,
      status: 'Unread',
      tags: [randomType.type, 'Auto-Generated'],
      metadata: randomType.metadata
    };

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'yoda-edge-secret-key'
        },
        body: JSON.stringify(newReport)
      });
      fetchReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const [listSearchQuery, setListSearchQuery] = useState('');

  const filteredReports = reports.filter(r => {
    const combinedSearch = (searchQuery + ' ' + listSearchQuery).trim().toLowerCase();
    const matchesSearch = r.sender.toLowerCase().includes(combinedSearch) || 
                         r.content.toLowerCase().includes(combinedSearch) ||
                         r.title.toLowerCase().includes(combinedSearch);
    
    // Handle Bin tab separately
    if (activeTab === 'Bin') {
      return matchesSearch && r.is_archived === 1;
    }

    // Other tabs only show non-archived reports
    if (r.is_archived === 1) return false;

    if (activeTab === 'Daily Reports') return matchesSearch;
    if (activeTab === 'Action to take') return matchesSearch && r.priority === 'High';
    if (activeTab === 'Important') return matchesSearch && r.is_starred === 1;
    if (activeTab === 'Alerts') return matchesSearch && r.type === 'Alert';
    return matchesSearch;
  });

  const getMetadata = (report: Report) => {
    try {
      return report.metadata ? JSON.parse(report.metadata) : {};
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-8 gap-8 z-20 flex-shrink-0">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
          <LayoutGrid size={24} />
        </div>
        
        <nav className="flex flex-col gap-6 text-gray-400">
          <SidebarIcon icon={<Database size={22} />} label="Database" />
          <SidebarIcon icon={<Layers size={22} />} label="AI Stacks" />
          <SidebarIcon icon={<Star size={22} />} label="Favorites" />
          <SidebarIcon icon={<Inbox size={22} />} label="Repo Box" active />
          <SidebarIcon icon={<Monitor size={22} />} label="Multi Window" />
          <SidebarIcon icon={<FileText size={22} />} label="Scribing Pad" />
          <SidebarIcon icon={<Calendar size={22} />} label="Calendar" />
          <SidebarIcon icon={<Clock size={22} />} label="Time Logs" />
          <SidebarIcon icon={<Users size={22} />} label="Directory" />
          <SidebarIcon icon={<PieChart size={22} />} label="Dash Board" />
        </nav>

        <div className="mt-auto flex flex-col gap-6 text-gray-400">
          <SidebarIcon icon={<Settings size={22} />} label="Settings" />
          <SidebarIcon icon={<LogOut size={22} />} label="Logout" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-gray-50 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex justify-center">
              {reports.filter(r => r.priority === 'High').length > 0 ? (
                <div className="bg-brand-blue text-white px-6 py-2 rounded-full flex items-center gap-3 text-sm font-medium animate-pulse shadow-lg shadow-brand-blue/20">
                  <Play size={14} fill="currentColor" />
                  <span>Announcement : {reports.filter(r => r.priority === 'High')[0].sender} | {reports.filter(r => r.priority === 'High')[0].title} | Action Required |</span>
                </div>
              ) : (
                <div className="bg-emerald-500 text-white px-6 py-2 rounded-full flex items-center gap-3 text-sm font-medium shadow-lg shadow-emerald-500/20">
                  <CheckSquare size={14} />
                  <span>All Systems Operational | No Critical Alerts |</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-brand-blue transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">9</span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Karthick S</p>
                <p className="text-xs text-gray-400">Chief Engineer</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <img src="https://picsum.photos/seed/karthick/100/100" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Inbox Sidebar */}
          <div className="w-72 flex flex-col gap-6 flex-shrink-0 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <button 
                onClick={generateReport}
                className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 active:scale-95 mb-6"
              >
                <Plus size={20} />
                Generate Report
              </button>

              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">My Reports</p>
                <NavItem icon={<Inbox size={18} />} label="Daily Reports" count={reports.filter(r => r.is_archived === 0).length} active={activeTab === 'Daily Reports'} onClick={() => setActiveTab('Daily Reports')} />
                <NavItem icon={<CheckSquare size={18} />} label="Action to take" count={reports.filter(r => r.priority === 'High' && r.is_archived === 0).length} active={activeTab === 'Action to take'} onClick={() => setActiveTab('Action to take')} />
                <NavItem icon={<Send size={18} />} label="Shared Reports" count={0} active={activeTab === 'Shared Reports'} onClick={() => setActiveTab('Shared Reports')} />
                <NavItem icon={<FileText size={18} />} label="Draft" count={0} active={activeTab === 'Draft'} onClick={() => setActiveTab('Draft')} />
                <NavItem icon={<AlertTriangle size={18} />} label="Alerts" count={reports.filter(r => r.type === 'Alert' && r.is_archived === 0).length} active={activeTab === 'Alerts'} onClick={() => setActiveTab('Alerts')} />
                <NavItem icon={<Star size={18} />} label="Important" count={reports.filter(r => r.is_starred === 1 && r.is_archived === 0).length} active={activeTab === 'Important'} onClick={() => setActiveTab('Important')} />
                <NavItem icon={<Trash2 size={18} />} label="Bin" count={reports.filter(r => r.is_archived === 1).length} active={activeTab === 'Bin'} onClick={() => setActiveTab('Bin')} />
              </div>

              <div className="mt-8 space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Label</p>
                <LabelItem color="bg-emerald-400" label="Trust AI Reports" />
                <LabelItem color="bg-brand-blue" label="Predict AI Reports" />
                <LabelItem color="bg-orange-400" label="To-Do Lists" />
                <LabelItem color="bg-purple-400" label="Data Bridge Reports" />
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-brand-blue transition-colors mt-2">
                  <Plus size={16} />
                  <span>Create New Label</span>
                </button>
              </div>
            </div>
          </div>

          {/* Report List */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* List Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search mail" 
                    className="w-full bg-gray-50 border-none rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-1 focus:ring-brand-blue/20 outline-none"
                    value={listSearchQuery}
                    onChange={(e) => setListSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HeaderAction icon={<Archive size={18} />} />
                <HeaderAction icon={<Info size={18} />} />
                <HeaderAction icon={<Trash2 size={18} />} />
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <HeaderAction icon={<MoreVertical size={18} />} />
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                  <Inbox size={48} strokeWidth={1} />
                  <p>No reports found in this category</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {filteredReports.map((report) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={report.id}
                        className={`group border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer ${report.status === 'Unread' ? 'report-row-unread' : 'report-row-read'}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="py-4 pl-6 w-12">
                          <input type="checkbox" className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue/20" onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td className="py-4 w-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(report.id, report.is_starred);
                            }}
                            className={`transition-colors ${report.is_starred ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
                          >
                            <Star size={18} fill={report.is_starred ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="py-4 px-4 w-48 truncate">
                          <span className="text-sm text-gray-900">{report.sender}</span>
                        </td>
                        <td className="py-4 px-4 w-32">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getTagStyle(report.type)}`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-clamp-1">
                              {report.content}
                            </span>
                            {report.priority === 'High' && (
                              <span className="text-[10px] font-bold text-red-500 whitespace-nowrap">| Action Urgently Required</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 w-24 text-right">
                          <span className="text-xs text-gray-400">{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="py-4 pr-6 w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); archiveReport(report.id, report.is_archived); }} 
                              className={`hover:text-brand-blue transition-colors ${report.is_archived ? 'text-brand-blue' : 'text-gray-400'}`}
                              title={report.is_archived ? "Unarchive" : "Archive"}
                            >
                              <Archive size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }} 
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* List Footer */}
            <div className="p-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 bg-gray-50/30 flex-shrink-0">
              <span>Showing 1-{filteredReports.length} of {reports.length}</span>
              <div className="flex items-center gap-4">
                <button className="p-1 hover:bg-white rounded transition-colors"><ChevronLeft size={16} /></button>
                <button className="p-1 hover:bg-white rounded transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                    {selectedReport.type === 'Voice' ? <Mic size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedReport.sender}</h2>
                    <p className="text-sm text-gray-400">{selectedReport.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><Star size={20} /></button>
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><Archive size={20} /></button>
                  <button onClick={() => setSelectedReport(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><Plus className="rotate-45" size={24} /></button>
                </div>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getTagStyle(selectedReport.type)}`}>
                    {selectedReport.type}
                  </span>
                  {selectedReport.priority === 'High' && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">High Priority</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(selectedReport.created_at).toLocaleString()}</span>
                </div>

                {/* Machine Info if available */}
                {getMetadata(selectedReport).machine_id && (
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Machine ID</p>
                      <p className="text-sm font-bold text-gray-900">{getMetadata(selectedReport).machine_id}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Location</p>
                      <p className="text-sm font-bold text-gray-900">{getMetadata(selectedReport).location}</p>
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {selectedReport.content}
                  </p>
                </div>

                {/* Voice Message Simulation */}
                {selectedReport.type === 'Voice' && (
                  <div className="mb-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                      >
                        {isPlaying ? <div className="w-3 h-3 bg-white" /> : <Play size={20} fill="currentColor" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-600">Voice Announcement</span>
                          <span className="text-xs text-emerald-400">{getMetadata(selectedReport).duration || '0:15'}</span>
                        </div>
                        <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isPlaying ? '100%' : '0%' }}
                            transition={{ duration: 15, ease: 'linear' }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Excel/File Attachment Simulation */}
                {getMetadata(selectedReport).file_name && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{getMetadata(selectedReport).file_name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{getMetadata(selectedReport).file_type} Attachment</p>
                      </div>
                    </div>
                    <button className="text-brand-blue text-sm font-bold hover:underline">Download</button>
                  </div>
                )}

                {/* Dashboard Link Simulation */}
                {getMetadata(selectedReport).dashboard_url && (
                  <div className="mb-8 p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider">Live Dashboard</h3>
                      <Monitor size={18} className="text-brand-blue" />
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer">
                      <img src="https://picsum.photos/seed/dashboard/600/400" className="w-full h-full object-cover opacity-50" alt="Dashboard Preview" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white text-brand-blue px-4 py-2 rounded-lg font-bold shadow-lg group-hover:scale-105 transition-transform">
                          Open Live Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport.type === 'Predict AI' && (
                  <div className="mt-8 p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                    <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-4">AI Insight</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-blue w-[85%]" />
                      </div>
                      <span className="font-bold">85% Confidence</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 italic">
                      "Based on historical patterns, this bearing behavior precedes failure within 48 operational hours. Recommended action: Lubrication check and vibration analysis."
                    </p>
                  </div>
                )}

                <div className="mt-8 flex items-center gap-4">
                  <button 
                    onClick={() => {
                      showToast('Action initiated for ' + selectedReport.sender);
                      setSelectedReport(null);
                    }}
                    className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-semibold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                  >
                    Take Action
                  </button>
                  <button 
                    onClick={() => showToast('Sharing report...')}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Share Report
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex items-center gap-4 flex-shrink-0">
                <div className="flex-1 relative">
                  <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-brand-blue transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Add a comment or voice note..." 
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  />
                </div>
                <button className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-brand-blue transition-all">
                  <Plus size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckSquare size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarIcon({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`relative group cursor-pointer p-2 rounded-xl transition-all ${active ? 'text-brand-blue bg-brand-blue/5' : 'hover:text-brand-blue hover:bg-gray-50'}`}>
      {icon}
      <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {label}
      </div>
    </div>
  );
}

function NavItem({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count: number, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
        {count}
      </span>
    </button>
  );
}

function LabelItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-xl cursor-pointer transition-all">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function HeaderAction({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-blue rounded-lg transition-all">
      {icon}
    </button>
  );
}

function getTagStyle(type: string) {
  switch (type) {
    case 'Data Bridge': return 'bg-emerald-100 text-emerald-600';
    case 'Predict AI': return 'bg-brand-blue/10 text-brand-blue';
    case 'Alert': return 'bg-red-100 text-red-600';
    case 'Security': return 'bg-orange-100 text-orange-600';
    case 'System': return 'bg-purple-100 text-purple-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}
