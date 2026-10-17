import { scene, video } from "@/lib/video/build";
import type { VideoDoc } from "@/lib/video/types";
import type { CategoryId, VideoTemplate } from "../types";

const music = (track: "pulse" | "ambient" | "festive" | "celebrate", volume = 0.55): VideoDoc["audio"] => ({ src: `/audio/music-${track}.mp3`, name: `DAWB ${track[0].toUpperCase()}${track.slice(1)} (built-in)`, volume, fadeOutFrames: 45 });

function def(t: Omit<VideoTemplate, "kind" | "post" | "phase"> & { category: CategoryId }): VideoTemplate {
  return { kind: "video", post: null, phase: null, ...t };
}

const outro = (bg: string, cta = "Learn with DAWB", id?: string) => scene("logo-outro", { cta, url: "www.dawblearn.org", showHandle: true }, { id, duration: 90, background: { color: bg, texture: "signature" }, sfx: "chime" });

export const vXmas = def({
  id: "v-christmas-snow",
  name: "Christmas — Snowfall Greeting",
  category: "christmas",
  aspect: "portrait",
  tags: ["christmas", "snow", "festive", "music"],
  style: "Emerald · snowfall · festive bells",
  description: "Snow falls over deep emerald as MERRY CHRISTMAS types in letter by letter; a thank-you card and the Prism logo sting close it. Festive bell music.",
  build: () => {
    const d = video(
      [
        scene("greeting", { eyebrow: "From all of us at DAWB", headline: "Merry\nChristmas", big: "XMAS", message: "May your season be full of light, rest and good questions.", effect: "snow", layout: "center" }, { id: "xm1", duration: 165, background: { color: "#0B3B2E", texture: "signature" }, sfx: "shimmer", transition: { type: "fade", durationInFrames: 20 } }),
        scene("greeting", { eyebrow: "Thank you", headline: "for learning\nwith us this year", message: "See you in the new year.", effect: "sparkles", layout: "left" }, { id: "xm2", duration: 135, background: { color: "#0B3B2E", texture: "contours" }, transition: { type: "zoom", durationInFrames: 16 } }),
        scene("logo-reveal", { style: "prism", tagline: "Merry Christmas", sound: true }, { id: "xm3", duration: 135, background: { color: "#FFFFFF" } }),
      ],
      { theme: { accent: "#E8C170", displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("festive") };
  },
});

export const vNewYear = def({
  id: "v-new-year-fireworks",
  name: "New Year — Countdown & Fireworks",
  category: "newyear",
  aspect: "portrait",
  tags: ["new year", "countdown", "fireworks", "2027"],
  style: "Black · countdown · fireworks · upbeat",
  description: "3-2-1 countdown with a riser, fireworks burst behind a giant 2027, then the Signal logo sting. Upbeat celebration track.",
  build: () => {
    const d = video(
      [
        scene("countdown", { label: "Counting down to", from: 3, to: 1, unit: "", caption: "2027" }, { id: "ny1", duration: 105, background: { color: "#000000", texture: "signature" }, sfx: "riser", transition: { type: "zoom", durationInFrames: 12 } }),
        scene("greeting", { eyebrow: "Hello, 2027", headline: "Happy\nNew Year", big: "2027", message: "New year. New questions. Same curiosity.", effect: "fireworks", layout: "center" }, { id: "ny2", duration: 180, background: { color: "#000000", texture: "noise" }, sfx: "impact", transition: { type: "wipe", durationInFrames: 18, direction: "from-bottom" } }),
        scene("logo-reveal", { style: "signal", tagline: "Happy New Year", sound: true }, { id: "ny3", duration: 135, background: { color: "#0097B2" } }),
      ],
      { theme: { accent: "#FFC83D", displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("celebrate") };
  },
});

export const vNewMonth = def({
  id: "v-new-month-calendar",
  name: "New Month — Animated Calendar",
  category: "newmonth",
  aspect: "feed",
  tags: ["new month", "calendar", "november"],
  style: "White · calendar cells pop · ambient",
  description: "The month name rises letter by letter, the calendar fills cell by cell with day one pulsing, then a cyan message card. Calm ambient bed.",
  build: () => {
    const d = video(
      [
        scene("month", { greeting: "Happy New Month", month: "November", year: "2026", startDay: 0, days: 30, message: "New month. New questions worth answering." }, { id: "nm1", duration: 180, background: { color: "#FFFFFF", texture: "signature" }, sfx: "whoosh", transition: { type: "slide", durationInFrames: 16, direction: "from-right" } }),
        scene("greeting", { eyebrow: "November", headline: "Thirty fresh days.\nOne question\nat a time.", message: "", effect: "sparkles", layout: "left" }, { id: "nm2", duration: 120, background: { color: "#0097B2", texture: "halftone" }, transition: { type: "fade", durationInFrames: 15 } }),
        outro("#000000", "Happy New Month", "nm3"),
      ],
      { aspect: "feed", theme: { displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("ambient", 0.6) };
  },
});

export const vBirthday = def({
  id: "v-birthday-confetti",
  name: "Happy Birthday — Confetti Pop",
  category: "birthday",
  aspect: "portrait",
  tags: ["birthday", "confetti", "photo", "celebration"],
  style: "Cyan · photo in orbit · confetti",
  description: "The celebrant's photo pops in inside a spinning dotted orbit, confetti bursts, the name types in. Upbeat celebration track.",
  build: () => {
    const d = video(
      [
        scene("greeting", { eyebrow: "Happy Birthday", headline: "[Name]", big: "", message: "Wishing you a year of big wins, bold questions and beautiful answers.", image: "", photoSlot: true, effect: "confetti", layout: "center" }, { id: "bd1", duration: 180, background: { color: "#0097B2", texture: "signature" }, sfx: "pop", transition: { type: "zoom", durationInFrames: 14 } }),
        scene("greeting", { eyebrow: "", headline: "Celebrating\nyou today.", big: "HBD", message: "— Team DAWB", effect: "sparkles", layout: "left" }, { id: "bd2", duration: 120, background: { color: "#000000", texture: "noise" }, transition: { type: "fade", durationInFrames: 15 } }),
        outro("#FFFFFF", "Happy Birthday!", "bd3"),
      ],
      { theme: { accent: "#FFD24A", displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("celebrate") };
  },
});

export const vWeekend = def({
  id: "v-weekend-recharge",
  name: "Happy Weekend — Recharge",
  category: "weekend",
  aspect: "square",
  tags: ["weekend", "bokeh", "relax"],
  style: "Cyan bokeh → dark · ambient",
  description: "Soft bokeh lights float behind HAPPY WEEKEND, then a calm dark card: Rest. Reflect. Recharge.",
  build: () => {
    const d = video(
      [
        scene("greeting", { eyebrow: "It's Friday", headline: "Happy\nWeekend", big: "", message: "", effect: "bokeh", layout: "center" }, { id: "wk1", duration: 135, background: { color: "#0097B2", texture: "signature" }, sfx: "whoosh", transition: { type: "slide", durationInFrames: 16, direction: "from-bottom" } }),
        scene("kinetic-title", { eyebrow: "Weekend mode", headline: "Rest.\nReflect.\nRecharge.", highlight: "Recharge.", animation: "mask", align: "left", subline: "Come back ready for Monday's questions." }, { id: "wk2", duration: 135, background: { color: "#000000", texture: "contours" }, transition: { type: "fade", durationInFrames: 15 } }),
        outro("#000000", "See you Monday", "wk3"),
      ],
      { aspect: "square", theme: { accent: "#3CD3EC", displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("ambient", 0.6) };
  },
});

export const vBtdPromo = def({
  id: "v-btd-promo",
  name: "BTD — Webinar Promo Reel",
  category: "btd",
  aspect: "portrait",
  tags: ["btd", "webinar", "promo", "reel"],
  style: "Dark → cyan · kinetic type · bento details",
  description: "Assemble logo sting, BEYOND THE DASHBOARD kinetic title, the webinar card with speaker and bento details, a days-to-go countdown and CTA. Pulse music.",
  build: () => {
    const d = video(
      [
        scene("logo-reveal", { style: "assemble", tagline: "presents", sound: true }, { id: "bp1", duration: 120, background: { color: "#000000" }, transition: { type: "fade", durationInFrames: 12 } }),
        scene("kinetic-title", { eyebrow: "Webinar series", headline: "Beyond\nThe Dashboard", highlight: "Dashboard", animation: "mask", align: "left", subline: "Where data becomes decisions." }, { id: "bp2", duration: 105, background: { color: "#000000", texture: "signature" }, sfx: "whoosh", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
        scene("webinar", { series: "Beyond The Dashboard", episode: "EP.07 · Live", title: "Turning Dashboards Into Decisions", image: "", speaker: "Speaker Name", role: "Role, Organisation", date: "Sat, 00 Month", time: "4:00 PM WAT", platform: "Google Meet", cta: "Register — link in bio" }, { id: "bp3", duration: 210, background: { color: "#0097B2", texture: "signature" }, sfx: "impact", transition: { type: "zoom", durationInFrames: 14 } }),
        scene("countdown", { label: "Live in", from: 3, to: 1, unit: "days", caption: "Save your seat" }, { id: "bp4", duration: 105, background: { color: "#000000", texture: "orbits" }, transition: { type: "fade", durationInFrames: 12 } }),
        outro("#000000", "Register — link in bio", "bp5"),
      ],
      { theme: { accent: "#3CD3EC", displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("pulse") };
  },
});

export const vBtdSpeaker = def({
  id: "v-btd-speaker",
  name: "BTD — Speaker Announcement",
  category: "btd",
  aspect: "square",
  tags: ["btd", "speaker", "announcement"],
  style: "White · orbit portrait · lower third",
  description: "Square speaker reveal: portrait inside a drawing ring, name and topic, then a lower-third style name card. Pulse music.",
  build: () => {
    const d = video(
      [
        scene("speaker-card", { label: "Beyond The Dashboard · Speaker", image: "", name: "Speaker Name", role: "Role, Organisation", topic: "Turning Dashboards Into Decisions" }, { id: "bs1", duration: 165, background: { color: "#FFFFFF", texture: "signature" }, sfx: "whoosh", transition: { type: "wipe", durationInFrames: 16, direction: "from-left" } }),
        scene("event-details", { title: "Join us live", date: "Sat, 00 Month", time: "4:00 PM WAT", venue: "Google Meet", cta: "Register — link in bio" }, { id: "bs2", duration: 150, background: { color: "#0097B2", texture: "halftone" }, transition: { type: "fade", durationInFrames: 14 } }),
        outro("#000000", "Beyond The Dashboard", "bs3"),
      ],
      { aspect: "square", theme: { displayFont: "Nunito", bodyFont: "Nunito Sans", accent: "#0097B2" } },
    );
    return { ...d, audio: music("pulse", 0.5) };
  },
});

export const vBtdStarting = def({
  id: "v-btd-starting-soon",
  name: "BTD — Starting Soon Screen",
  category: "btd",
  aspect: "landscape",
  tags: ["btd", "starting soon", "youtube", "waiting screen"],
  style: "16:9 · dark · ambient loop",
  description: "Landscape waiting screen for the live stream: session card, a slow ambient bed and the Signal logo sting.",
  build: () => {
    const d = video(
      [
        scene("kinetic-title", { eyebrow: "Beyond The Dashboard", headline: "We're starting soon.", highlight: "soon.", animation: "rise", align: "left", subline: "Grab a notebook — and your best question." }, { id: "bt1", duration: 150, background: { color: "#000000", texture: "signature" }, transition: { type: "fade", durationInFrames: 20 } }),
        scene("webinar", { series: "Beyond The Dashboard", episode: "Starting soon", title: "Turning Dashboards Into Decisions", image: "", speaker: "Speaker Name", role: "Role, Organisation", date: "Today", time: "4:00 PM WAT", platform: "Live here", cta: "" }, { id: "bt2", duration: 210, background: { color: "#000000", texture: "contours" }, transition: { type: "fade", durationInFrames: 20 } }),
        scene("logo-reveal", { style: "signal", tagline: "Beyond The Dashboard", sound: true }, { id: "bt3", duration: 135, background: { color: "#0097B2" } }),
      ],
      { aspect: "landscape", theme: { accent: "#3CD3EC", displayFont: "Nunito", bodyFont: "Nunito Sans" } },
    );
    return { ...d, audio: music("ambient", 0.6) };
  },
});

export const OCCASION_VIDEOS = [vBtdPromo, vBtdSpeaker, vBtdStarting, vXmas, vNewYear, vNewMonth, vBirthday, vWeekend];
