# Echou: Project Guide

> **See space with sound.**
> A smartphone app that turns the speaker and microphones already in your phone into a sonar, so blind and low-vision people can sense walls, doors and obstacles around them, and so any app can get a sense of space.

**Team:** Parth Jaina · Vardaan Sharma · Manoj B S · Tharun B
**Former working name:** EchoSense
**Purpose of this document:** a complete reference (concept, science, engineering, market, UX, and a build plan for an interactive showcase website) so the team can design and build the site without re-deriving anything.

**Reading note:** items marked **[verify]** are figures or claims written from memory, not looked up. Check them against primary sources before they go on the public site or in front of judges.

---

## Table of contents

1. [One-paragraph summary](#1-one-paragraph-summary)
2. [The problem](#2-the-problem)
3. [Target users](#3-target-users)
4. [Market research](#4-market-research)
5. [The solution](#5-the-solution)
6. [The science: how sonar works](#6-the-science-how-sonar-works)
7. [Signal design](#7-signal-design)
8. [Processing pipeline](#8-processing-pipeline)
9. [Direction and mapping](#9-direction-and-mapping)
10. [User experience and feedback design](#10-user-experience-and-feedback-design)
11. [System architecture](#11-system-architecture)
12. [Spatial API](#12-spatial-api)
13. [Limits, risks and honest caveats](#13-limits-risks-and-honest-caveats)
14. [Roadmap](#14-roadmap)
15. [Interactive website plan](#15-interactive-website-plan)
16. [Website design system](#16-website-design-system)
17. [Website copy bank](#17-website-copy-bank)
18. [Glossary](#18-glossary)
19. [FAQ](#19-faq)
20. [Open questions](#20-open-questions)

---

## 1. One-paragraph summary

Echou emits very short, inaudible (near-ultrasonic) sound chirps from a phone's speaker and listens to the echoes with its microphones. Because sound travels at a known speed, the delay between chirp and echo gives the distance to whatever the sound bounced off. By repeating this many times per second and combining it with the phone's motion sensors, Echou builds a live picture of the space around the user. That picture is delivered as voice ("wall 1.5 metres ahead"), directional 3D audio tones, or vibration patterns, and is also exposed as a spatial API so other apps (AR, indoor navigation, robotics, games) can use it. It needs **no extra hardware**: only the phone the user already owns.

---

## 2. The problem

**Problem statement:** *Blind and low-vision people lack an affordable, hardware-free way to sense the space around them.*

Three concrete pain points:

| Pain point | What it means |
|---|---|
| **Limited reach** | A white cane detects only what it physically touches, within about an arm's length plus the cane. Overhead and chest-height obstacles are not detected at all. |
| **High cost** | Tools that sense beyond touch (sensor-equipped smart canes, wearables, LiDAR phones) need extra, often expensive hardware, which puts them out of reach for many users, especially in low-income settings. |
| **Unfamiliar spaces** | New rooms, public buildings and indoor spaces offer few tactile or audio cues. Users depend on memorised layouts or on help from other people. |

**Why now:** modern phones have good speakers, multiple microphones, fast processors and 48 kHz audio hardware. Smartphone penetration is high and still growing, including in India. The hardware for a sonar is already in people's pockets.

---

## 3. Target users

| Segment | Who | What they need |
|---|---|---|
| **Primary** | Blind and low-vision people | Hands-free awareness of walls, doors and obstacles, especially indoors and in unfamiliar places |
| **Secondary** | Orientation and mobility trainers, caregivers, rehabilitation centres, NGOs | A low-cost tool to support training and to hand to many learners |
| **Platform** | App developers (AR, games, indoor navigation, robotics, smart home) | A simple, device-only spatial sensing API |

### Example personas (for the website's storytelling section)

- **Asha, 24, student, totally blind.** Uses a cane and a screen reader. Finds new campus buildings stressful. Wants to know where the wall, door and stairs are without asking a stranger.
- **Mr. Rao, 61, lost vision gradually.** Struggles with unfamiliar rooms. Not tech-savvy; needs a very simple, voice-first experience.
- **Meera, orientation and mobility trainer.** Trains dozens of learners. Wants an affordable tool she can install on any phone.
- **Dev, indie app developer.** Wants room-awareness in an AR game without requiring a LiDAR phone.

### Design implication

The primary user cannot see the screen, so **the app must be fully operable by voice, touch and haptics**, and must be tested with blind users from day one (see roadmap).

---

## 4. Market research

### 4.1 Size of the need (approximate, **[verify]** all)

| Figure | Source to check |
|---|---|
| ~2.2 billion people with some vision impairment worldwide | WHO, *World Report on Vision* (2019) |
| ~43 million people who are blind worldwide (2020 estimate) | GBD Vision Loss Expert Group, *Lancet Global Health* (2020/2021) |
| ~5 million people with visual disability in India | Census of India 2011 (disability data) |

### 4.2 Existing options and their gaps

| Option | What it does | Limitation vs. Echou |
|---|---|---|
| **White cane** | Tactile detection of ground-level obstacles | Touch range only; misses overhead obstacles |
| **Smart / ultrasonic canes** (e.g. WeWALK, UltraCane) **[verify]** | Add sensors to a cane to detect obstacles beyond touch | Extra, costly hardware; must replace or modify the cane |
| **Wearable sonar bands** (e.g. Sunu Band) **[verify]** | Wrist-worn sonar that vibrates near obstacles | Extra hardware |
| **AI scene-description apps** (Be My Eyes, Seeing AI, Google Lookout) | Describe objects, read text, connect to volunteers | Describe scenes; do not give continuous distance and direction. Need camera framing and often internet |
| **LiDAR phones** (iPhone Pro with Magnifier detection features) **[verify]** | Camera and LiDAR based people and door detection | Only on Pro-tier phones; needs good camera aim |
| **Echou** | Sonar from a normal phone's speaker and mics | **Any phone, no add-ons, works in the dark** |

### 4.3 Positioning

> The only approach that gives **continuous distance sensing on an ordinary phone, with zero extra hardware**.

Honest positioning note: ultrasonic obstacle sensing already exists in dedicated devices, so Echou's novelty is **doing it on commodity phones in software**, plus the open spatial API. Do not claim the idea of ultrasonic obstacle detection is new.

### 4.4 Related academic work (to cite on the site)

Smartphone-based active acoustic sensing is an established research area (examples to look up: *EchoTag*, *FingerIO*, and other work on smartphone sonar). **These are from memory and may be inaccurate; confirm the exact titles, authors and years before citing.**

### 4.5 Business model ideas (optional section)

- Free core accessibility app (mission first), funded by grants, NGOs and CSR programmes.
- Paid developer tier of the spatial API for commercial apps.
- Institutional licences for rehabilitation centres and schools for the blind.

---

## 5. The solution

### 5.1 The idea in four steps

1. **Chirp:** the speaker emits a short sweep of sound at about 18–22 kHz, above what most adults hear.
2. **Echo:** the microphones record the sound that bounces back from walls and objects.
3. **Delay:** the app measures the time between emission and each echo.
4. **Map:** delays become distances; distances and directions become a map and spoken or haptic cues.

### 5.2 Key benefits

- **No extra hardware:** runs on a phone the user already owns.
- **Works in the dark:** sound needs no light or camera.
- **Hands-free and private:** can run with the phone in a chest pocket or lanyard, with audio through bone-conduction or open-ear headphones so ambient sounds are not blocked.
- **Open spatial API:** the same sensing powers other apps.

### 5.3 What Echou is *not*

It is **not** a replacement for a white cane or guide dog. It is an **additional sense** that extends awareness. This must be said clearly on the site and in the app (safety and trust).

---

## 6. The science: how sonar works

### 6.1 Core formula

```
distance = (speed of sound × echo delay) ÷ 2
```

The division by two is because the sound travels **out and back**.

- Speed of sound in air: **c ≈ 331.3 + 0.606 × T** m/s, where T is air temperature in °C. At 20 °C, c ≈ **343 m/s**.
- Temperature changes c noticeably (about 0.18% per °C), so the app should estimate or calibrate c (see 8.7).

### 6.2 Worked examples (use these directly in the website's calculator)

| Object distance | Round-trip time at 343 m/s |
|---|---|
| 0.5 m | ≈ 2.9 ms |
| 1.0 m | ≈ 5.8 ms |
| 1.5 m | ≈ 8.7 ms |
| 3.0 m | ≈ 17.5 ms |
| 5.0 m | ≈ 29.2 ms |

Formula for the site: `t = 2 × d / c`  and  `d = c × t / 2`.

### 6.3 Why near-ultrasound (18–22 kHz)?

- **Inaudible to most adults:** hearing sensitivity drops sharply above ~17–18 kHz (younger people and some others may still faintly hear the low end; keep volume moderate and consider starting nearer 19 kHz).
- **Within phone hardware limits:** phones typically sample audio at 44.1 or 48 kHz. At 48 kHz sampling the Nyquist limit is 24 kHz, so 18–22 kHz is representable. Many phone speakers and microphones still respond usefully up to ~20–22 kHz, though sensitivity falls off **[verify per device]**.
- **Short wavelength:** at 20 kHz the wavelength is about 343 / 20000 ≈ **17 mm**, so objects larger than a couple of centimetres reflect the sound.

**Not radio waves:** this is *acoustic* sonar. Radio waves (radar) are electromagnetic and a phone cannot emit them for this purpose. Make this distinction explicit on the site.

### 6.4 Resolution and range

**Range resolution** (how close two echoes can be and still be separated):

```
ΔR = c / (2 × B)
```

where B is the chirp bandwidth. With B = 4 kHz (18–22 kHz): ΔR ≈ 343 / 8000 ≈ **4.3 cm** (theoretical).

**Sample resolution:** at 48 kHz, one sample = 20.8 µs, which corresponds to about **3.6 mm** of one-way range. Peak interpolation can refine this, but real accuracy is limited by noise and the speed-of-sound estimate, so the honest claim is "centimetre-level in good conditions".

**Maximum range** is limited by signal loss, not by timing:

- Spreading loss: the echo gets weaker as distance grows.
- Air absorption at ~20 kHz: roughly **0.5–1 dB per metre**, depending on humidity **[verify]**.
- Surface reflectivity: hard, flat surfaces reflect well; soft surfaces (curtains, clothing, upholstery) absorb.
- Practical target for a phone: **about 3–5 m** for large hard surfaces, less for small or soft ones. Treat 5 m as a *target to validate*, not a guarantee.

**Unambiguous range** is set by how often chirps are sent: `R_max = c × PRI / 2`. A pulse repetition interval (PRI) of 60 ms gives ≈ 10 m before a late echo could be confused with the next chirp's echo.

### 6.5 What the echo physically looks like

- **Specular reflection:** smooth flat walls reflect sound like a mirror. If the wall is at a steep angle to the phone, the echo may bounce away and never return. Walls are easiest to detect when roughly facing the phone.
- **Diffuse reflection:** rough or irregular surfaces scatter sound, producing weaker but more direction-independent echoes.
- **Multipath:** echoes can bounce twice (wall to wall to phone), creating ghost objects farther away than the real ones. The algorithm should favour the nearest strong echo.

---

## 7. Signal design

### 7.1 Why a chirp, not a plain beep

A **chirp** (frequency sweep) spreads energy over a band, which allows **pulse compression**: correlating the received signal with the known chirp produces a sharp peak even when the echo is buried in noise. A single-frequency beep gives poor timing precision.

### 7.2 Recommended starting parameters

| Parameter | Starting value | Notes |
|---|---|---|
| Sample rate | 48,000 Hz | Native on most phones |
| Start / end frequency | 18,000 → 22,000 Hz | Tune per device; some phones roll off near 20 kHz |
| Bandwidth B | 4,000 Hz | Gives ~4.3 cm theoretical range resolution |
| Chirp duration T | 3–10 ms | Short = better near range; long = more processing gain |
| Pulse repetition interval | 40–60 ms | ~17–25 updates per second |
| Window | Tukey or Hann taper on the chirp edges | Reduces spectral splatter (audible clicks) and correlation side-lobes |
| Output level | Moderate | Avoid distortion and discomfort; consider pets (see 13) |

**Time-bandwidth product** `B × T`: with B = 4 kHz and T = 10 ms, BT = 40, which gives roughly `10·log10(40) ≈ 16 dB` of processing gain. With T = 3 ms, BT = 12, about 10.8 dB. This is the trade-off between near-range performance and sensitivity.

### 7.3 Chirp equation (linear sweep)

```
s(t) = w(t) · sin( 2π · ( f0·t + (k/2)·t² ) ),   0 ≤ t ≤ T
k = (f1 − f0) / T     (sweep rate in Hz/s)
```

where `w(t)` is the window.

### 7.4 Reference code (JavaScript, for website demos and for prototypes)

```js
// Generate a linear chirp as a Float32Array
function makeChirp({ fs = 48000, f0 = 18000, f1 = 22000, durationMs = 5 }) {
  const n = Math.round(fs * durationMs / 1000);
  const k = (f1 - f0) / (durationMs / 1000);       // Hz per second
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    const phase = 2 * Math.PI * (f0 * t + 0.5 * k * t * t);
    // Tukey-ish taper: 10% fade in / fade out
    const edge = Math.min(i, n - 1 - i) / (0.1 * n);
    const w = edge >= 1 ? 1 : 0.5 * (1 - Math.cos(Math.PI * edge));
    out[i] = w * Math.sin(phase);
  }
  return out;
}
```

### 7.5 Reference code (Python, for lab prototyping with a laptop)

```python
import numpy as np
from scipy.signal import chirp, correlate, butter, sosfiltfilt, find_peaks

fs = 48_000
T = 0.005
t = np.arange(0, T, 1/fs)
tx = chirp(t, f0=18_000, f1=22_000, t1=T, method="linear")
tx *= np.hanning(len(tx))            # taper

def estimate_distances(rx, c=343.0, min_dist=0.2):
    # 1. band-pass around the chirp band
    sos = butter(6, [17_500, 22_500], btype="band", fs=fs, output="sos")
    rx = sosfiltfilt(sos, rx)
    # 2. matched filter (cross-correlation with the transmitted chirp)
    mf = np.abs(correlate(rx, tx, mode="full", method="fft"))[len(tx)-1:]
    # 3. peak picking
    thr = 6 * np.median(mf)           # simple adaptive threshold
    peaks, props = find_peaks(mf, height=thr,
                              distance=int(fs * 0.002))   # >=2 ms apart
    delays = peaks / fs
    dists = c * delays / 2
    return [(d, mf[p]) for d, p in zip(dists, peaks) if d >= min_dist]
```

(The 0.2 m minimum hides the direct speaker-to-mic leakage; see 8.3.)

---

## 8. Processing pipeline

```
 [Chirp generator] → [Speaker] ~~~ air ~~~ [Objects] ~~~ air ~~~ [Microphones]
                                                              │
   ┌──────────────────────────────────────────────────────────┘
   ▼
 1 Raw audio capture (no AGC / noise suppression)
   ▼
 2 Band-pass filter (≈17.5–22.5 kHz)
   ▼
 3 Direct-path removal (speaker→mic leakage)
   ▼
 4 Matched filter (cross-correlation with chirp)
   ▼
 5 Envelope detection
   ▼
 6 Time-gain compensation (boost late echoes)
   ▼
 7 Peak detection (adaptive threshold / CFAR)
   ▼
 8 Distance + confidence per echo
   ▼
 9 Direction estimate (multi-mic) + motion fusion (IMU)
   ▼
10 Tracking and occupancy map
   ▼
11 Feedback engine (voice / 3D audio / haptics) + API
```

### 8.1 Capture settings (very important)

Phones apply **automatic gain control, noise suppression and echo cancellation** designed for voice. These can destroy or distort the ultrasonic echo. The app must request the rawest possible audio:

- **Android:** use `AudioRecord` with an *unprocessed* audio source where supported, and low-latency (`AAudio` / `Oboe`) paths. **[verify device support]**
- **iOS:** use `AVAudioEngine` with `AVAudioSession` in *measurement* mode to minimise processing. **[verify]**
- **Web (for the website live demo):** `getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })`.

### 8.2 Synchronisation

Play and record on the **same audio clock** so the delay measurement is trustworthy. Latency between "play" and "record" start must be calibrated once per device (loopback or known-distance calibration) and subtracted.

### 8.3 Direct-path leakage

The strongest thing the mic hears is the chirp coming straight from the speaker. It arrives within the first fraction of a millisecond and can mask very close echoes.

- Gate out the first ~1–2 ms.
- Subtract a stored "empty-room leakage template" recorded at calibration.
- Use shorter chirps for the near range (a short chirp ends before close echoes arrive).

### 8.4 Matched filtering

Cross-correlate the filtered recording with the known chirp. The output peaks at each echo delay. Doing this via FFT keeps it cheap enough for real-time use on a phone.

### 8.5 Time-gain compensation (TGC)

Echoes from far objects are much weaker. Multiply the envelope by a gain that rises with delay so near and far objects are comparable before thresholding. Choose the gain curve from measured attenuation.

### 8.6 Detection

Use an **adaptive threshold** (for example CFAR, constant false-alarm rate: compare each sample to the local average noise level) instead of a fixed number, so it works in both quiet and noisy rooms. Keep the first strong peak as the nearest obstacle; treat later peaks with suspicion (multipath).

### 8.7 Speed-of-sound calibration

Because c changes with temperature, offer a 5-second **calibration step** against a known distance (for example the phone held 0.5 m from a wall using a printed ruler), or read temperature from a phone sensor where available, or from a weather API when online. The effect is small (about 0.6 m/s per °C) but matters for accuracy claims.

### 8.8 Ambient noise handling

- Most everyday noise (speech, traffic) is below 10 kHz, so band-pass filtering removes it.
- Sources that *do* have ultrasonic content: ultrasonic pest repellers, some sensors, jangling keys, hissing sounds, escaping air, and other sonar users nearby. Detect narrowband interference and hop the chirp band if needed.

---

## 9. Direction and mapping

This is the **hardest part** of the project and the part to present most carefully.

### 9.1 What a single speaker plus few mics can do

A phone usually has 2–3 microphones. Measuring the **time difference of arrival (TDOA)** of an echo between two mics gives an angle:

```
sin(θ) = (c × Δt) / d
```

where `d` is mic spacing (a phone is roughly 15 cm long, so the largest mic separation is about 15 cm). Maximum possible delay ≈ 0.15 / 343 ≈ **437 µs ≈ 21 samples at 48 kHz**. Angular resolution is therefore coarse, and the mic pair usually lies along the phone's **long axis**, so the angle is measured relative to that axis with a front/back-style ambiguity.

### 9.2 Making direction practical

| Approach | How | Trade-off |
|---|---|---|
| **TDOA with 2+ mics** | Echo arrival-time difference gives a coarse angle | Coarse; depends on phone mic layout |
| **Scan by motion (recommended core idea)** | User sweeps the phone gently left-right (or walks); the gyroscope/IMU provides orientation per chirp. Each distance reading is attached to a bearing and combined over time | Needs user motion; very effective |
| **Beamforming with speaker array** | Not possible with a single phone speaker; some phones have stereo speakers, giving limited steering | Hardware dependent |
| **Echo-profile shape** | A wall ahead gives a single clean peak; a corridor gives two side echoes; a doorway shows a distance jump | Good for semantic hints ("opening ahead") |

**Recommended product framing:** *Phase 1 is obstacle and wall ranging in front of the user (single-direction distance). Phase 2 adds approximate direction by combining mic timing with phone motion. Phase 3 builds the room map.*

### 9.3 Occupancy grid mapping

Represent the room as a 2D grid (for example 5 cm cells, 8 m × 8 m). Each cell stores a **log-odds** probability of being occupied.

For each echo at distance `d` and bearing `θ` (from IMU yaw plus TDOA):
- Cells along the ray before `d` get **free-space evidence** (lower log-odds).
- The cell at `d` gets **occupied evidence** (higher log-odds).
- Decay old evidence slowly so moving people and objects fade.

Pseudocode:

```
for each measurement (d, theta, confidence):
    for each cell on ray from user to (d, theta):
        grid[cell] += L_FREE      # negative evidence
    grid[end_cell] += L_OCC * confidence
clamp grid values to [L_MIN, L_MAX]
```

### 9.4 Position tracking

Use IMU (gyroscope, accelerometer, magnetometer) for heading. Step counting or visual-inertial odometry can estimate position change; for an early version, assume the user is **mostly stationary or scanning in place**, and only update heading.

### 9.5 What to say to users

Convert the grid into short, useful statements:

- "Wall 1.5 metres ahead."
- "Open space to your left."
- "Doorway slightly to your right, about 2 metres."
- "Obstacle very close, stop."

---

## 10. User experience and feedback design

### 10.1 Principles

1. **Voice-first, not screen-first.** Every action must be possible through screen reader gestures (TalkBack / VoiceOver), a hardware button, or voice.
2. **Short and prioritised.** Speak only what matters now; never flood the user with audio.
3. **Don't mask the real world.** Blind users rely heavily on environmental sound. Prefer **bone-conduction or open-ear headphones**; never fully cover the ears.
4. **Tunable.** Verbosity, volume, units, voice speed and feedback mode all adjustable.
5. **Fail safe.** If sensing quality is low, say so ("sensing is unreliable here") instead of guessing.

### 10.2 Three feedback channels

| Channel | How it behaves | Best for |
|---|---|---|
| **Voice guidance** | Text-to-speech phrases with distance and direction | Learning, explanations, new places |
| **3D / spatial audio cues** | A short tone positioned in 3D space toward the obstacle; pitch or repeat rate encodes distance | Continuous walking awareness |
| **Haptic feedback** | Vibration pulses that speed up as the obstacle gets closer | Noisy places, silent mode |

Suggested mapping: distance 3 m → one slow pulse per second; 1.5 m → about three pulses per second; under 0.5 m → near-continuous vibration.

### 10.3 Modes

- **Explore:** the phone gently scans; the app narrates the room layout.
- **Walk:** continuous obstacle alerts ahead only.
- **Find:** "find a door / wall / open space" using echo-profile hints.
- **Train:** for mobility trainers; shows what the app senses.

### 10.4 Onboarding (voice-led)

1. Welcome and safety notice (not a replacement for a cane).
2. Permission request for microphone.
3. Volume and frequency check ("Can you hear a faint hiss or click? If so, tap here" so the app can lower or shift the band).
4. 5-second calibration against a wall.
5. Short practice with a wall.

### 10.5 Accessibility checklist for the app

- Full screen-reader labels, logical focus order, large touch targets.
- No time-limited interactions.
- Haptic confirmation for every action.
- High-contrast, large-text visual UI for low-vision users (not just blind users).
- Support for Indian languages in speech output **[plan which]**.

---

## 11. System architecture

```
┌──────────────────────────────── Phone ────────────────────────────────┐
│                                                                        │
│  Audio I/O layer        DSP core               Fusion & mapping        │
│  ───────────────        ────────               ────────────────        │
│  Chirp scheduler  ──►   Band-pass              IMU reader (yaw)        │
│  Low-latency play       Matched filter    ──►  Direction estimator     │
│  Raw capture            TGC + detector         Occupancy grid          │
│                         Confidence score       Obstacle tracker        │
│                                                                        │
│  Feedback engine                    Spatial API (local, on-device)     │
│  ───────────────                    ───────────────────────────        │
│  TTS · 3D audio · Haptics           Events + map for other apps        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Design decisions**

- **Everything on-device:** low latency, works offline, and keeps privacy (the app only needs to listen for its own chirps; audio should not be stored or uploaded).
- **DSP in native code** (C++/Rust via Android NDK / iOS) for tight timing; UI in Kotlin/Swift or a cross-platform framework with native audio modules.
- **Prototype first in Python / Web Audio** to prove physics, then port.

### Suggested stack

| Layer | Prototype | Production |
|---|---|---|
| DSP lab | Python (NumPy, SciPy), laptop speaker + mic | C++ / Rust core |
| Mobile app | Android first (more control over raw audio) | Android + iOS |
| Audio I/O | Web Audio API for demos | Oboe/AAudio (Android), AVAudioEngine (iOS) |
| Feedback | Web Speech API (demo) | Platform TTS, spatial audio APIs, haptics APIs |
| Showcase website | HTML/CSS/JS or React + Vite | Same, hosted on a static host |

### Privacy and safety statements

- The app uses the microphone only to hear its own sonar echoes; no recording is stored or sent.
- Clear in-app note: **a supplementary aid, not a replacement for a cane or guide dog.**

---

## 12. Spatial API

A small, stable interface so other apps can consume what Echou senses.

### 12.1 Events

```json
{
  "type": "obstacle",
  "timestamp_ms": 1739800000123,
  "distance_m": 1.52,
  "bearing_deg": -8,
  "confidence": 0.86,
  "surface_hint": "flat"
}
```

```json
{
  "type": "opening",
  "distance_m": 2.1,
  "bearing_deg": 25,
  "width_m_estimate": 0.9,
  "confidence": 0.61
}
```

### 12.2 Map snapshot

```json
{
  "type": "map",
  "cell_size_m": 0.05,
  "origin": { "x_m": 0, "y_m": 0 },
  "size_cells": [160, 160],
  "encoding": "log_odds_int8",
  "data": "<base64 payload>",
  "user_pose": { "x_m": 4.0, "y_m": 4.0, "yaw_deg": 90 }
}
```

### 12.3 Methods (sketch)

```
Echou.start({ band: [18000, 22000], updatesPerSecond: 20 })
Echou.stop()
Echou.on("obstacle", handler)
Echou.on("opening", handler)
Echou.getMap() → map snapshot
Echou.calibrate({ knownDistanceM: 0.5 })
```

### 12.4 Use cases to show on the site

| Domain | Example |
|---|---|
| **AR and gaming** | Place virtual objects that respect real walls without LiDAR |
| **Indoor navigation** | Add obstacle awareness to turn-by-turn guidance in buildings |
| **Robotics** | Cheap obstacle sensing for hobby robots using a phone as the sensor head |
| **Smart home** | Presence and room-layout awareness without cameras (privacy-friendly) |

---

## 13. Limits, risks and honest caveats

Being upfront builds credibility with judges, users and developers. Include a short version of this on the site.

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Speaker/mic roll-off near 20 kHz** | Many phones are weak above ~20 kHz, reducing range | Per-device calibration; auto-select best sub-band; test on many phones |
| **Soft and angled surfaces** | Curtains, clothing, upholstery absorb; angled walls reflect away | Be honest about it; use motion scanning; treat missing echo as "unknown", not "free" |
| **Phone motion blurs echoes** | Moving while ranging changes geometry mid-measurement | Short chirps, IMU compensation, scanning mode |
| **Limited direction accuracy** | Few mics, small spacing | Phase 1 forward ranging; motion scanning; set expectations |
| **Audio processing by the OS** | AGC / noise suppression can ruin echoes | Raw audio sources; device compatibility list |
| **Interference** | Other ultrasound sources, other Echou users | Band hopping; coded chirps |
| **Audibility** | Some people (especially children and young adults) may hear 18–19 kHz | Start frequency adjustable, volume limits, onboarding audibility check |
| **Pets and animals** | Dogs and cats hear well above 20 kHz and may be bothered | Low output level, short duty cycle, warning in docs; test with care |
| **Over-trust and safety** | A wrong "all clear" could cause harm | Never claim reliability beyond tested limits; fail-safe messaging; cane remains primary |
| **Battery and heat** | Continuous audio processing | Duty-cycle chirps, adaptive rate, native low-latency code |
| **Latency** | Late alerts are useless | Low-latency audio paths, processing under ~50 ms |
| **Not yet validated** | The performance numbers here are theoretical | Prototype measurements with real phones and real users before public claims |

---

## 14. Roadmap

### Phase 0: Physics proof (laptop or one phone)
- Generate a chirp, record the echo, plot the matched-filter output.
- Measure distance to a wall at 0.5, 1, 2, 3 m; record error vs. a tape measure.
- **Exit criterion:** repeatable distance error of a few centimetres in a quiet room.

### Phase 1: Prototype app (Android)
- Real-time chirp, echo detection and distance readout on one phone.
- Voice and haptic feedback for forward obstacle distance.
- Calibration step and device compatibility notes.

### Phase 2: Pilot with users
- Test with blind and low-vision volunteers through NGOs and rehabilitation centres, with trainers present.
- Add direction estimation (mic timing + motion scanning).
- Iterate on feedback design based on real use.

### Phase 3: Platform
- Room mapping and the open spatial API.
- iOS port, more languages, developer documentation and sample apps.

### Metrics to track

- Distance error (cm) vs. true distance and surface type.
- Detection rate of walls, doors and people at 1, 2, 3, 5 m.
- Latency (ms) from echo to feedback.
- Battery per hour of use.
- User success rate on simple navigation tasks and subjective trust scores.

---

## 15. Interactive website plan

**Goal:** a showcase site that lets anyone *feel* how Echou works in under a minute, and also serves as the team's pitch material.

### 15.1 Site map (single page with sections, or a few pages)

1. **Hero:** headline, tagline, animated sonar ripples, "See how it works" button.
2. **The problem:** the three pain points, with the key statistic.
3. **How sound sees (Echo Simulator):** the interactive core. See 15.2.
4. **Chirp Lab:** explore the signal. See 15.3.
5. **Room Mapper:** the spatial demo. See 15.4.
6. **Hear it:** voice, 3D audio and haptic feedback demo. See 15.5.
7. **Live Lab (optional):** measure a real distance with the visitor's own laptop or phone. See 15.6.
8. **Who it's for:** personas.
9. **Market and comparison:** stats and the competitor table.
10. **Roadmap and honest limits.**
11. **Team and contact.**
12. **FAQ.**

### 15.2 Module: Echo Simulator ("How sound sees")

**What it shows:** a top-down scene with a phone icon and a wall. The user drags the wall (or uses a slider). A pulse ring expands from the phone, hits the wall, and an echo ring returns, with the timeline shown below.

**UI elements**
- Draggable wall; distance readout in metres.
- Timeline bar showing "chirp sent", "echo received", with the measured delay in ms.
- Live formula panel: `d = c × t ÷ 2` with the numbers filled in.
- Temperature slider (changes c; shows how distance estimate shifts).
- Toggle: "slow motion" (so ~9 ms is visible to humans), with a note that real sound takes only milliseconds.

**Logic**
```js
const c = 331.3 + 0.606 * tempC;        // m/s
const delaySec = 2 * distance / c;      // true round trip
// animate pulse at (c * slowMotionFactor) in scene units
```

**Accessibility:** announce distance and delay via an `aria-live` region; keyboard control (arrow keys move the wall in 0.1 m steps).

### 15.3 Module: Chirp Lab

**What it shows:** a spectrogram-style canvas of the chirp and of a simulated echo returning with noise.

**Controls:** start frequency, end frequency, duration, window on/off, noise level.
**Outputs (live):** bandwidth, range resolution `c / (2B)`, time-bandwidth product and processing gain in dB, and the matched-filter output plot with a clear peak.
**Teaching moment:** show a plain beep versus a chirp, with the correlation peak much sharper for the chirp.
**Audio (optional):** a "scaled-down" audible version (for example 1–3 kHz) so visitors can *hear* the idea of a sweep, with a clear label that the real signal is inaudible. Keep volume safe and start muted.

### 15.4 Module: Room Mapper

**What it shows:** a top-down room with draggable furniture, walls and a doorway. A user avatar stands in the middle and can rotate (drag or arrow keys). As it rotates, rays are cast; each ray's distance builds an **occupancy grid** that appears on a second panel.

**Controls**
- Add or move objects; choose material (hard, soft) to change echo strength.
- Noise slider; "phone sweep speed".
- Toggle "show true room" vs. "show Echou's map".
- Toggle ghost echoes (multipath) to show a limitation honestly.

**Logic:** ray-casting against the room geometry, add Gaussian noise to distance, apply the occupancy-grid update from section 9.3, drop echoes when a soft material or steep angle makes the reflection too weak.

### 15.5 Module: Hear it (feedback demo)

- A sliding "obstacle distance" control drives three outputs at once:
  - **Voice:** `speechSynthesis` speaks "Wall 1.5 metres ahead".
  - **3D audio:** a tone through a Web Audio `PannerNode` positioned by bearing, with pitch or repeat rate tied to distance.
  - **Haptics:** `navigator.vibrate()` patterns on supported phones, plus an on-screen pulsing indicator for desktops.
- A "close your eyes" mode: dark screen, only audio, to let sighted visitors experience the feedback.
- Prominent mute and volume cap.

### 15.6 Module: Live Lab (optional wow factor)

Measure a real distance with the visitor's device.

1. Ask for microphone permission with a clear explanation.
2. Request raw audio (no echo cancellation, noise suppression or AGC).
3. Play the chirp, record, run matched filtering in the browser, show the peak and distance.
4. Show an honest quality indicator and a message if the device or browser blocks ultrasonic playback.

**Caveats to display:** laptop speakers and mics vary widely; many cannot produce or capture clean 20 kHz; results are a demo, not a benchmark. Provide a **fallback mode** using a lower, audible chirp (clearly labelled) for devices that cannot do ultrasound. Warn about volume and pets. Nothing is recorded or uploaded.

### 15.7 Technology suggestions for the site

| Need | Suggestion |
|---|---|
| Framework | Plain HTML/CSS/JS, or React + Vite for component reuse |
| Animation / canvas | Canvas 2D for ripples and grid; optional Three.js for 3D room view |
| Audio | Web Audio API (`OscillatorNode` or `AudioBuffer`, `PannerNode`, `AnalyserNode`) |
| DSP in the browser | Small hand-written FFT or a lightweight library; AudioWorklet for low-latency capture |
| Speech | Web Speech API (`speechSynthesis`) |
| Haptics | Vibration API (mobile browsers that support it) |
| Styling | CSS variables, `backdrop-filter` glass effect (see section 16) |
| Hosting | Any static host (GitHub Pages, Netlify, Vercel) |

### 15.8 Website accessibility (the site itself must be accessible)

- The audience includes blind and low-vision visitors: semantic HTML, headings in order, alt text, keyboard operable demos, `aria-live` for dynamic readouts.
- Respect `prefers-reduced-motion` (turn ripples into a static illustration).
- Respect `prefers-color-scheme`; keep text contrast at WCAG AA or better.
- No autoplay audio; every sound starts only on a user action and is easily muted.
- Provide text descriptions for every interactive module.

### 15.9 Suggested file structure

```
echou-site/
├─ index.html
├─ css/
│  ├─ tokens.css          (colors, spacing, glass tokens)
│  └─ styles.css
├─ js/
│  ├─ main.js             (section wiring, scroll reveals)
│  ├─ physics.js          (speed of sound, delay, resolution formulas)
│  ├─ chirp.js            (chirp generator, matched filter)
│  ├─ simulator.js        (Echo Simulator)
│  ├─ chirplab.js         (Chirp Lab)
│  ├─ roommapper.js       (Room Mapper, occupancy grid)
│  ├─ feedback.js         (voice, 3D audio, haptics)
│  └─ livelab.js          (optional live measurement)
└─ assets/
   ├─ icons/
   └─ og-image.png
```

### 15.10 Build order (suggested)

1. Static page with hero, problem, solution, team, FAQ (the pitch works even before demos).
2. Echo Simulator (simplest, highest impact).
3. Hear it (feedback demo).
4. Chirp Lab.
5. Room Mapper.
6. Live Lab (only if time allows).
7. Accessibility and performance pass; test on a real phone.

---

## 16. Website design system

**Style direction:** Apple-inspired and **glassmorphic**, matching the presentation: large bold headings, generous whitespace, soft frosted cards over a colourful blurred gradient background, one blue accent.

### 16.1 Design tokens

```css
:root {
  /* Colour */
  --ink: #1D1D1F;
  --ink-soft: #55555B;
  --paper: #FFFFFF;
  --canvas: #F5F5F7;
  --accent: #0071E3;      /* primary blue */
  --purple: #BF5AF2;
  --teal:   #5AC8FA;
  --orange: #FF9F0A;
  --green:  #30D158;

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.52);
  --glass-border: rgba(255, 255, 255, 0.8);
  --glass-shadow: 0 8px 32px rgba(29, 58, 138, 0.12);
  --glass-blur: 18px;

  /* Shape & type */
  --radius: 20px;
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter",
          "Segoe UI", Arial, sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #F5F5F7;
    --ink-soft: #A1A1A6;
    --canvas: #000000;
    --glass-bg: rgba(40, 40, 44, 0.55);
    --glass-border: rgba(255, 255, 255, 0.18);
  }
}
```

### 16.2 Glass card

```css
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(160%);
          backdrop-filter: blur(var(--glass-blur)) saturate(160%);
}
```

### 16.3 Background

A soft gradient with large blurred colour blobs (blue top-right, purple bottom-left, teal centre, faint orange and green accents) fixed behind the page so glass cards always have something to blur.

```css
body {
  background:
    radial-gradient(60vmax 60vmax at 90% 5%,  rgba(0,113,227,.35), transparent 60%),
    radial-gradient(60vmax 60vmax at 5% 95%,  rgba(191,90,242,.28), transparent 60%),
    radial-gradient(40vmax 40vmax at 55% 60%, rgba(90,200,250,.33), transparent 60%),
    linear-gradient(135deg, #F8FAFF, #E6EEFF);
  background-attachment: fixed;
}
```

### 16.4 Typography

| Role | Size | Weight |
|---|---|---|
| Hero headline | clamp(2.8rem, 7vw, 5.5rem) | 700 |
| Section title | clamp(2rem, 4vw, 3rem) | 700 |
| Card title | 1.25rem | 600 |
| Body | 1.0625rem (17px) | 400 |
| Caption | 0.8125rem | 400 |

### 16.5 Motion

- Sonar ripple: concentric circles expanding from the hero dot (CSS keyframes or canvas), 3-second loop.
- Scroll reveals: fade and rise by 16 px, 400 ms ease-out.
- Always provide the reduced-motion fallback.

### 16.6 Colour meaning (keep consistent across demos)

| Element | Colour |
|---|---|
| The user / phone | Accent blue |
| Outgoing chirp | Blue ripple |
| Returning echo | Teal ripple |
| Obstacle | Orange |
| Free / safe space | Green (soft) |
| Warning / too close | Red-pink `#FF375F` |

---

## 17. Website copy bank

**Hero headline:** *See space with sound.*
**Hero sub:** Echou turns the phone in your pocket into a sonar, so you can sense walls, doors and obstacles around you. No extra hardware.

**Problem section title:** *A cane only senses what it touches.*
**Problem body:** Millions of people navigate rooms they cannot see. Tools that sense farther away exist, but they need extra hardware that many people cannot afford.

**How it works title:** *Sound out. Echo back. Space mapped.*
**Step captions:**
1. *Chirp:* your phone sends a sound too high for you to hear.
2. *Echo:* it bounces off the walls and comes back.
3. *Delay:* Echou times every echo.
4. *Map:* time becomes distance, and distance becomes a picture of the room.

**Benefit tiles:** *No extra hardware · Works in the dark · Hands-free · Open spatial API*

**Honest-limits blurb:** Echou is an extra sense, not a replacement for your cane or guide dog. Soft surfaces and steep angles can fade echoes, and we say so when the app is unsure.

**Developer blurb:** One spatial API. AR, indoor navigation, robotics and smart homes, powered by the phone you already own.

**Footer line:** *Echou. See space with sound.*

---

## 18. Glossary

| Term | Meaning |
|---|---|
| **Sonar** | Using sound to detect and locate objects by timing echoes |
| **Radar** | The same idea with radio waves (not what Echou uses) |
| **Ultrasound / near-ultrasound** | Sound above (or near) the limit of human hearing; Echou uses ~18–22 kHz |
| **Chirp** | A tone whose frequency sweeps up or down over a short time |
| **Bandwidth (B)** | The span of frequencies in the chirp (for example 18 to 22 kHz is 4 kHz) |
| **Matched filter** | Correlating the received signal with the known chirp to find echoes |
| **Cross-correlation** | A measure of similarity at different time shifts; peaks where the echo aligns |
| **Pulse compression** | Using a long, wide-band chirp to get both sensitivity and sharp timing |
| **Range resolution** | The smallest distance difference at which two echoes can be told apart |
| **TDOA** | Time difference of arrival of the same sound at two microphones |
| **IMU** | Inertial measurement unit: gyroscope, accelerometer, magnetometer in the phone |
| **Occupancy grid** | A 2D map of cells, each storing the probability that something is there |
| **CFAR** | Constant false-alarm rate detection: an adaptive threshold for picking echoes from noise |
| **TGC** | Time-gain compensation: amplifying late (distant) echoes to balance loss |
| **Multipath** | Echoes that bounce more than once, creating ghost objects |
| **AGC** | Automatic gain control: phone audio processing that can distort the echo |
| **HRTF / spatial audio** | Techniques that make a sound seem to come from a position in 3D |
| **Haptics** | Touch feedback, such as vibration patterns |

---

## 19. FAQ

**Is this radar?**
No. Radar uses radio waves. Echou uses sound waves (sonar) from the phone's own speaker and microphones.

**Can I hear it?**
For most adults, no, because it is above the usual hearing range. A few people, especially younger ones, may faintly hear the lowest frequencies, so the app lets you shift the band and lower the volume.

**Does it work in the dark?**
Yes. It uses sound, not light.

**Does it record me?**
No. The microphone is used only to hear Echou's own chirps. Nothing is stored or uploaded.

**Does it replace my cane or guide dog?**
No. It is an additional aid.

**How far can it sense?**
The target is roughly 3 to 5 metres for large, hard surfaces. Soft or angled surfaces reduce range. Final figures will come from testing.

**How accurate is it?**
Theory suggests centimetre-level distance accuracy in good conditions. Direction is coarser. We will publish measured results after prototype testing.

**Will it work on any phone?**
Most modern phones can produce and record near-ultrasound, but quality varies by model. We plan a compatibility list and automatic calibration.

**Will it bother pets?**
Dogs and cats hear higher frequencies than humans. We keep output low and short, and will test carefully.

**Why not use the camera or LiDAR?**
Cameras need light and framing; LiDAR needs a specific phone model. Sound works anywhere, on ordinary phones.

**Who can use the API?**
Any app developer who wants spatial awareness without special sensors. Documentation will be published with the platform phase.

---

## 20. Open questions

Decide these as a team before or during the build:

1. **Platform order:** Android first (recommended for raw audio control), or both from the start?
2. **Direction strategy:** how far to push TDOA versus motion scanning in Phase 2?
3. **Frequency band:** fixed 18–22 kHz or auto-selected per phone after a calibration sweep?
4. **User testing partners:** which NGOs, rehabilitation centres or schools for the blind can we approach, and what consent and ethics process applies?
5. **Name and branding:** confirm "Echou" (check trademark and domain availability, and how it is pronounced in speech output).
6. **Languages:** which Indian languages for speech output in the first release?
7. **Licensing and monetisation:** free app plus paid developer tier, or something else?
8. **Hackathon fit:** if this is for a competition (for example Smart India Hackathon), map the problem statement, evaluation criteria and demo format onto the roadmap.
9. **Evidence to collect:** which measurements and user quotes will we show on the website once we have them?

---

*Document status: planning reference. All performance numbers are theoretical until validated by prototype tests. Items marked **[verify]** and any citations should be checked against primary sources before public use.*
