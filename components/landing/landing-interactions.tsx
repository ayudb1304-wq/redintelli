"use client";

import { useEffect, useRef, useCallback } from "react";

const streamItems = [
  {
    sub: "r/SaaS",
    age: "2m",
    title: '"What do you all use now that GummySearch shut down?"',
    score: 94,
    klass: "hi",
  },
  {
    sub: "r/indiehackers",
    age: "9m",
    title: '"Need a calmer way to research subs before posting."',
    score: 87,
    klass: "hi",
  },
  {
    sub: "r/startups",
    age: "14m",
    title: '"First 100 users - any tactic besides cold DMs?"',
    score: 72,
    klass: "mid",
  },
  {
    sub: "r/Entrepreneur",
    age: "23m",
    title: '"Best way to validate B2B niches on Reddit?"',
    score: 66,
    klass: "mid",
  },
  {
    sub: "r/smallbusiness",
    age: "34m",
    title: '"Marketing budget = $0, where do I start?"',
    score: 58,
    klass: "mid",
  },
];

export function LandingInteractions() {
  const streamRef = useRef<HTMLDivElement>(null);
  const intentFillRef = useRef<HTMLDivElement>(null);
  const intentValRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);

  const tick = useCallback(() => {
    const stream = streamRef.current;
    const intentFill = intentFillRef.current;
    const intentVal = intentValRef.current;
    if (!stream || !intentFill || !intentVal) return;

    const cards = stream.querySelectorAll(".stream-card");
    if (cards.length >= 3) cards[0].remove();

    const item = streamItems[idxRef.current % streamItems.length];
    const el = document.createElement("div");
    el.className = "stream-card";
    el.innerHTML = `
      <div class="sc-head">
        <span class="sc-sub">${item.sub} · ${item.age}</span>
        <span class="sc-score ${item.klass}">intent ${item.score}</span>
      </div>
      <div class="sc-title">${item.title}</div>
      <div class="sc-meta">• synth · pain · language · rules ✓</div>
    `;
    stream.appendChild(el);

    intentFill.style.width = item.score + "%";
    intentVal.textContent = item.score + " / 100";

    idxRef.current++;
  }, []);

  useEffect(() => {
    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".landing .reveal").forEach((el) => io.observe(el));

    // Seed stream
    tick();
    tick();
    const interval = setInterval(tick, 2600);

    // Animate feature bars
    const barsObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".pv-bar i").forEach((i) => {
              const w = i.dataset.w || "0%";
              i.style.width = "0%";
              requestAnimationFrame(() => {
                i.style.width = w;
              });
            });
          }
        }),
      { threshold: 0.3 }
    );
    document
      .querySelectorAll(".landing .feat-wide")
      .forEach((el) => barsObs.observe(el));

    return () => {
      clearInterval(interval);
      io.disconnect();
      barsObs.disconnect();
    };
  }, [tick]);

  return (
    <>
      {/* Stream refs */}
      <StreamPortal
        streamRef={streamRef}
        intentFillRef={intentFillRef}
        intentValRef={intentValRef}
      />
    </>
  );
}

function StreamPortal({
  streamRef,
  intentFillRef,
  intentValRef,
}: {
  streamRef: React.RefObject<HTMLDivElement | null>;
  intentFillRef: React.RefObject<HTMLDivElement | null>;
  intentValRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    streamRef.current = document.getElementById("stream") as HTMLDivElement;
    intentFillRef.current = document.getElementById(
      "intentFill"
    ) as HTMLDivElement;
    intentValRef.current = document.getElementById(
      "intentVal"
    ) as HTMLDivElement;
  }, [streamRef, intentFillRef, intentValRef]);

  return null;
}
