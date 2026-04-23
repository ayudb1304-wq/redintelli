import type { Metadata } from "next";
import Link from "next/link";
import { LandingInteractions } from "@/components/landing/landing-interactions";
import "./landing.css";

export const metadata: Metadata = {
  title: "RedIntelli | Reddit Audience Research Tool for Founders",
  description:
    "A Reddit audience research tool that reads hundreds of posts for you and hands back a brief: pain points, the phrases people actually use, and what gets upvoted. Free to start, no Reddit API.",
  keywords: [
    "reddit audience research tool",
    "reddit market research",
    "subreddit finder",
    "reddit audience intelligence",
    "gummysearch alternative",
  ],
  alternates: {
    canonical: "https://redintelli.com",
  },
  openGraph: {
    title: "RedIntelli | Reddit Audience Research Tool",
    description:
      "Get a full audience brief on any subreddit in about a minute. Pain points, language patterns, content that works, community rules.",
    url: "https://redintelli.com",
    siteName: "RedIntelli",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RedIntelli | Reddit Audience Research Tool",
    description:
      "Audience briefs on any subreddit in under a minute. Built to replace GummySearch.",
  },
};

function LogoSvg({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size}>
      <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="14" cy="14" r="4.5" fill="currentColor" />
      <circle cx="23" cy="8" r="2.2" fill="var(--lime)" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}

const faqItems = [
  {
    q: "Where does the Reddit data come from?",
    a: "We read from the Arctic Shift public archive (1.8B+ posts) and layer live subreddit feeds on top. No scraping, no ToS drama.",
    open: true,
  },
  {
    q: "Is this just a GPT wrapper?",
    a: "No. We feed Claude structured snapshots - top posts, rising posts, and controversial comments - and constrain the output to a ranked schema with citations back to the source thread.",
  },
  {
    q: "Will this get me banned from Reddit?",
    a: "RedIntelli only reads. The point is to help you contribute well - post like a human, not a growth hacker. Briefs include each subreddit's self-promo rules.",
  },
  {
    q: "Does the free plan really stay free?",
    a: "Yes. Two briefs a month, forever. Most founders upgrade once they start running monitoring. No surprise meters.",
  },
  {
    q: "Can I cancel anytime?",
    a: "One click, no email required. Your saved briefs stay accessible for 90 days after cancellation.",
  },
  {
    q: "Do you support languages other than English?",
    a: "Not yet. English-language subreddits only at launch - Spanish and Portuguese are on the roadmap.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingInteractions />

      {/* ===== NAV ===== */}
      <header className="nav">
        <div className="wrap nav-inner">
          <Link className="logo" href="/">
            <span className="logo-mark" aria-hidden="true">
              <LogoSvg />
            </span>
            <span className="logo-word">RedIntelli</span>
          </Link>
          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#brief">Sample brief</a>
            <a href="#compare">vs GummySearch</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="nav-cta">
            <Link className="link-quiet" href="/login">Log in</Link>
            <Link className="btn btn-dark" href="/signup">
              Start free<span className="arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-left reveal">
            <div className="eyebrow">
              <span className="dot"></span> Reddit audience intelligence
            </div>
            <h1 className="display">
              Understand any <span className="serif-i">Reddit audience</span>
              <span className="highlight">in under a minute.</span>
            </h1>
            <p className="lede">
              Drop in any subreddit. Get a brief on what people there
              actually struggle with, how they talk, and what they
              upvote. Post like a regular, not a growth hacker.
            </p>
            <div className="cta-row">
              <Link className="btn btn-dark btn-lg" href="/signup">
                Generate your first brief <span className="arrow">&rarr;</span>
              </Link>
              <a className="btn btn-ghost btn-lg" href="#brief">See a sample</a>
            </div>
            <div className="micro">
              <span className="check">&#10003;</span> Free forever plan &nbsp;&middot;&nbsp;
              <span className="check">&#10003;</span> No credit card &nbsp;&middot;&nbsp;
              <span className="check">&#10003;</span> 60-second briefs
            </div>
          </div>

          {/* Animated insight stream */}
          <aside className="hero-right">
            <div className="stream-frame">
              <div className="stream-head">
                <div className="stream-title">
                  <span className="pulse"></span>
                  <span className="mono-sm">live feed &middot; r/indiehackers</span>
                </div>
                <div className="stream-meta mono-sm">scanning 1,247 posts</div>
              </div>
              <div className="stream-list" id="stream">
                {/* cards injected by client JS */}
              </div>
              <div className="stream-foot">
                <div className="mono-sm muted">intent score</div>
                <div className="intent-bar">
                  <div className="intent-fill" id="intentFill"></div>
                </div>
                <div className="mono-sm" id="intentVal">-- / 100</div>
              </div>
            </div>
            <div className="float-badge reveal">
              <div className="fb-num">60<span className="fb-unit">s</span></div>
              <div className="fb-label">avg brief<br />generation</div>
            </div>
          </aside>
        </div>

        {/* trust strip */}
        <div className="wrap trust-strip">
          <span className="mono-sm muted">Built on</span>
          <span className="trust-pill">1.8B+ Reddit posts</span>
          <span className="trust-dot">&middot;</span>
          <span className="trust-pill">Anthropic Claude</span>
          <span className="trust-dot">&middot;</span>
          <span className="trust-pill">Arctic Shift archive</span>
          <span className="trust-dot">&middot;</span>
          <span className="trust-pill">Real community data</span>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="section how">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow mono-sm"><span className="dot"></span> Workflow</div>
            <h2 className="h2">Three steps, start to brief.</h2>
          </div>

          <div className="steps">
            <article className="step reveal">
              <div className="step-num">01</div>
              <div className="step-tag mono-sm">discover</div>
              <h3 className="step-title">Describe your product.</h3>
              <p className="step-body">We pull up the subreddits where your audience actually hangs out, ranked by fit and how active they are.</p>
              <div className="step-art art-discover" aria-hidden="true">
                <div className="chip">r/SaaS <span className="score">94</span></div>
                <div className="chip">r/indiehackers <span className="score">91</span></div>
                <div className="chip">r/startups <span className="score">82</span></div>
                <div className="chip ghost">r/Entrepreneur <span className="score">71</span></div>
              </div>
            </article>

            <article className="step reveal">
              <div className="step-num">02</div>
              <div className="step-tag mono-sm">understand</div>
              <h3 className="step-title">Read the brief.</h3>
              <p className="step-body">Pain points, the language people use, what posts do well, and the sub&apos;s rules. Written from hundreds of real posts, not summarized keywords.</p>
              <div className="step-art art-brief" aria-hidden="true">
                <div className="brief-line long"></div>
                <div className="brief-line med"></div>
                <div className="brief-line long"></div>
                <div className="brief-box">
                  <div className="bb-label mono-sm">pain &middot; intensity</div>
                  <div className="bb-bars">
                    <i className="bb-bar-1"></i>
                    <i className="bb-bar-2"></i>
                    <i className="bb-bar-3"></i>
                  </div>
                </div>
              </div>
            </article>

            <article className="step reveal">
              <div className="step-num">03</div>
              <div className="step-tag mono-sm">monitor</div>
              <h3 className="step-title">Watch for buying-intent posts.</h3>
              <p className="step-body">A daily email of people asking for what you sell. Reply to the three worth replying to.</p>
              <div className="step-art art-monitor" aria-hidden="true">
                <div className="radar"></div>
                <div className="radar-ping r1"></div>
                <div className="radar-ping r2"></div>
                <div className="radar-ping r3"></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== SAMPLE BRIEF ===== */}
      <section id="brief" className="section brief-section">
        <div className="wrap">
          <div className="section-head center">
            <div className="eyebrow mono-sm"><span className="dot"></span> Inside a brief</div>
            <h2 className="h2">A sample brief for <span className="serif-i">r/indiehackers</span>.</h2>
            <p className="sub">This is what shows up. It reads like notes from someone who spent a week in the sub, because that&apos;s what the model is doing on your behalf.</p>
          </div>

          <div className="brief-doc reveal">
            <div className="doc-head">
              <div className="doc-head-l">
                <div className="doc-avatar">ih</div>
                <div>
                  <div className="doc-title">r/indiehackers - Audience Brief</div>
                  <div className="doc-sub mono-sm">generated &middot; 42s &middot; 214 posts &middot; 1,108 comments analyzed</div>
                </div>
              </div>
              <div className="doc-head-r">
                <span className="pill pill-ok">fit 94</span>
                <span className="pill pill-muted">high activity</span>
              </div>
            </div>

            <div className="doc-grid">
              {/* Pain Points */}
              <div className="doc-card">
                <div className="dc-head">
                  <span className="dc-label mono-sm">01 &middot; pain points</span>
                </div>
                <ul className="pain-list">
                  <li>
                    <span>Finding the first 100 users</span>
                    <b className="bars"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i></b>
                  </li>
                  <li>
                    <span>Marketing without a budget</span>
                    <b className="bars"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i></i></b>
                  </li>
                  <li>
                    <span>Imposter syndrome shipping solo</span>
                    <b className="bars"><i className="on"></i><i className="on"></i><i className="on"></i><i></i><i></i></b>
                  </li>
                  <li>
                    <span>Pricing in public without fear</span>
                    <b className="bars"><i className="on"></i><i className="on"></i><i></i><i></i><i></i></b>
                  </li>
                </ul>
              </div>

              {/* Language */}
              <div className="doc-card">
                <div className="dc-head">
                  <span className="dc-label mono-sm">02 &middot; language patterns</span>
                </div>
                <div className="lang-row">
                  <div className="lang-say">&ldquo;Built this in a weekend - roast me.&rdquo;</div>
                  <div className="lang-not">&ldquo;Our innovative solution leverages&hellip;&rdquo;</div>
                </div>
                <div className="lang-row">
                  <div className="lang-say">&ldquo;Hit $1K MRR, here&rsquo;s what didn&rsquo;t work.&rdquo;</div>
                  <div className="lang-not">&ldquo;Achieved significant revenue growth.&rdquo;</div>
                </div>
                <div className="lang-row">
                  <div className="lang-say">&ldquo;Scratching my own itch, YMMV.&rdquo;</div>
                  <div className="lang-not">&ldquo;Transforming the way founders&hellip;&rdquo;</div>
                </div>
              </div>

              {/* Content Strategy */}
              <div className="doc-card">
                <div className="dc-head">
                  <span className="dc-label mono-sm">03 &middot; what works</span>
                </div>
                <div className="cs-split">
                  <div>
                    <div className="cs-h works">Works</div>
                    <ul className="cs-list">
                      <li>Case studies with real numbers</li>
                      <li>Honest post-mortems (esp. failures)</li>
                      <li>Free tools with no signup</li>
                      <li>Weekly revenue transparency</li>
                    </ul>
                  </div>
                  <div>
                    <div className="cs-h fails">Fails</div>
                    <ul className="cs-list muted">
                      <li>Blatant self-promotion</li>
                      <li>Generic AI-written posts</li>
                      <li>Link-only submissions</li>
                      <li>&ldquo;I built this, check it out&rdquo;</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Intent */}
              <div className="doc-card">
                <div className="dc-head">
                  <span className="dc-label mono-sm">04 &middot; intent signals</span>
                </div>
                <div className="intent-list">
                  <div className="intent-row">
                    <div className="ir-text">&ldquo;Looking for a tool to analyze subreddits before posting&hellip;&rdquo;</div>
                    <div className="ir-score hi">92</div>
                  </div>
                  <div className="intent-row">
                    <div className="ir-text">&ldquo;Which Reddit analytics does everyone use now that GS is gone?&rdquo;</div>
                    <div className="ir-score hi">87</div>
                  </div>
                  <div className="intent-row">
                    <div className="ir-text">&ldquo;Tired of manual audience research - any automation?&rdquo;</div>
                    <div className="ir-score mid">71</div>
                  </div>
                  <div className="intent-row">
                    <div className="ir-text">&ldquo;Struggling to get my SaaS in front of the right people.&rdquo;</div>
                    <div className="ir-score mid">63</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section stats-section">
        <div className="wrap stats-wrap">
          <div className="stat reveal">
            <div className="stat-num">1.8<span className="unit">B+</span></div>
            <div className="stat-label">Reddit posts indexed</div>
            <div className="stat-note mono-sm">via Arctic Shift archive</div>
          </div>
          <div className="stat reveal">
            <div className="stat-num">60<span className="unit">s</span></div>
            <div className="stat-label">avg brief time</div>
            <div className="stat-note mono-sm">end-to-end, cached or fresh</div>
          </div>
          <div className="stat reveal">
            <div className="stat-num">100<span className="unit">+</span></div>
            <div className="stat-label">posts &amp; comments per brief</div>
            <div className="stat-note mono-sm">top + rising + controversial</div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE GRID ===== */}
      <section className="section features">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow mono-sm"><span className="dot"></span> What&apos;s inside</div>
            <h2 className="h2">What&apos;s in every&nbsp;<span className="serif-i">brief</span>.</h2>
          </div>

          <div className="feature-grid">
            <div className="feat feat-wide reveal">
              <div className="feat-tag mono-sm">pain points</div>
              <h3 className="feat-h">What the community keeps coming back to.</h3>
              <p className="feat-p">Themes, not keywords. Ranked by how often they come up and how heated they get.</p>
              <div className="feat-vis">
                <div className="pv-row"><span>Finding first 100 users</span><div className="pv-bar"><i data-w="92%" style={{ width: 0 }}></i></div><em className="mono-sm">92</em></div>
                <div className="pv-row"><span>Marketing without a budget</span><div className="pv-bar"><i data-w="78%" style={{ width: 0 }}></i></div><em className="mono-sm">78</em></div>
                <div className="pv-row"><span>Imposter syndrome</span><div className="pv-bar"><i data-w="64%" style={{ width: 0 }}></i></div><em className="mono-sm">64</em></div>
                <div className="pv-row"><span>Pricing confidence</span><div className="pv-bar"><i data-w="41%" style={{ width: 0 }}></i></div><em className="mono-sm">41</em></div>
              </div>
            </div>

            <div className="feat feat-narrow reveal">
              <div className="feat-tag mono-sm">language</div>
              <h3 className="feat-h">Say this, not that.</h3>
              <p className="feat-p">The phrasing the community upvotes, next to the phrasing that gets you called out.</p>
              <div className="feat-vis small">
                <div className="lang-pair"><span className="yes">&ldquo;Roast my landing page.&rdquo;</span><span className="no">&ldquo;Seeking constructive feedback.&rdquo;</span></div>
                <div className="lang-pair"><span className="yes">&ldquo;Here&rsquo;s what didn&rsquo;t work.&rdquo;</span><span className="no">&ldquo;Key learnings from our journey.&rdquo;</span></div>
              </div>
            </div>

            <div className="feat feat-narrow reveal">
              <div className="feat-tag mono-sm">content</div>
              <h3 className="feat-h">What posts actually take off here.</h3>
              <p className="feat-p">Format, length, tone, hook. Based on posts that crossed 100+ upvotes in this sub specifically.</p>
              <div className="feat-vis small">
                <div className="mini-post">
                  <div className="mp-meta mono-sm">u/you &middot; 2h &middot; r/indiehackers</div>
                  <div className="mp-title">Built this in a weekend - 412 signups, $0 spent.</div>
                  <div className="mp-stats mono-sm">&uarr; 1.2k &nbsp; &#128172; 218 &nbsp; &#9733; saved</div>
                </div>
              </div>
            </div>

            <div className="feat feat-wide reveal">
              <div className="feat-tag mono-sm">monitoring</div>
              <h3 className="feat-h">A daily digest of the posts worth replying to.</h3>
              <p className="feat-p">We watch your subreddits, score every new post for buying intent, and email you the top ones at 8am. Five minutes, done.</p>
              <div className="feat-vis">
                <div className="digest">
                  <div className="digest-head mono-sm">tuesday digest &middot; 7 high-intent posts</div>
                  <div className="digest-row"><span className="dr-score hi">94</span><span className="dr-text">&ldquo;Looking for a tool that analyzes subreddits before posting&rdquo;</span><span className="dr-sub mono-sm">r/SaaS &middot; 22m ago</span></div>
                  <div className="digest-row"><span className="dr-score hi">88</span><span className="dr-text">&ldquo;Which Reddit analytics now that GummySearch is gone?&rdquo;</span><span className="dr-sub mono-sm">r/indiehackers &middot; 1h ago</span></div>
                  <div className="digest-row"><span className="dr-score mid">72</span><span className="dr-text">&ldquo;Best way to validate a B2B niche on Reddit?&rdquo;</span><span className="dr-sub mono-sm">r/startups &middot; 3h ago</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section id="compare" className="section compare">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow mono-sm"><span className="dot"></span> The GummySearch alternative</div>
            <h2 className="h2">Built after&nbsp;<span className="serif-i">GummySearch shut down</span>.</h2>
            <p className="sub">Same kind of research, different data source, faster output. Here&apos;s how it stacks up.</p>
          </div>

          <div className="compare-table reveal">
            <div className="ct-head">
              <div></div>
              <div className="ct-col ct-ours">
                <span className="logo-mark sm"><LogoSvg size={16} /></span> RedIntelli
              </div>
              <div className="ct-col ct-them">GummySearch <span className="mono-sm muted">(shut down)</span></div>
              <div className="ct-col ct-them">Manual research</div>
            </div>
            <div className="ct-row">
              <div className="ct-label">AI-synthesized briefs</div>
              <div className="ct-cell ours"><span className="y">&#10003;</span></div>
              <div className="ct-cell"><span className="x">No</span></div>
              <div className="ct-cell"><span className="x">No</span></div>
            </div>
            <div className="ct-row">
              <div className="ct-label">Pain point intensity ranking</div>
              <div className="ct-cell ours"><span className="y">&#10003;</span></div>
              <div className="ct-cell"><span className="partial">Partial</span></div>
              <div className="ct-cell"><span className="x">No</span></div>
            </div>
            <div className="ct-row">
              <div className="ct-label">Say-this-not-that language</div>
              <div className="ct-cell ours"><span className="y">&#10003;</span></div>
              <div className="ct-cell"><span className="x">No</span></div>
              <div className="ct-cell"><span className="x">No</span></div>
            </div>
            <div className="ct-row">
              <div className="ct-label">Intent-scored daily digest</div>
              <div className="ct-cell ours"><span className="y">&#10003;</span></div>
              <div className="ct-cell"><span className="y">&#10003;</span></div>
              <div className="ct-cell"><span className="x">No</span></div>
            </div>
            <div className="ct-row">
              <div className="ct-label">Time to actionable insight</div>
              <div className="ct-cell ours"><b>~60 sec</b></div>
              <div className="ct-cell">~30 min</div>
              <div className="ct-cell">~6 hrs</div>
            </div>
            <div className="ct-row">
              <div className="ct-label">Monthly cost (indie plan)</div>
              <div className="ct-cell ours"><b>$29</b></div>
              <div className="ct-cell">$49</div>
              <div className="ct-cell">n/a</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section quotes">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow mono-sm"><span className="dot"></span> What founders are saying</div>
            <h2 className="h2">What founders are&nbsp;<span className="serif-i">actually saying</span>.</h2>
          </div>

          <div className="quote-grid">
            <figure className="quote reveal">
              <blockquote>&ldquo;I used to spend a Sunday reading a sub before posting. Now I spend a minute. My first Reddit post in r/SaaS hit 340 upvotes.&rdquo;</blockquote>
              <figcaption>
                <span className="q-avatar">mk</span>
                <span><b>Maya Kowalski</b><br /><span className="mono-sm muted">solo founder &middot; notion-for-lawyers</span></span>
              </figcaption>
            </figure>

            <figure className="quote reveal">
              <blockquote>&ldquo;The &lsquo;say this, not that&rsquo; section alone is worth the subscription. It&rsquo;s the first tool that told me my copy sounded like a LinkedIn post.&rdquo;</blockquote>
              <figcaption>
                <span className="q-avatar">dt</span>
                <span><b>Devon Tate</b><br /><span className="mono-sm muted">indie hacker &middot; $14K MRR</span></span>
              </figcaption>
            </figure>

            <figure className="quote reveal">
              <blockquote>&ldquo;GummySearch shutting down panicked us. RedIntelli replaced our whole Reddit workflow in a weekend - and the briefs are actually better.&rdquo;</blockquote>
              <figcaption>
                <span className="q-avatar">ar</span>
                <span><b>Ana Reyes</b><br /><span className="mono-sm muted">growth &middot; early-stage B2B</span></span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section faq">
        <div className="wrap faq-wrap">
          <div className="faq-left">
            <div className="eyebrow mono-sm"><span className="dot"></span> FAQ</div>
            <h2 className="h2">The questions people ask <span className="serif-i">before signing up</span>.</h2>
            <p className="sub">Can&apos;t find it? <Link className="link-u" href="mailto:ayucorp1304@gmail.com">Email the founder directly.</Link></p>
          </div>
          <div className="faq-list">
            {faqItems.map((item, i) => (
              <details key={i} className="faq-item" {...(item.open ? { open: true } : {})}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="section pricing">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow mono-sm"><span className="dot"></span> Pricing</div>
            <h2 className="h2">Start free. <span className="serif-i">Upgrade when it pays for itself.</span></h2>
          </div>

          <div className="price-grid">
            <div className="price-card reveal">
              <div className="pc-head">
                <div className="pc-name">Free</div>
                <div className="pc-sub">For trying it on.</div>
              </div>
              <div className="pc-price"><span className="currency">$</span>0<span className="per">/mo</span></div>
              <ul className="pc-list">
                <li>2 briefs / month</li>
                <li>3 tracked subreddits</li>
                <li>Daily digest (1 sub)</li>
                <li>Basic exports</li>
              </ul>
              <Link className="btn btn-ghost btn-block" href="/signup">Start free</Link>
            </div>

            <div className="price-card pc-feat reveal">
              <div className="pc-flag mono-sm">most founders pick this</div>
              <div className="pc-head">
                <div className="pc-name">Starter</div>
                <div className="pc-sub">For a serious side project.</div>
              </div>
              <div className="pc-price"><span className="currency">$</span>29<span className="per">/mo</span></div>
              <ul className="pc-list">
                <li>10 briefs / month</li>
                <li>10 tracked subreddits</li>
                <li>Daily digests, all subs</li>
                <li>Intent scoring &amp; export to CSV</li>
                <li>Priority brief queue</li>
              </ul>
              <Link className="btn btn-dark btn-block" href="/signup">Start 7-day trial</Link>
            </div>

            <div className="price-card reveal">
              <div className="pc-head">
                <div className="pc-name">Pro</div>
                <div className="pc-sub">For full-time operators.</div>
              </div>
              <div className="pc-price"><span className="currency">$</span>59<span className="per">/mo</span></div>
              <ul className="pc-list">
                <li>Unlimited briefs</li>
                <li>50 tracked subreddits</li>
                <li>Realtime intent alerts</li>
                <li>API access (beta)</li>
                <li>Slack + email digests</li>
              </ul>
              <Link className="btn btn-ghost btn-block" href="/signup">Go Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="section final-cta">
        <div className="wrap fc-inner">
          <h2 className="fc-h">Two briefs, free. <span className="serif-i">No card.</span></h2>
          <p className="fc-p">Your first brief takes about as long as making coffee.</p>
          <div className="cta-row center">
            <Link className="btn btn-dark btn-lg" href="/signup">
              Generate your first brief <span className="arrow">&rarr;</span>
            </Link>
            <a className="btn btn-ghost btn-lg" href="#pricing">See pricing</a>
          </div>
          <div className="micro center">
            <span className="check">&#10003;</span> No credit card &nbsp;&middot;&nbsp;
            <span className="check">&#10003;</span> 60-second setup &nbsp;&middot;&nbsp;
            <span className="check">&#10003;</span> Cancel in one click
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="foot">
        <div className="wrap foot-inner">
          <div className="foot-brand">
            <Link className="logo" href="/">
              <span className="logo-mark"><LogoSvg size={20} /></span>
              <span className="logo-word">RedIntelli</span>
            </Link>
            <p className="foot-tag">Reddit audience intelligence for operators who&rsquo;d rather ship than scrape.</p>
          </div>
          <div className="foot-cols">
            <div>
              <div className="foot-h mono-sm">product</div>
              <Link href="/discover">Briefs</Link>
              <Link href="/discover">Discovery</Link>
              <Link href="/monitoring">Monitoring</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
            <div>
              <div className="foot-h mono-sm">company</div>
              <a href="#">Changelog</a>
              <a href="#">Roadmap</a>
              <Link href="mailto:ayucorp1304@gmail.com">Contact</Link>
            </div>
            <div>
              <div className="foot-h mono-sm">legal</div>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="wrap foot-sub mono-sm">
          <span>&copy; 2026 RedIntelli</span>
          <span>Made for people who read the whole thread.</span>
        </div>
      </footer>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "RedIntelli",
            description:
              "Reddit audience intelligence tool for indie hackers and SaaS founders",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires a modern web browser",
            offers: [
              { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
              { "@type": "Offer", price: "29", priceCurrency: "USD", name: "Starter", priceValidUntil: "2027-12-31" },
              { "@type": "Offer", price: "59", priceCurrency: "USD", name: "Pro", priceValidUntil: "2027-12-31" },
            ],
          }),
        }}
      />
    </div>
  );
}
