"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  rooms,
  getMeetingStatus,
  getMeetingEndDate,
  HISTORY_KEY,
  type MeetingHistory,
  type MeetingRoom,
} from "./lib/meeting-data";

export default function Home() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [selectedRoom, setSelectedRoom] =
    useState<MeetingRoom | null>(null);

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [history, setHistory] = useState<MeetingHistory[]>([]);

  // Format date: YYYY-MM-DD
  const formatDate = (date: string | Date) => {
    if (typeof date === "string") return date;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Load history and update clock
  useEffect(() => {
    let saved: MeetingHistory[] = [];

    try {
      const raw = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
      );

      // Support old history records that used "times"
      saved = raw.map((item: any) => {
        const [oldStart, oldEnd] = (item.times || "").split("-");

        return {
          ...item,
          time_start: item.time_start || oldStart || "",
          time_end: item.time_end || oldEnd || "",
        };
      });
    } catch {
      saved = [];
    }

    try {
      const savedCompleted = JSON.parse(
        localStorage.getItem("meeting-completed") || "[]"
      );

      setCompleted(savedCompleted);
    } catch {
      setCompleted([]);
    }

    const update = () => {
      const now = new Date();

      setCurrentTime(now);

      rooms.forEach((room) => {
        const meeting = getMeetingStatus(
          room.date,
          room.time_start,
          room.time_end,
          now
        );

        if (meeting.status === "ended") {
          const id = `${room.id}-${room.date}`;

          const exists = saved.some(
            (item) => item.id === id
          );

          if (!exists) {
            saved.push({
              id,
              roomId: room.id,
              title: room.title,
              time_start: room.time_start,
              time_end: room.time_end,
              date: room.date,
              endedAt: getMeetingEndDate(
                room.date,
                room.time_start,
                room.time_end
              ).toISOString(),
              preparation: "មិនបានបញ្ជាក់",
            });
          }
        }
      });

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(saved)
      );

      setHistory([...saved]);
    };

    // Save migrated history
    localStorage.setItem(HISTORY_KEY, JSON.stringify(saved));

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, []);

  // Confirm preparation
  const confirmComplete = () => {
    if (!selectedRoom) return;

    const updated = completed.includes(selectedRoom.id)
      ? completed
      : [...completed, selectedRoom.id];

    setCompleted(updated);

    localStorage.setItem(
      "meeting-completed",
      JSON.stringify(updated)
    );

    setSelectedRoom(null);
  };

  // Active meetings only
  const activeRooms = rooms.filter((room) => {
    if (!currentTime) return true;

    return (
      getMeetingStatus(
        room.date,
        room.time_start,
        room.time_end,
        currentTime
      ).status !== "ended"
    );
  });

  const progress = rooms.length
    ? (completed.length / rooms.length) * 100
    : 0;

  return (
    <main className="meeting-page">
      <div className="background-glow" />
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />

      <section className="meeting-container">

        {/* HEADER */}
        <header className="header">
          <div className="header-label">
            <span className="header-dot" />
            MEETING ROOM MANAGEMENT
          </div>

          <h1>ការរៀបចំបន្ទប់ប្រជុំ</h1>

          <p>
            ប្រព័ន្ធត្រួតពិនិត្យ និងគ្រប់គ្រងការរៀបចំបន្ទប់ប្រជុំ
          </p>

          {/* CURRENT DATE AND CLOCK */}
          <div className="date-time-container">
            <div className="current-clock">
              <span>◷</span>

              {currentTime
                ? currentTime.toLocaleTimeString("en-GB")
                : "--:--:--"}

              <span className="live-indicator">LIVE</span>
            </div>
          </div>
        </header>

        {/* HISTORY NAVIGATION */}
        {/* <div className="history-navigation">
          <div>
            <span className="history-nav-title">
              ប្រវត្តិការប្រជុំ
            </span>

            <span className="history-nav-subtitle">
              មើលកំណត់ត្រាការប្រជុំដែលបានបញ្ចប់
            </span>
          </div>

          <Link href="/history-meeting" className="history-link">
            មើលប្រវត្តិ
            <span>→</span>

            <span className="history-count">
              {history.length}
            </span>
          </Link>
        </div> */}

        {/* MEETING LIST */}
        <div className="meeting-list">
          {activeRooms.map((room, index) => {
            const isCompleted = completed.includes(room.id);

            const meeting = currentTime
              ? getMeetingStatus(
                room.date,
                room.time_start,
                room.time_end,
                currentTime
              )
              : null;

            return (
              <article
                className="meeting-card"
                key={room.id}
                style={{
                  animationDelay: `${index * 0.12}s`,
                }}
              >
                <div className="room-content">
                  <div className="room-icon">🏢</div>

                  <div className="room-info">
                    <h2>{room.title}</h2>

                    {/* MEETING DATE AND TIME */}
                    <div className="room-time">
                      ▦ {formatDate(room.date)}
                      {" | "}
                      ◷ {room.time_start} → {room.time_end}
                    </div>

                    {meeting && (
                      <div className="meeting-countdown">
                        {meeting.status === "waiting" && (
                          <span>
                            ចាប់ផ្តើមក្នុង៖ {meeting.countdown} ទៀត
                          </span>
                        )}

                        {meeting.status === "ongoing" && (
                          <span>
                            កំពុងប្រជុំនៅសល់៖ {meeting.countdown} ទៀត
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* PREPARATION BUTTON */}
                <button
                  className={`ready-button ${isCompleted ? "is-ready" : ""
                    }`}
                  disabled={isCompleted}
                  onClick={() => setSelectedRoom(room)}
                >
                  {isCompleted ? (
                    <>
                      <span>✓</span>
                      បានរៀបចំរួច
                    </>
                  ) : (
                    <>
                      ចូលរៀបចំ
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>
              </article>
            );
          })}

          {/* EMPTY STATE */}
          {activeRooms.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✓</div>

              <h2>មិនមានការប្រជុំបន្តទៀតទេ</h2>

              <p>
                ការប្រជុំទាំងអស់ត្រូវបានបញ្ចប់។
                សូមចូលទៅកាន់ប្រវត្តិការប្រជុំ។
              </p>

              <Link
                href="/history-meeting"
                className="empty-history-button"
              >
                មើលប្រវត្តិការប្រជុំ →
              </Link>
            </div>
          )}
        </div>

        {/* FOOTER PROGRESS */}
        <footer className="footer">
          <div className="footer-info">
            <span>វឌ្ឍនភាពនៃការរៀបចំបន្ទប់</span>

            <strong>
              {completed.length}/{rooms.length}
            </strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p>
            បានរៀបចំរួច {completed.length} ក្នុងចំណោម{" "}
            {rooms.length} បន្ទប់
          </p>
        </footer>
      </section>

      {/* CONFIRMATION MODAL */}
      {selectedRoom && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">
              <span>?</span>
            </div>

            <h2>បញ្ជាក់ការរៀបចំ</h2>

            <p>
              តើបងបានរៀបចំ
              <strong> {selectedRoom.title} </strong>
              រួចរាល់ហើយឬនៅ?
            </p>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setSelectedRoom(null)}
              >
                បោះបង់
              </button>

              <button
                className="confirm-button"
                onClick={confirmComplete}
              >
                <span>✓</span>
                ខ្ញុំបានរៀបចំរួច
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}