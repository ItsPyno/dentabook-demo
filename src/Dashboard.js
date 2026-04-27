import { useState, useEffect } from "react";

const SUPABASE_URL = "https://haogrokgfhiqmpasrddz.supabase.co";
const SUPABASE_KEY = "sb_publishable_Xia8HVo0CcI3UlBGA0rQbA_Hnsa3TKK";

const DASHBOARD_PASSWORD = "demo123";

function createDB(url, key) {
  const base = url.replace(/\/+$/, "");
  const h = { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` };
  return {
    async get(table, q = "") {
      const r = await fetch(`${base}/rest/v1/${table}?${q}`, { headers: h });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async patch(table, id, data) {
      const r = await fetch(`${base}/rest/v1/${table}?id=eq.${id}`, {
        method: "PATCH", headers: { ...h, "Prefer": "return=representation" }, body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }
  };
}

const db = createDB(SUPABASE_URL, SUPABASE_KEY);

const badgeStyle = (status) => ({
  display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
  background: status === "confirmed" ? "#dcfce7" : status === "cancelled" ? "#fee2e2" : "#fef9c3",
  color: status === "confirmed" ? "#16a34a" : status === "cancelled" ? "#dc2626" : "#ca8a04",
});

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function BookingCard({ b, getDentist, getService, today, cancelling, cancelBooking }) {
  return (
    <div style={{ background: b.booking_date === today ? "#f0f9ff" : "#fff", border: `1px solid ${b.booking_date === today ? "#bae6fd" : "#e2e8f0"}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{b.patient_name}</span>
            {b.booking_date === today && <span style={{ fontSize: 10, background: "#0ea5e9", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>TODAY</span>}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{b.patient_phone}</div>
        </div>
        <span style={badgeStyle(b.status)}>{b.status}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          ["📅 Date", new Date(b.booking_date).toLocaleDateString("en-IE", { weekday: "short", month: "short", day: "numeric" })],
          ["⏰ Time", b.time_slot],
          ["🦷 Service", getService(b.service_id)],
          ["👨‍⚕️ Dentist", getDentist(b.dentist_id)],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: b.status === "confirmed" ? 10 : 0 }}>✉ {b.patient_email}</div>
      {b.status === "confirmed" && (
        <button onClick={() => { if (window.confirm(`Cancel ${b.patient_name}'s appointment?`)) cancelBooking(b.id); }}
          disabled={cancelling === b.id}
          style={{ width: "100%", background: "#fff1f2", color: "#f43f5e", border: "1px solid #fecdd3", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
          {cancelling === b.id ? "Cancelling..." : "Cancel Appointment"}
        </button>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function handleLogin() {
    if (pass === DASHBOARD_PASSWORD) { onLogin(); }
    else { setErr("Incorrect password. Try again."); }
  }
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🦷</div>
        <h2 style={{ fontSize: 22, color: "#0f172a", marginBottom: 4 }}>DentaBook Dashboard</h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Sign in to manage your appointments</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Enter your password"
          style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        {err && <p style={{ color: "#f43f5e", fontSize: 13, marginBottom: 12 }}>⚠️ {err}</p>}
        <button onClick={handleLogin} style={{ width: "100%", background: "linear-gradient(135deg,#0ea5e9,#14b8a6)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Sign In →
        </button>
        <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 16 }}>Default password: demo123</p>
      </div>
    </div>
  );
}

export default function Dashboard({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancelling, setCancelling] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loggedIn) return;
    (async () => {
      try {
        const [b, d, s] = await Promise.all([
          db.get("bookings", "select=*&order=booking_date.asc,time_slot.asc"),
          db.get("dentists", "select=*"),
          db.get("services", "select=*"),
        ]);
        setBookings(b); setDentists(d); setServices(s);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [loggedIn]);

  async function cancelBooking(id) {
    setCancelling(id);
    try {
      await db.patch("bookings", id, { status: "cancelled" });
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    } catch { alert("Failed to cancel. Try again."); }
    setCancelling(null);
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const getDentist = (id) => dentists.find(d => d.id === id)?.name || "Unknown";
  const getService = (id) => services.find(s => s.id === id)?.label || id;

  const filtered = bookings.filter(b => {
    const matchSearch = b.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.patient_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.patient_phone?.includes(search);
    const matchFilter = filter === "all" ? true :
      filter === "today" ? b.booking_date === today :
      filter === "upcoming" ? b.booking_date >= today :
      filter === "cancelled" ? b.status === "cancelled" : true;
    return matchSearch && matchFilter;
  });

  const todayCount = bookings.filter(b => b.booking_date === today && b.status === "confirmed").length;
  const upcomingCount = bookings.filter(b => b.booking_date >= today && b.status === "confirmed").length;
  const totalCount = bookings.filter(b => b.status === "confirmed").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
  const pad = isMobile ? 12 : 32;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0ea5e9,#14b8a6)", padding: isMobile ? "14px 16px" : "20px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: isMobile ? 17 : 22, fontWeight: 700, margin: 0 }}>🦷 DentaBook Dashboard</h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "3px 0 0" }}>Manage your appointments</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {onBack && (
              <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: isMobile ? "6px 10px" : "8px 16px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                ← {isMobile ? "" : "Widget"}
              </button>
            )}
            <button onClick={() => setLoggedIn(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: isMobile ? "6px 10px" : "8px 16px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: pad }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 16, marginBottom: isMobile ? 12 : 24 }}>
          {[
            { label: "Today", value: todayCount, color: "#0ea5e9", icon: "📅" },
            { label: "Upcoming", value: upcomingCount, color: "#14b8a6", icon: "🗓️" },
            { label: "Confirmed", value: totalCount, color: "#8b5cf6", icon: "✅" },
            { label: "Cancelled", value: cancelledCount, color: "#f43f5e", icon: "❌" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#fff", borderRadius: 12, padding: isMobile ? 12 : 24, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? 20 : 28 }}>{stat.icon}</div>
              <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: stat.color, margin: "4px 0 2px" }}>{stat.value}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: "#94a3b8", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: isMobile ? 12 : 16, border: "1px solid #e2e8f0", marginBottom: isMobile ? 12 : 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search patient name, email or phone..."
            style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {["all", "today", "upcoming", "cancelled"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: filter === f ? "#0ea5e9" : "#f1f5f9", color: filter === f ? "#fff" : "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings */}
        <div style={{ background: "#fff", borderRadius: 12, padding: isMobile ? 12 : 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 14px", color: "#0f172a", fontSize: 15 }}>Appointments ({filtered.length})</h3>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading bookings...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No appointments found</div>
          ) : isMobile ? (
            filtered.map(b => (
              <BookingCard key={b.id} b={b} getDentist={getDentist} getService={getService} today={today} cancelling={cancelling} cancelBooking={cancelBooking} />
            ))
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Date", "Time", "Patient", "Contact", "Service", "Dentist", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#94a3b8", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc", background: b.booking_date === today ? "#f0f9ff" : "transparent" }}>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{new Date(b.booking_date).toLocaleDateString("en-IE", { weekday: "short", month: "short", day: "numeric" })}</span>
                        {b.booking_date === today && <span style={{ marginLeft: 6, fontSize: 10, background: "#0ea5e9", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>TODAY</span>}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 600, color: "#0f172a" }}>{b.time_slot}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: "#0f172a" }}>{b.patient_name}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{b.patient_email}</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{b.patient_phone}</div>
                      </td>
                      <td style={{ padding: "12px", color: "#64748b" }}>{getService(b.service_id)}</td>
                      <td style={{ padding: "12px", color: "#64748b" }}>{getDentist(b.dentist_id)}</td>
                      <td style={{ padding: "12px" }}><span style={badgeStyle(b.status)}>{b.status}</span></td>
                      <td style={{ padding: "12px" }}>
                        {b.status === "confirmed" && (
                          <button onClick={() => { if (window.confirm(`Cancel ${b.patient_name}'s appointment?`)) cancelBooking(b.id); }}
                            disabled={cancelling === b.id}
                            style={{ background: "#fff1f2", color: "#f43f5e", border: "1px solid #fecdd3", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                            {cancelling === b.id ? "..." : "Cancel"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}