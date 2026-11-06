"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  HISTORY_KEY,
  type MeetingHistory,
} from "../lib/meeting-data";

export default function HistoryMeeting() {
  const [history, setHistory] = useState<MeetingHistory[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
      );

      const normalized: MeetingHistory[] = saved.map(
        (item: any) => {
          // Support old history format
          const [oldStart, oldEnd] = (item.times || "").split("-");

          return {
            ...item,
            time_start: item.time_start || oldStart || "",
            time_end: item.time_end || oldEnd || "",
          };
        }
      );

      normalized.sort(
        (a, b) =>
          new Date(b.endedAt).getTime() -
          new Date(a.endedAt).getTime()
      );

      setHistory(normalized);
    } catch {
      setHistory([]);
    }
  }, []);

  const clearHistory = () => {
    if (
      !window.confirm(
        "តើអ្នកចង់លុបប្រវត្តិការប្រជុំទាំងអស់មែនទេ?"
      )
    ) {
      return;
    }

    localStorage.setItem(HISTORY_KEY, "[]");
    setHistory([]);
  };

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
            MEETING HISTORY
          </div>

          <h1>ប្រវត្តិការប្រជុំ</h1>

          <p>
            កំណត់ត្រាប្រវត្តិនៃការប្រជុំដែលបានបញ្ចប់
          </p>
        </header>

        {/* TOP ACTIONS */}
        <div className="history-toolbar">
          <Link href="/" className="back-button">
            <span>←</span>
            ត្រឡប់ទៅទំព័រដើម
          </Link>

          <button
            className="clear-history-button"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            <span>⌫</span>
            លុបប្រវត្តិ
          </button>
        </div>

        {/* HISTORY SUMMARY */}
        <div className="history-summary">
          <div className="summary-icon">📋</div>

          <div>
            <p>ចំនួនការប្រជុំដែលបានបញ្ចប់</p>
            <h2>{history.length}</h2>
          </div>

          <span className="summary-label">
            COMPLETED
          </span>
        </div>

        {/* HISTORY LIST */}
        <div className="history-list">
          {history.length > 0 ? (
            history.map((item) => (
              <article className="history-card" key={item.id}>
                <div className="history-card-left">
                  <div className="history-room-icon">
                    🏢
                  </div>

                  <div className="history-room-info">
                    <h3>{item.title}</h3>

                    <div className="history-details">
                      <span>
                        ◷ {item.time_start} - {item.time_end}
                      </span>

                      <span>
                        ▦ {item.date}
                      </span>
                    </div>

                    <p className="history-ended-time">
                      បានបញ្ចប់នៅ{" "}
                      {new Date(item.endedAt).toLocaleTimeString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                </div>

                <div className="history-card-right">
                  <span className="history-status">
                    <span className="status-dot" />
                    បានបញ្ចប់
                  </span>

                  <span className="history-preparation">
                    ការរៀបចំ៖ {item.preparation}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state history-empty">
              <div className="empty-icon">📋</div>

              <h2>មិនទាន់មានប្រវត្តិការប្រជុំ</h2>

              <p>
                ប្រវត្តិការប្រជុំនឹងបង្ហាញនៅទីនេះ
                នៅពេលការប្រជុំបានបញ្ចប់។
              </p>

              <Link
                href="/"
                className="empty-history-button"
              >
                ត្រឡប់ទៅទំព័រដើម →
              </Link>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <p>
            សរុបចំនួន {history.length} ការប្រជុំ
          </p>
        </footer>
      </section>
    </main>
  );
}