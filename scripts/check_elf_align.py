#!/usr/bin/env python3
import os, sys, struct

def read_elf_align(path):
    with open(path, 'rb') as f:
        data = f.read(64)  # header portion
        if len(data) < 16 or data[0:4] != b'\x7fELF':
            return None
        ei_class = data[4]
        ei_data = data[5]
        endian = '<' if ei_data == 1 else '>'
        try:
            if ei_class == 1:
                # 32-bit
                hdr = f.read(64)
                # read e_phoff (4 bytes) at offset 28
                f.seek(28)
                e_phoff = struct.unpack(endian + 'I', f.read(4))[0]
                f.seek(42)
                e_phentsize = struct.unpack(endian + 'H', f.read(2))[0]
                e_phnum = struct.unpack(endian + 'H', f.read(2))[0]
                ph_align_offset = 28  # within program header
                is64 = False
            else:
                # 64-bit
                f.seek(32)
                e_phoff = struct.unpack(endian + 'Q', f.read(8))[0]
                f.seek(54)
                e_phentsize = struct.unpack(endian + 'H', f.read(2))[0]
                e_phnum = struct.unpack(endian + 'H', f.read(2))[0]
                ph_align_offset = 48
                is64 = True
        except Exception:
            return None
        aligns = []
        for i in range(e_phnum):
            ph_offset = e_phoff + i * e_phentsize
            f.seek(ph_offset + ph_align_offset)
            if is64:
                p_align = struct.unpack(endian + 'Q', f.read(8))[0]
            else:
                p_align = struct.unpack(endian + 'I', f.read(4))[0]
            aligns.append(p_align)
        return aligns


def walk_and_check(root):
    results = []
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith('.so'):
                path = os.path.join(dirpath, fn)
                aligns = read_elf_align(path)
                results.append((path, aligns))
    return results

if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    res = walk_and_check(root)
    for path, aligns in res:
        if aligns is None:
            print(f"{path}: not an ELF or parse failed")
            continue
        large = [a for a in aligns if a >= 0x4000]
        print(f"{path}: aligns={aligns}; large_aligns={large}")
