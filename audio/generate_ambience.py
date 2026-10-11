"""Original procedural ambient loop. Python standard library only; CC0-1.0."""
import math
from pathlib import Path
import random
import struct
import wave

RATE = 16000
SECONDS = 16
rng = random.Random(3110)
# Integer periods ensure wind meets continuously at the loop boundary.
wind = [(rng.randint(500, 2200) / SECONDS, rng.random() * math.tau) for _ in range(18)]
bells = [(1.5, 523.25), (5.5, 783.99), (10.0, 659.25), (13.0, 1046.5)]
samples = bytearray()
for i in range(RATE * SECONDS):
    t = i / RATE
    breath = 0.7 + 0.3 * math.sin(math.tau * t / SECONDS)
    value = sum(math.sin(math.tau * f * t + phase) for f, phase in wind) * 0.006 * breath
    value += 0.015 * math.sin(math.tau * 96 * t)
    for start, frequency in bells:
        age = (t - start) % SECONDS
        envelope = (1 - math.exp(-age * 35)) * math.exp(-age * 2.1)
        value += 0.065 * envelope * (math.sin(math.tau * frequency * age) + 0.25 * math.sin(math.tau * frequency * 2 * age))
    samples.extend(struct.pack('<h', round(max(-1, min(1, value)) * 32767)))
with wave.open(str(Path(__file__).with_name('haunted-beauty.wav')), 'wb') as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(RATE)
    output.writeframes(samples)
print(f'Generated original ambience: {len(samples):,} bytes PCM, {SECONDS}s')
