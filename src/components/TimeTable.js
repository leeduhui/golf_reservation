/* src/components/TimeTable.js */
import React from "react";
import { rooms, slots } from "../utils/data";

export default function TimeTable({ reservations, onCancel, currentTime }) {
  // Vertical list: each time slot as a row
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {slots.map(time => {
        // Check if this slot is part of a reservation
        const reservation = reservations.find(r => {
          const startIdx = slots.indexOf(r.start);
          const endIdx = slots.indexOf(r.end);
          const idx = slots.indexOf(time);
          return r.room === rooms[0] && idx >= startIdx && idx < endIdx;
        });
        const isStart = reservation && reservation.start === time;

        return (
          <div
            key={time}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              borderBottom: "1px solid #eee"
            }}
          >
            <span style={{ fontWeight: "bold" }}>{time}</span>
            <span>
              {reservation ? (
                <>
                  <span>{reservation.user}</span>
                  {isStart && (
                    <button
                      style={{ marginLeft: "8px", padding: "4px 8px", fontSize: "0.8em" }}
                      onClick={() => onCancel(reservation.id)}
                    >
                      취소
                    </button>
                  )}
                </>
              ) : (
                <span style={{ color: "#aaa" }}>—</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

