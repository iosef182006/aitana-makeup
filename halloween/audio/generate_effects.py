"""Original procedural Halloween SFX, CC0-1.0. No third-party samples."""
import math
from pathlib import Path
import random
import struct
import wave

RATE = 16000
OUT = Path(__file__).parent
TAU = math.tau
SOUNDS = {'welcome': .84, 'search': .28, 'favorite': .48, 'consult': .34, 'navigate': .36}
for name, duration in SOUNDS.items():
    rng = random.Random(name)
    samples = []
    for i in range(round(RATE * duration)):
        t = i / RATE
        fade = min(1, t / .012, (duration - t) / .025)
        if name == 'welcome':
            # Three breathy, descending voiced "ha" pulses; no recorded voice.
            pulse = t % .28
            env = max(0, math.sin(math.pi * min(1, pulse / .22))) ** 1.6
            phase = TAU * (220 * t - 38 * t * t)
            x = .23 * env * (math.sin(phase) + .4 * math.sin(phase * 2) + .18 * math.sin(phase * 4))
            x += .018 * env * rng.uniform(-1, 1)
        elif name == 'search':
            x = .28 * math.exp(-t * 14) * (math.sin(TAU * 1318.5 * t) + .22 * math.sin(TAU * 2637 * t))
        elif name == 'favorite':
            x = 0
            for start, freq in [(0, 783.99), (.09, 1046.5), (.18, 1568)]:
                age = t - start
                if age >= 0:
                    x += .19 * (1 - math.exp(-age * 300)) * math.exp(-age * 15) * math.sin(TAU * freq * age)
        elif name == 'consult':
            x = 0
            for start, freq in [(0, 760), (.085, 1100), (.17, 610)]:
                age = t - start
                if age >= 0:
                    x += .27 * math.exp(-age * 65) * (math.sin(TAU * freq * age) + .25 * rng.uniform(-1, 1))
        else:
            env = math.sin(math.pi * ((t * 3 / duration) % 1)) ** 3
            x = env * (.11 * rng.uniform(-1, 1) + .06 * math.sin(TAU * 170 * t))
        samples.append(round(max(-.95, min(.95, x * fade)) * 32767))
    with wave.open(str(OUT / f'halloween-{name}.wav'), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(RATE)
        audio.writeframes(struct.pack('<' + 'h' * len(samples), *samples))
    print(name, duration, 'seconds', len(samples) * 2 + 44, 'bytes')
