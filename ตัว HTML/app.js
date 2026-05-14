import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Activity, Bed, Baby, Smile, HeartPulse, Leaf, 
  ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Share2, ShieldCheck, Settings
} from 'lucide-react';

const App = () => {
  // เปลี่ยนค่า Default API URL ไปที่รูทหลักตามที่ระบุ
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('hosxp_api_url') || "http://127.0.0.1:9200/");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateTime, setUpdateTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const fetchData = useCallback(async (targetUrl = apiUrl) => {
    setLoading(true);
    try {
      // ปรับแต่ง URL ให้ถูกต้อง (ตรวจสอบว่ามี /api/dashboard/main ต่อท้ายหรือไม่ หาก URL ที่ระบุมาเป็นแค่ Root)
      // แต่ในที่นี้จะลองเรียกตามที่ระบุตรงๆ ก่อน หากไม่ได้ผลจะลองต่อ Path มาตรฐาน
      let fetchUrl = targetUrl;
      if (fetchUrl === "http://127.0.0.1:9200/") {
        fetchUrl = "http://192.168.110.11:9200/";
      }

      const finalUrl = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}`;
      
      const response = await fetch(finalUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`เซิร์ฟเวอร์ตอบกลับด้วยสถานะ: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
      setUpdateTime(new Date());
      
    } catch (err) {
      console.error("Fetch Error Detail:", err);
      let errorMsg = "ไม่สามารถดึงข้อมูลได้: ";
      
      if (err.message.includes('Failed to fetch')) {
        errorMsg += "การเชื่อมต่อถูกปฏิเสธ (CORS/Mixed Content) กรุณาตรวจสอบว่า API รันอยู่ที่ " + targetUrl;
      } else {
        errorMsg += err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 300000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSaveSettings = () => {
    setApiUrl(tempUrl);
    setShowSettings(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold animate-pulse uppercase tracking-[0.2em] text-xs text-center">
          กำลังพยายามเชื่อมต่อ API<br/>
          <span className="text-[9px] font-normal text-slate-400 mt-2 block">{apiUrl}</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-rose-100 max-w-lg w-full text-center">
          <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-rose-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">API Fetch Failed</h2>
          <div className="bg-slate-50 p-4 rounded-2xl mb-6 text-left border border-slate-100 overflow-hidden">
            <p className="text-rose-600 text-xs font-bold mb-1 italic uppercase">Error Message:</p>
            <p className="text-slate-500 text-[11px] font-mono leading-relaxed break-words">{error}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => fetchData()} className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <RefreshCw size={18} /> ลองใหม่
              </button>
              <button onClick={() => setShowSettings(true)} className="bg-slate-100 text-slate-600 font-bold p-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                <Settings size={22} />
              </button>
            </div>
            
            <div className="text-left text-[11px] text-slate-400 space-y-2 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="font-bold text-blue-800">💡 วิธีแก้ไขเบื้องต้น:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>เปิด Terminal แล้วรัน API: <code className="bg-white px-1">uvicorn hosxp_api:app --port 9200</code></li>
                <li>ตรวจสอบ Path ใน <code className="bg-white px-1">hosxp_api.py</code> ว่า Endpoint คืออะไร</li>
                <li>ลองใช้ IP เครื่องคุณแทน 127.0.0.1 ในหน้าตั้งค่า</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-black mb-4">ตั้งค่า API Endpoint</h3>
              <p className="text-xs text-slate-500 mb-4">ระบุ URL ของ hosxp_api.py ที่รันอยู่บนเครื่องของคุณ</p>
              <input 
                type="text" 
                value={tempUrl} 
                onChange={(e) => setTempUrl(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-xl p-4 text-sm font-mono mb-6 outline-none focus:ring-2 ring-blue-500"
                placeholder="http://127.0.0.1:9200/"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowSettings(false)} className="flex-1 font-bold text-slate-400 py-3">ยกเลิก</button>
                <button onClick={handleSaveSettings} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg">บันทึก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const deptConfigs = [
    { id: 'opd', name: 'OPD (ผู้ป่วยนอก)', color: '#3b82f6', icon: <Users size={20} />, dataKey: 'opd', currentKey: 'opd_current' },
    { id: 'er', name: 'ER (ฉุกเฉิน)', color: '#ef4444', icon: <Activity size={20} />, dataKey: 'er', currentKey: 'er_current' },
    { id: 'ipd', name: 'IPD (ผู้ป่วยใน)', color: '#8b5cf6', icon: <Bed size={20} />, dataKey: 'ipd', currentKey: 'ipd_current' },
    { id: 'birth', name: 'LR (ห้องคลอด)', color: '#ec4899', icon: <Baby size={20} />, dataKey: 'birth', currentKey: 'birth_current' },
    { id: 'dental', name: 'ทันตกรรม', color: '#f59e0b', icon: <Smile size={20} />, dataKey: 'dental', currentKey: 'dental_current' },
    { id: 'rehab', name: 'กายภาพบำบัด', color: '#10b981', icon: <HeartPulse size={20} />, dataKey: 'rehab', currentKey: 'rehab_current' },
    { id: 'ttm', name: 'การแพทย์แผนไทย', color: '#059669', icon: <Leaf size={20} />, dataKey: 'ttm', currentKey: 'ttm_current' },
    { id: 'refer', name: 'Refer Out', color: '#6366f1', icon: <Share2 size={20} />, dataKey: 'refer', currentKey: 'refer_current' },
    { id: 'death', name: 'Death (เสียชีวิต)', color: '#4b5563', icon: <AlertCircle size={20} />, dataKey: 'death', currentKey: 'death_current' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> HOSXP-API LIVE
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Medical Stats</h1>
            </div>
            <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">
              Update: {updateTime.toLocaleTimeString()} • {data.selected_month || 'N/A'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
              <Settings size={20} />
            </button>
            <button onClick={() => fetchData()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
            </button>
          </div>
        </header>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deptConfigs.map((dept) => {
            const trendData = data[dept.dataKey] || [];
            const currentVal = data[dept.currentKey] || 0;
            const lastVal = trendData.length > 1 ? trendData[trendData.length - 2].total : 0;
            const diff = lastVal > 0 ? ((currentVal - lastVal) / lastVal * 100).toFixed(1) : 0;
            const isUp = currentVal >= lastVal;

            return (
              <div key={dept.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110" style={{ backgroundColor: dept.color, boxShadow: `0 10px 25px ${dept.color}33` }}>
                      {dept.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{dept.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Hospital Data</p>
                    </div>
                  </div>
                  <div className={`flex items-center text-[10px] font-black px-4 py-2 rounded-2xl ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {Math.abs(diff)}%
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-3 tabular-nums">
                    {currentVal.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Patients This Month</p>
                </div>

                <div className="h-24 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id={`grad-${dept.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={dept.color} stopOpacity={0.4}/>
                          <stop offset="100%" stopColor={dept.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month_name" hide />
                      <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="total" stroke={dept.color} strokeWidth={4} fill={`url(#grad-${dept.id})`} animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-20 mb-10 text-center border-t border-slate-100 pt-10">
          <p className="text-[10px] text-slate-300 font-black tracking-[0.5em] uppercase">
            HOSxP API Node Gateway • API: {apiUrl}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;