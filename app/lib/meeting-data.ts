export type MeetingRoom = {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    time_start: string; // HH:mm
    time_end: string;   // HH:mm
};

export type MeetingHistory = {
    id: string;
    roomId: number;
    title: string;
    time_start: string;
    time_end: string;
    date: string;
    endedAt: string;
    preparation: string;
};

export const rooms: MeetingRoom[] = [
    {
        id: 1,
        title: "បន្ទប់ប្រជុំជាន់ទី១០",
        date: "2026-11-11",
        time_start: "13:30",
        time_end: "16:00",
    },
    {
        id: 2,
        title: "បន្ទប់ប្រជុំជាន់ទី១១",
        date: "2026-11-13",
        time_start: "14:30",
        time_end: "16:00",
    },
    {
        id: 3,
        title: "បន្ទប់ប្រជុំជាន់ទី១២",
        date: "2026-11-17",
        time_start: "14:30",
        time_end: "17:00",
    },
];

export const HISTORY_KEY = "meeting-history";

export function getMeetingStatus(
    date: string,
    time_start: string,
    time_end: string,
    now: Date
) {
    const [year, month, day] = date.split("-").map(Number);

    const [sh, sm] = time_start.split(":").map(Number);
    const [eh, em] = time_end.split(":").map(Number);

    const start = new Date(year, month - 1, day, sh, sm, 0, 0);
    const end = new Date(year, month - 1, day, eh, em, 0, 0);

    // Support meetings finishing after midnight
    if (end <= start) {
        end.setDate(end.getDate() + 1);
    }

    const current = now.getTime();

    const status =
        current < start.getTime()
            ? "waiting"
            : current < end.getTime()
                ? "ongoing"
                : "ended";

    const target = status === "waiting" ? start : end;

    const totalSeconds = Math.max(
        0,
        Math.floor((target.getTime() - current) / 1000)
    );

    const days = Math.floor(totalSeconds / 86400);

    let countdown = "";

    if (days >= 365) {
        const years = Math.floor(days / 365);
        countdown = `${years} ${years === 1 ? "year" : "years"}`;
    } else if (days >= 30) {
        const months = Math.floor(days / 30);
        countdown = `${months} ${months === 1 ? "month" : "months"}`;
    } else if (days >= 7) {
        const weeks = Math.floor(days / 7);
        countdown = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    } else if (days >= 1) {
        countdown = `${days} ${days === 1 ? "day" : "days"}`;
    } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        countdown = [hours, minutes, seconds]
            .map((v) => String(v).padStart(2, "0"))
            .join(":");
    }

    return {
        status,
        countdown,
    } as const;
}

// Calculate meeting end date/time
export function getMeetingEndDate(
    date: string,
    time_start: string,
    time_end: string
) {
    const [year, month, day] = date.split("-").map(Number);
    const [sh, sm] = time_start.split(":").map(Number);
    const [eh, em] = time_end.split(":").map(Number);

    const start = new Date(year, month - 1, day, sh, sm);
    const end = new Date(year, month - 1, day, eh, em);

    if (end <= start) {
        end.setDate(end.getDate() + 1);
    }

    return end;
}