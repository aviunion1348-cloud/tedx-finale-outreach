// Dependency-free store-mode ZIP writer (for bulk letter export). Uses raw
// DEFLATE for the header via CompressionStream when available, else stored only.
// This is a lightweight ZIP: no directories, fixed metadata — enough to open in
// any unarchiver. Store-mode avoids the compression cost entirely.

export async function makeZip(files: { name: string; data: Uint8Array }[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: { name: string; localOffset: number; crc: number; size: number }[] = [];

  const crcTable = buildCrcTable();

  for (const f of files) {
    const nameBytes = encoder.encode(f.name);
    const localOffset = totalSize(chunks);
    const crc = crc32(f.data, crcTable);
    const method = 0; // store
    // local file header
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true); // version needed
    lh.setUint16(6, 0, true); // flags
    lh.setUint16(8, method, true);
    lh.setUint16(10, 0, true); // mod time
    lh.setUint16(12, 0, true); // mod date
    lh.setUint32(14, crc, true);
    lh.setUint32(18, f.data.length, true); // comp size
    lh.setUint32(22, f.data.length, true); // uncomp size
    lh.setUint16(26, nameBytes.length, true);
    lh.setUint16(28, 0, true); // extra len
    chunks.push(new Uint8Array(lh.buffer), nameBytes, f.data);
    central.push({ name: f.name, localOffset, crc, size: f.data.length });
  }

  const centralOffset = totalSize(chunks);
  const cdChunks: Uint8Array[] = [];
  for (const c of central) {
    const nb = encoder.encode(c.name);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true); // version made by
    cd.setUint16(6, 20, true); // version needed
    cd.setUint16(8, 0, true); // flags
    cd.setUint16(10, 0, true); // method
    cd.setUint16(12, 0, true);
    cd.setUint16(14, 0, true);
    cd.setUint32(16, c.crc, true);
    cd.setUint32(20, c.size, true);
    cd.setUint32(24, c.size, true);
    cd.setUint16(28, nb.length, true);
    cd.setUint16(30, 0, true);
    cd.setUint16(32, 0, true);
    cd.setUint16(34, 0, true);
    cd.setUint16(36, 0, true);
    cd.setUint32(38, c.localOffset, true);
    cd.setUint16(42, 0, true);
    cdChunks.push(new Uint8Array(cd.buffer), nb);
  }
  const centralSize = totalSize(cdChunks);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, central.length, true);
  eocd.setUint16(10, central.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, centralOffset, true);
  eocd.setUint16(20, 0, true);

  const parts = [...chunks, ...cdChunks].map((c) => c as unknown as BlobPart);
  parts.push(new Uint8Array(eocd.buffer) as unknown as BlobPart);
  const all = new Blob(parts);
  return all;
}

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(data: Uint8Array, table: Uint32Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function totalSize(chunks: Uint8Array[]): number {
  return chunks.reduce((n, c) => n + c.length, 0);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
