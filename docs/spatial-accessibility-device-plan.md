# RoomSense: A Spatial Awareness Device
## Project plan for blind and low-vision users, makers, and technology enthusiasts

**Working name:** RoomSense  
**Project type:** Assistive technology prototype  
**Status:** Concept and development plan  
**Primary goal:** Help a user notice nearby obstacles and understand the layout around them through clear, private audio or haptic cues.

---

## 1. The idea

RoomSense is a wearable or handheld device that senses nearby surfaces and obstacles, then communicates useful spatial information to its user.

The first version should answer practical questions such as:

- Is there an obstacle ahead?
- How far away is it?
- Is it to the left, center, or right?
- Is there enough time and space to avoid it?

A later version could build a rough room map, recognize doorways, or describe a route. These are more ambitious features and should come only after the basic obstacle warnings work reliably.

**Important:** RoomSense is intended as an additional mobility aid. It does not replace a cane, guide dog, orientation-and-mobility training, or established travel practices.

---

## 2. Who it serves

### Primary users

- Blind and low-vision people who want additional information about obstacles or unfamiliar spaces.
- People with different mobility styles, hearing abilities, and comfort with wearable technology.

### Secondary users

- Technology enthusiasts, students, educators, and makers who want to learn about sensing, embedded systems, and accessible design.
- Community organizations and accessibility programs interested in evaluating or supporting assistive technology.

### Social-welfare purpose

The project should be developed with users, not just for them. Its value should be judged by whether it improves confidence, choice, comfort, or access in real settings—not by how advanced the technology sounds.

Aim to keep the design affordable, repairable, privacy-conscious, and usable without a constant internet connection.

---

## 3. How the sensing could work

### Sound-based distance sensing

A speaker or ultrasonic transducer emits a short sound pulse. A microphone receives the echo. The device estimates distance from the time between emission and return:

**distance ≈ speed of sound × echo time ÷ 2**

The division by two accounts for the sound traveling to the object and back.

Sound-based sensing can be useful for detecting nearby obstacles, especially in darkness. However, reflections can be confusing in furnished rooms; soft materials can absorb sound; other sounds can interfere; and a phone’s ordinary speaker and microphone may not give dependable ranging results. A sound-only device may also miss objects that do not reflect the signal well.

### LiDAR

LiDAR sends out pulses of light and measures their return time. It can collect many precise distance measurements quickly and may support a denser room map. It needs suitable line of sight, and glass, shiny surfaces, or some dark materials can produce unreliable readings. LiDAR hardware may also increase cost and power use.

### Other options

- **Time-of-flight infrared sensors:** Compact distance measurements, often suitable for short ranges.
- **Depth cameras:** Can provide richer shape information, but may use more power and be affected by lighting or sunlight.
- **Stereo cameras:** Estimate depth from two images; they need visual processing and may be less dependable in poor lighting.
- **Inertial sensors:** Accelerometers and gyroscopes help estimate movement but do not measure room geometry by themselves.

### Recommended approach

Build the first prototype around a small number of forward-facing distance sensors. Test sound-based ranging against a time-of-flight sensor or LiDAR module in the same conditions. Choose the sensor based on measured reliability, cost, size, comfort, and user feedback—not assumption.

A phone can be a useful interface or processing platform, but its built-in audio hardware should not be treated as a reliable room-mapping sensor until it has been tested.

---

## 4. Scope

### Minimum viable prototype

The first prototype should:

- Detect obstacles within a limited, clearly stated range.
- Indicate whether an obstacle is left, center, or right.
- Give a simple proximity warning using vibration, audio, or both.
- Update quickly enough to be useful while walking.
- Include a physical mute or pause control.
- Work without sending sensor data to a server.
- Be tested in controlled environments before any real-world mobility evaluation.

### Later possibilities

Only consider these after the basic prototype is validated:

- Detecting doorways, walls, or overhead obstacles.
- A rough local map of a room.
- Spoken descriptions or turn-by-turn guidance.
- Phone integration or configurable feedback.
- Different modes for indoor spaces, queues, or seated use.

### Out of scope for an early prototype

- Claiming that the device replaces a cane or guide dog.
- Autonomous route guidance in public spaces.
- Identifying people or recording conversations.
- Promising detection of every obstacle, drop-off, or hazard.
- Using the prototype as a safety-certified medical or mobility product.

---

## 5. Step-by-step development plan

### Phase 1 — Learn from users and define the problem

1. Speak with blind and low-vision people, orientation-and-mobility specialists, and accessibility groups.
2. Ask what situations are difficult and what information would actually help.
3. Learn how users currently travel and what cues they already rely on.
4. Agree on a narrow first use case, such as detecting objects at upper-body height indoors.
5. Define success in user terms—for example, understandable warnings that do not distract from cane use or environmental listening.
6. Offer accessible ways to participate, and compensate advisors when possible.

**Deliverable:** A short problem statement and a prioritized list of user needs.

### Phase 2 — Research and choose a sensing method

1. Compare ultrasonic, time-of-flight, and LiDAR modules.
2. Check each sensor’s practical range, field of view, update rate, power use, size, and cost.
3. Test common surfaces: fabric, wood, painted walls, glass, metal, and angled objects.
4. Check performance in quiet and noisy rooms, with moving people, and at different distances.
5. Decide whether the project needs point obstacle detection or a real 3D map. Start with detection unless mapping is essential to the use case.

**Deliverable:** A sensor choice backed by a simple comparison table and test results.

### Phase 3 — Build a bench prototype

1. Connect one sensor to a microcontroller or development board.
2. Record raw readings and compare them with measured distances.
3. Add filtering to reduce unstable readings.
4. Add left, center, and right sensing if the first sensor works reliably.
5. Trigger simple vibration patterns or short tones based on distance.
6. Add a physical pause control and a low-battery warning.
7. Keep data processing local.

**Deliverable:** A stationary prototype that detects test obstacles and gives consistent feedback.

### Phase 4 — Test sensing performance

Test at measured distances and document:

- Distance error and missed detections.
- False warnings.
- Time taken to update.
- Performance on different materials and angles.
- Effects of noise, movement, and multiple nearby surfaces.
- Battery life and heat.

Repeat tests rather than relying on a single successful demonstration. State the conditions where the sensor performs poorly.

**Deliverable:** A test log and a clear description of limitations.

### Phase 5 — Design accessible feedback

1. Ask users whether vibration, audio, or a combination is preferable.
2. Keep warnings short and distinguishable from environmental sounds.
3. Avoid constant narration or alert patterns that overload attention.
4. Make intensity and alert behavior adjustable.
5. Let users pause the device quickly.
6. Test with people who have different hearing and sensory preferences.

**Deliverable:** A feedback design selected with user input.

### Phase 6 — Make a wearable or handheld prototype

1. Mount the sensors so they point in the intended direction.
2. Ensure the device does not block a cane grip, hearing, or comfortable movement.
3. Make the enclosure lightweight and secure.
4. Protect wiring and electronics from ordinary bumps and light moisture as appropriate.
5. Make the controls tactile and easy to locate.
6. Check that the device’s position remains consistent during use.

**Deliverable:** A wearable or handheld prototype suitable for supervised evaluation.

### Phase 7 — Conduct supervised user evaluations

1. Begin with stationary tests and familiar, controlled indoor spaces.
2. Use an orientation-and-mobility professional or another qualified safety lead for walking evaluations.
3. Keep the participant’s usual mobility aid available and in use.
4. Do not test near traffic, stairs, platform edges, or other serious hazards.
5. Ask participants to stop whenever they feel uncomfortable.
6. Collect feedback on usefulness, comfort, confusion, trust, and alert fatigue.
7. Fix problems before expanding the test setting.

**Deliverable:** A user-feedback summary and a prioritized revision list.

### Phase 8 — Improve and broaden the evaluation

1. Address the most serious missed detections and confusing alerts.
2. Retest after each significant hardware or software change.
3. Evaluate with a wider range of users and room layouts.
4. Include different mobility techniques and accessibility needs.
5. Compare the prototype against the agreed user goals, not just sensor accuracy.
6. Document remaining limitations and recommended use conditions.

**Deliverable:** A revised prototype and an evidence-based evaluation report.

### Phase 9 — Plan for responsible release

Before sharing or distributing a device:

1. Review relevant product, electrical, radio, battery, accessibility, and consumer-safety requirements in the intended country.
2. Get qualified engineering and legal advice for any product intended for public use.
3. Provide plain-language instructions, limitations, and maintenance guidance.
4. Make repair and replacement parts practical where possible.
5. Be transparent about what the device detects and what it can miss.
6. Do not advertise it as a replacement for established mobility aids unless strong evidence and appropriate approvals support that claim.

**Deliverable:** A release-readiness checklist and user documentation.

---

## 6. Suggested prototype components

Exact parts should be chosen after checking availability, cost, and performance.

- Microcontroller or small development board.
- One or more distance sensors: ultrasonic, time-of-flight, or LiDAR.
- Vibration motor, small speaker, or bone-conduction output option.
- Tactile button for pause or mode control.
- Rechargeable battery with safe charging and protection.
- Enclosure, mounting hardware, and accessible controls.
- Optional phone connection for settings or logs, while keeping core sensing functional offline.

Avoid collecting audio recordings. For sound-based ranging, process the pulse and echo locally and discard them.

---

## 7. Evaluation measures

Measure both technical performance and user experience.

### Technical measures

- Detection rate for selected obstacle types and distances.
- False-alert rate.
- Distance error.
- Delay between detecting an obstacle and providing feedback.
- Battery life.
- Performance in quiet and noisy conditions.

### User measures

- Can users understand the alerts without training?
- Do alerts help users make a decision?
- Does the device distract from hearing traffic, people, or other environmental sounds?
- Is it comfortable and easy to control?
- Does it work with users’ established mobility tools and techniques?
- Do users want to use it again?

Success should require acceptable performance on both sets of measures.

---

## 8. Risks and ways to reduce them

| Risk | Practical response |
|---|---|
| Sensor misses an obstacle | State limitations; test varied materials and angles; retain established mobility aids. |
| Too many alerts | Use simple, adjustable feedback and evaluate alert fatigue. |
| Sound feedback masks the environment | Offer vibration and quieter options; test with users. |
| Room reflections confuse ranging | Compare sensors and avoid claiming full-room mapping without evidence. |
| Device creates false confidence | Use careful instructions and supervised evaluation; never present it as a replacement aid. |
| Personal data is captured | Process locally, avoid recording, and make data collection opt-in. |
| Device is too expensive or fragile | Use replaceable modules, common parts, and repairable construction where feasible. |

---

## 9. Team and community involvement

A useful project team may include:

- Blind and low-vision user advisors.
- An orientation-and-mobility specialist.
- Embedded systems or electronics developers.
- Accessibility and interaction designers.
- A safety or product-engineering advisor.
- Educators, makerspaces, or community organizations.

User advisors should have real influence over priorities and design decisions. Share results back with participants in accessible formats.

---

## 10. First-month action list

### Week 1

- Write a one-paragraph problem statement.
- Find local blind and low-vision organizations or advisors.
- Ask for feedback on the proposed use case before choosing hardware.

### Week 2

- Compare three candidate sensors.
- Create a small test plan covering distances, surfaces, angles, and noise.
- Set a modest prototype budget.

### Week 3

- Buy or borrow the first sensor and development board.
- Measure it on a stationary bench.
- Record misses, false alerts, and range limits.

### Week 4

- Add one feedback method and a pause control.
- Demonstrate the prototype in a controlled setting.
- Review findings with user advisors.
- Decide whether to continue with sound ranging, switch sensors, or combine approaches.

---

## 11. Project principle

Build the smallest device that answers a real user need, test it with the people it is meant to serve, and communicate its limits clearly. A successful project is not just a working sensor; it is a tool that users find useful, understandable, comfortable, and worthy of trust.
