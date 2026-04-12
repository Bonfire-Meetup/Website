#!/usr/bin/env python3
"""Emit cwebp -resize width height, or an empty line if the image is already within the cap."""
from __future__ import annotations

import struct
import sys


def dimensions(path: str) -> tuple[int, int]:
  with open(path, "rb") as f:
    head = f.read(24)
  if len(head) >= 24 and head[:8] == b"\x89PNG\r\n\x1a\n":
    w, h = struct.unpack(">II", head[16:24])
    return w, h

  with open(path, "rb") as f:
    if f.read(2) != b"\xff\xd8":
      raise ValueError(f"unsupported image (need JPEG or PNG): {path}")
    while True:
      b = f.read(1)
      while b and b != b"\xff":
        b = f.read(1)
      if not b:
        raise ValueError(f"no JPEG SOF in {path}")
      marker = f.read(1)
      if not marker:
        raise ValueError(f"no JPEG SOF in {path}")
      m = marker[0]
      if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7 or m == 0xD9:
        continue
      seg = f.read(2)
      if len(seg) < 2:
        raise ValueError(f"truncated JPEG in {path}")
      seg_len = struct.unpack(">H", seg)[0]
      if m in (0xC0, 0xC1, 0xC2, 0xC3):
        data = f.read(seg_len - 2)
        if len(data) < 5:
          raise ValueError(f"bad JPEG SOF in {path}")
        h, w = struct.unpack(">HH", data[1:5])
        return w, h
      skip = f.read(seg_len - 2)
      if len(skip) < seg_len - 2:
        raise ValueError(f"truncated JPEG in {path}")


def main() -> None:
  if len(sys.argv) != 3:
    sys.stderr.write("usage: album-photo-max-edge.py PATH MAX_LONG_EDGE\n")
    sys.exit(2)
  path = sys.argv[1]
  edge = int(sys.argv[2])
  if edge < 1:
    sys.exit(2)
  w, h = dimensions(path)
  longest = max(w, h)
  if longest <= edge:
    print()
  elif w >= h:
    print(f"{edge} 0")
  else:
    print(f"0 {edge}")


if __name__ == "__main__":
  try:
    main()
  except ValueError as e:
    sys.stderr.write(f"{e}\n")
    sys.exit(1)
