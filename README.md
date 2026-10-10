# Lumio 📡
> **See space with sound.**  
> An active spatial sonar powered 100% by commodity iPhone hardware. Zero extra sensors or accessories required.

---

## 🌟 Overview

**Lumio** (formerly *Echou*) transforms the built-in stereo speakers and triple-microphone array already inside your iPhone into an active spatial sonar. By broadcasting inaudible near-ultrasonic chirps (18,000–22,000 Hz) and timing return echoes, blind and low-vision users can sense walls, doorways, and obstacles around them in real time — with **zero extra hardware to buy, carry, or charge**.

---

## 🚀 Key Features

- **$0 Extra Hardware**: Runs entirely on the iPhone you already own. No smart canes, dongles, or wearable sensors needed.
- **Inaudible Near-Ultrasound**: Emits 18–22 kHz linear frequency sweeps ($B = 4\text{ kHz}$) that are inaudible to adult ears and safe for pets.
- **Sub-Centimeter Range Resolution**: Achieves ~4.3 cm theoretical range resolution through matched filter pulse compression.
- **3-Microphone Spatial TDOA**: Measures microsecond Time Difference of Arrival across the iPhone's Bottom Mic, Earpiece Mic, and Rear Camera Mic to determine **Left**, **Center**, and **Right** directional sectors.
- **100% On-Device Processing**: Powered by Apple Silicon and the Accelerate framework (`vDSP` FFT cross-correlations) with $<18\text{ms}$ latency.
- **Non-Visual Accessibility**: Communicates proximity and direction through **Apple Taptic Engine** vibration rhythms, **3D Spatial Audio**, and spoken VoiceOver summaries.
- **Sensor Fusion (Acoustic Sonar + iPhone Pro LiDAR)**: Intelligently cross-validates near-ultrasonic sound waves with the built-in LiDAR scanner on iPhone Pro models. Eliminates single-sensor failure modes (such as transparent glass windows where lasers pass through, or heavy velvet curtains where ultrasound absorbs) with zero external add-ons.
- **Works in Complete Darkness**: Sound waves operate independently of optical lighting or camera framing.

---

## 🏗️ Acoustic Processing Pipeline

```
 [Chirp Generator] ──> [iPhone Bottom & Earpiece Speakers]
                              │ (18–22 kHz near-ultrasound)
                              ▼
                         [Obstacles / Walls]
                              │ (Acoustic reflections)
                              ▼
                [3-Microphone iPhone Array]
                              │
                              ▼
 1. Raw Audio Capture (AVAudioSession in .measurement mode, zero AGC / echo suppression)
 2. Band-Pass Filter (17.5 – 22.5 kHz)
 3. Direct-Path Speaker-to-Mic Leakage Gating
 4. vDSP Matched Filtering (FFT Cross-Correlation with Chirp Template)
 5. Time-Gain Compensation (TGC for distant echoes)
 6. CFAR Peak Detection (Constant False Alarm Rate)
 7. 3-Microphone TDOA Triangulation: Δt = (d_mics · sin θ) / c
 8. CoreHaptics & 3D Spatial Audio Delivery
```

---

## 💻 Tech Stack

- **iOS Native Core**: Swift, `AVAudioEngine`, `AVAudioSession`, Accelerate framework (`vDSP`), `CoreHaptics`, `CoreMotion`.
- **Interactive Showcase & Simulator**:
  - **Three.js**: Real-time 3D WebGL industrial iPhone model with volumetric sonic wave emissions and X-Ray architecture view.
  - **Web Audio API**: Real-time acoustic frequency synthesizer.
  - **HTML5 Canvas**: 2D physics-based spatial radar and obstacle collision simulator.
  - **Apple Pro CSS**: Cupertino dark aesthetic, typography, and responsive bento grid.

---

## 👥 Authors & Team

- **Parth Jaina**
- **Vardaan Sharma**
- **Manoj B S**
- **Tharun B**

---

## 📄 License & Disclaimer

Lumio is an auxiliary mobility tool designed to enhance spatial awareness. It does not replace a white cane, guide dog, or orientation-and-mobility training.
