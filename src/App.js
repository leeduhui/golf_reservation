/* src/App.js */
import React, { useState, useEffect } from "react";
import { supabase } from "./utils/supabaseClient";
import TimeTable from "./components/TimeTable";
import ReserveForm from "./components/ReserveForm";
import "./App.css";

function App() {
  const [reservations, setReservations] = useState([]);
  const [now, setNow] = useState(new Date());
  const [currentDateOffset, setCurrentDateOffset] = useState(0);

  const today = new Date();
  const viewedDate = new Date(today);
  viewedDate.setDate(today.getDate() + currentDateOffset);
  const viewedDateString = viewedDate.toISOString().split("T")[0];

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", viewedDateString)
      .order("inserted_at", { ascending: true });

    if (!error) setReservations(data || []);
  };

  useEffect(() => {
    fetchReservations();
  }, [viewedDateString]);

  useEffect(() => {
    const channel = supabase
      .channel("public:reservations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, payload => {
        console.log("[Realtime Update]", payload);
        fetchReservations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredReservations = reservations.filter(r => r.date === viewedDateString);

  const handleReserve = async newRes => {
    const { error } = await supabase.from("reservations").insert({
      room: newRes.room,
      start: newRes.start,
      end: newRes.end,
      user: newRes.user,
      password: newRes.password,
      date: viewedDateString
    });
    if (error) {
      console.error("[Supabase Error] 예약 실패:", error.message);
      alert("예약 중 오류가 발생했습니다: " + error.message);
    } else {
      await fetchReservations();
    }
  };

  const handleCancel = async id => {
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) {
      console.error("[Supabase Error] 예약 취소 실패:", error.message);
    } else {
      await fetchReservations();
    }
  };

  const handleDateChange = offset => {
    setCurrentDateOffset(offset);
  };

  return (
    <div className="container" style={{ maxWidth: "480px", margin: "0 auto", padding: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontWeight: 600, fontSize: "1.25rem", margin: 0 }}>스크린골프 예약</h2>
        <div style={{ fontSize: "0.9rem", color: "#555" }}>
          {now.toLocaleDateString("ko-KR")}<br />{now.toLocaleTimeString("ko-KR")}
        </div>
      </header>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
        {[...Array(7)].map((_, i) => {
          const offset = i - 3;
          const d = new Date(today);
          d.setDate(today.getDate() + offset);
          const label = d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", weekday: "short" });
          const isActive = offset === currentDateOffset;
          return (
            <button
              key={offset}
              onClick={() => handleDateChange(offset)}
              style={{
                padding: "6px 12px",
                borderRadius: "12px",
                border: "none",
                fontSize: "0.85rem",
                backgroundColor: isActive ? "#007AFF" : "#F0F0F5",
                color: isActive ? "white" : "#333",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                transition: "background-color 0.2s ease"
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "12px" }}>예약 현황</h3>
        <TimeTable
          reservations={filteredReservations}
          onCancel={handleCancel}
          currentTime={now}
          viewedDate={viewedDateString}
          style={{ borderTop: "1px solid #eee" }}
        />
      </div>

      <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "1.1rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "12px" }}>새 예약 추가</h3>
        <div style={{ marginBottom: "10px", fontWeight: 500, fontSize: "1rem" }}>방 번호</div>
        <div style={{ marginBottom: "12px" }}>
          <ReserveForm
            reservations={filteredReservations}
            onReserve={handleReserve}
            currentTime={now}
            viewedDate={viewedDateString}
            style={{ fontSize: "1.1rem", padding: "10px", minHeight: "50px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
