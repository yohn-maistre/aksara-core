// Pocket TTS streams a PCM WAV with placeholder lengths. Once the bounded
// response is complete, finalize lengths before handing it to a browser player.
export function finalizePcmWav(input) {
  const b = Buffer.from(input);
  if (
    b.length < 44 ||
    b.length > 8 * 1048576 ||
    b.toString("ascii", 0, 4) !== "RIFF" ||
    b.toString("ascii", 8, 16) !== "WAVEfmt " ||
    b.readUInt32LE(16) !== 16 ||
    b.readUInt16LE(20) !== 1 ||
    b.toString("ascii", 36, 40) !== "data"
  )
    throw new Error("Invalid PCM WAV");
  const channels = b.readUInt16LE(22),
    rate = b.readUInt32LE(24),
    align = b.readUInt16LE(32),
    bits = b.readUInt16LE(34);
  if (
    ![1, 2].includes(channels) ||
    rate < 8000 ||
    rate > 48000 ||
    bits !== 16 ||
    align !== channels * 2 ||
    (b.length - 44) % align
  )
    throw new Error("Unsupported PCM audio");
  b.writeUInt32LE(b.length - 8, 4);
  b.writeUInt32LE(b.length - 44, 40);
  return b;
}
