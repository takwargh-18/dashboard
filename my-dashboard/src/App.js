import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Activity, Bed, Baby, Smile, HeartPulse, Leaf, 
  RefreshCw, AlertCircle, Settings, Database, ChevronRight, 
  ClipboardList, Stethoscope, Truck
} from 'lucide-react';

const App = () => {
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('hosxp_base_url') || "http://127.0.0.1:8000");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateTime, setUpdateTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(baseUrl);

  const fetchData = useCallback(async (targetBase = baseUrl) => {
    setLoading(true);
    try {
      const cleanBase = targetBase.replace(/\/$/, "");
      const fetchUrl = `${cleanBase}/api/dashboard/summary?nocache=${Date.now()}`;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
      setError(null);
      setUpdateTime(new Date());
      localStorage.setItem('hosxp_base_url', cleanBase);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "API Offline (Check Port 8000)" : err.message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 300000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const deptConfigs = [
    { id: 'opd', name: 'OPD ผู้ป่วยนอก', color: '#3B82F6', icon: <Users size={22} />, desc: 'Outpatient' },
    { id: 'er', name: 'ER ฉุกเฉิน', color: '#EF4444', icon: <Activity size={22} />, desc: 'Emergency' },
    { id: 'ipd', name: 'IPD ผู้ป่วยใน', color: '#8B5CF6', icon: <Bed size={22} />, desc: 'Inpatient' },
    { id: 'birth', name: 'LR ห้องคลอด', color: '#EC4899', icon: <Baby size={22} />, desc: 'Labor Room' },
    { id: 'dental', name: 'ทันตกรรม', color: '#F59E0B', icon: <Smile size={22} />, desc: 'Dental Clinic' },
    { id: 'rehab', name: 'กายภาพบำบัด', color: '#10B981', icon: <HeartPulse size={22} />, desc: 'Rehabilitation' },
    { id: 'ttm', name: 'แพทย์แผนไทย', color: '#059669', icon: <Leaf size={22} />, desc: 'Thai Medicine' },
    { id: 'refer', name: 'ส่งต่อผู้ป่วย (Refer)', color: '#6366F1', icon: <Truck size={22} />, desc: 'Referral' },
    { id: 'lab', name: 'ห้องชันสูตร (Lab)', color: '#14B8A6', icon: <Stethoscope size={22} />, desc: 'Laboratory' },
  ];

  // ฝัง CSS พื้นฐานเพื่อแก้ปัญหา Tailwind ไม่โหลด
  const customStyles = `
    .dashboard-container { font-family: sans-serif; background: #f1f5f9; min-height: 100vh; padding: 20px; }
    .header-box { background: white; padding: 25px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border: 1px solid #e2e8f0; }
    .grid-3-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .dept-card { background: white; border-radius: 24px; padding: 20px; border: 1px solid #e2e8f0; transition: 0.3s; position: relative; overflow: hidden; }
    .dept-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .icon-box { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 15px; }
    .case-number { font-size: 32px; font-weight: 800; color: #1e293b; margin: 10px 0; }
    .case-label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
    .service-table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
    .table-container { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
    .table-header { padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: bold; display: flex; align-items: center; gap: 10px; }
    
    @media (max-width: 1024px) { .grid-3-cols { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .grid-3-cols, .service-table-grid { grid-template-columns: 1fr; } .header-box { flex-direction: column; align-items: flex-start; } }
  `;

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <RefreshCw className="animate-spin" size={40} color="#3b82f6" />
        <p style={{ marginTop: 10, color: '#64748b', fontWeight: 'bold' }}>Loading Live Data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>{customStyles}</style>
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div className="header-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ background: '#2563eb', padding: 12, borderRadius: 12, color: 'white' }}><Database /></div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 900 }}>HOSxP WORKLOAD</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>เดือนปัจจุบัน: {data?.selected_month}</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{ background: '#f1f5f9', border: 'none', padding: 10, borderRadius: 10, cursor: 'pointer' }}>
            <Settings size={20} color="#64748b" />
          </button>
        </div>

        {/* 9 Blocks Grid */}
        <div className="grid-3-cols">
          {deptConfigs.map((dept) => {
            const trendData = data?.[dept.id] || [];
            const currentVal = data?.[`${dept.id}_current`] || 0;
            return (
              <div key={dept.id} className="dept-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="icon-box" style={{ background: dept.color }}>{dept.icon}</div>
                  <ChevronRight size={16} color="#e2e8f0" />
                </div>
                <h4 style={{ margin: 0, fontSize: 14, color: '#475569' }}>{dept.name}</h4>
                <div className="case-number">{Number(currentVal).toLocaleString()}</div>
                <div className="case-label">Cases this month</div>
                
                <div style={{ height: 60, marginTop: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <Area type="monotone" dataKey="total" stroke={dept.color} fill={dept.color} fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Tables */}
        <div className="service-table-grid">
           <div className="table-container">
              <div className="table-header" style={{ color: '#059669' }}><ClipboardList size={18}/> รายการกายภาพบำบัด</div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {(data?.rehab_services || []).map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontSize: 13 }}>{s.service}</td>
                        <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>{s.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>

           <div className="table-container">
              <div className="table-header" style={{ color: '#0d9488' }}><Leaf size={18}/> รายการแพทย์แผนไทย</div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {(data?.ttm_services || []).map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontSize: 13 }}>{s.service}</td>
                        <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>{s.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 30, borderRadius: 20, width: 300 }}>
            <h3 style={{ marginTop: 0 }}>API Settings</h3>
            <input 
              style={{ width: '100%', padding: 10, marginBottom: 20, border: '1px solid #ddd', borderRadius: 8 }}
              value={tempUrl}
              onChange={e => setTempUrl(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSettings(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none' }}>Cancel</button>
              <button onClick={() => { setBaseUrl(tempUrl); setShowSettings(false); }} style={{ flex: 1, padding: 10, borderRadius: 8, background: '#2563eb', color: 'white', border: 'none' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;