"""Regenerate all DressFair launcher icons from the source design.

Run with the local venv that has Pillow installed:
    /tmp/iconvenv/bin/python scripts/regenerate_icons.py

What this does:
  1. Reads `assets/icon.png` (the source design).
  2. Extracts the white "df" shopping-bag silhouette on a transparent canvas.
  3. Generates:
       - assets/icon.png         : full-bleed app icon (black BG, white logo)
       - assets/adaptive-icon.png: foreground only (logo on transparent canvas)
       - assets/splash.png       : centered logo on white background
       - All Android mipmap-* assets for every density:
           ic_launcher.png            (legacy full-bleed)
           ic_launcher_round.png      (legacy round full-bleed)
           ic_launcher_foreground.png (adaptive, logo only, transparent)
           ic_launcher_background.png (adaptive, solid black)
           ic_launcher_monochrome.png (Android 13+ themed icons)
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parent.parent
SOURCE = REPO / "assets" / "icon.png"

# Android mipmap density buckets (px of an adaptive icon = 108dp at each density).
DENSITIES = {
    "mdpi":    108,   # 1x
    "hdpi":    162,   # 1.5x
    "xhdpi":   216,   # 2x
    "xxhdpi":  324,   # 3x
    "xxxhdpi": 432,   # 4x
}

# Legacy launcher icon size (48dp) at each density.
LEGACY_SIZES = {
    "mdpi":    48,
    "hdpi":    72,
    "xhdpi":   96,
    "xxhdpi":  144,
    "xxxhdpi": 192,
}

# Adaptive icon "safe zone" diameter is 66dp inside a 108dp canvas (~61%).
# We render the logo a touch larger so it reads well after the launcher mask.
LOGO_SAFE_RATIO = 0.66

BACKGROUND_RGB = (0, 0, 0)  # solid black brand background


def _extract_logo(source_img: Image.Image) -> Image.Image:
    """Return a square RGBA image containing only the white bag logo on a
    transparent background, tightly cropped around the logo."""
    rgba = source_img.convert("RGBA")
    arr = np.array(rgba)

    # Build a luminance map and mask the dark "container" circle. Inside the
    # circle the white bag silhouette is the cut-out we want to keep.
    luma = arr[..., :3].mean(axis=-1)
    dark_mask = luma < 100  # dark circle pixels

    if not dark_mask.any():
        raise RuntimeError("Source icon has no dark pixels to anchor on")

    ys, xs = np.where(dark_mask)
    y0, y1 = ys.min(), ys.max()
    x0, x1 = xs.min(), xs.max()

    # Tight square crop around the dark container circle.
    side = max(y1 - y0, x1 - x0) + 1
    cy = (y0 + y1) // 2
    cx = (x0 + x1) // 2
    half = side // 2 + 4  # tiny padding
    y0c, y1c = max(0, cy - half), min(arr.shape[0], cy + half)
    x0c, x1c = max(0, cx - half), min(arr.shape[1], cx + half)
    cropped = arr[y0c:y1c, x0c:x1c].copy()

    # Inside the cropped region the bag logo is bright pixels INSIDE the dark
    # circle. We rebuild the alpha so that only the bag stays opaque white.
    luma_c = cropped[..., :3].mean(axis=-1)
    bag_mask = luma_c > 200  # white-ish pixels = bag silhouette

    # The cropped square also includes a few white corner pixels OUTSIDE the
    # dark circle. Knock those out by floodfill from each corner.
    h, w = bag_mask.shape
    visited = np.zeros_like(bag_mask)
    stack = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]
    while stack:
        y, x = stack.pop()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if visited[y, x]:
            continue
        if not bag_mask[y, x]:
            continue
        visited[y, x] = True
        bag_mask[y, x] = False  # corner-connected white = background, drop it
        stack.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[bag_mask] = (255, 255, 255, 255)
    logo = Image.fromarray(out, mode="RGBA")

    # Pad to a perfect square so future scaling stays centered.
    if logo.width != logo.height:
        side = max(logo.width, logo.height)
        square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        square.paste(
            logo,
            ((side - logo.width) // 2, (side - logo.height) // 2),
            logo,
        )
        logo = square
    return logo


def _foreground(canvas_px: int, logo: Image.Image) -> Image.Image:
    """Adaptive icon foreground: white logo on transparent canvas, logo
    sized to the safe zone."""
    canvas = Image.new("RGBA", (canvas_px, canvas_px), (0, 0, 0, 0))
    target = int(canvas_px * LOGO_SAFE_RATIO)
    sized = logo.resize((target, target), Image.LANCZOS)
    offset = (canvas_px - target) // 2
    canvas.paste(sized, (offset, offset), sized)
    return canvas


def _background(canvas_px: int) -> Image.Image:
    """Adaptive icon background: solid brand color."""
    return Image.new("RGBA", (canvas_px, canvas_px), BACKGROUND_RGB + (255,))


def _monochrome(canvas_px: int, logo: Image.Image) -> Image.Image:
    """Android 13+ themed icon: white silhouette on transparent canvas."""
    return _foreground(canvas_px, logo)


def _legacy_square(canvas_px: int, logo: Image.Image) -> Image.Image:
    """Full-bleed legacy launcher icon: black background with logo at ~70%."""
    canvas = Image.new("RGBA", (canvas_px, canvas_px), BACKGROUND_RGB + (255,))
    target = int(canvas_px * 0.70)
    sized = logo.resize((target, target), Image.LANCZOS)
    offset = (canvas_px - target) // 2
    canvas.paste(sized, (offset, offset), sized)
    return canvas


def _legacy_round(canvas_px: int, logo: Image.Image) -> Image.Image:
    """Round legacy launcher icon: black filled circle with logo at ~70%."""
    canvas = Image.new("RGBA", (canvas_px, canvas_px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((0, 0, canvas_px - 1, canvas_px - 1),
                 fill=BACKGROUND_RGB + (255,))
    target = int(canvas_px * 0.62)  # a touch smaller so logo stays inside circle
    sized = logo.resize((target, target), Image.LANCZOS)
    offset = (canvas_px - target) // 2
    canvas.paste(sized, (offset, offset), sized)
    return canvas


def _save(img: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="PNG", optimize=True)
    print(f"  wrote {dest.relative_to(REPO)} ({img.width}x{img.height})")


def main() -> None:
    print(f"Reading source: {SOURCE.relative_to(REPO)}")
    src = Image.open(SOURCE)
    logo = _extract_logo(src)
    print(f"  extracted logo: {logo.width}x{logo.height} (transparent BG)")

    res_root = REPO / "android" / "app" / "src" / "main" / "res"

    print("Generating Android mipmap assets...")
    for density, adaptive_px in DENSITIES.items():
        legacy_px = LEGACY_SIZES[density]
        mipmap_dir = res_root / f"mipmap-{density}"

        _save(_foreground(adaptive_px, logo),
              mipmap_dir / "ic_launcher_foreground.png")
        _save(_background(adaptive_px),
              mipmap_dir / "ic_launcher_background.png")
        _save(_monochrome(adaptive_px, logo),
              mipmap_dir / "ic_launcher_monochrome.png")
        _save(_legacy_square(legacy_px, logo),
              mipmap_dir / "ic_launcher.png")
        _save(_legacy_round(legacy_px, logo),
              mipmap_dir / "ic_launcher_round.png")

    print("Updating source assets (icon.png, adaptive-icon.png, splash.png)...")
    # Full-bleed 1024 icon used by iOS and Expo's prebuild step.
    _save(_legacy_square(1024, logo), REPO / "assets" / "icon.png")
    # Adaptive foreground source: just the logo on transparent BG.
    _save(_foreground(1024, logo), REPO / "assets" / "adaptive-icon.png")
    # Splash: centered logo on white BG (small, leaves room for system UI).
    splash = Image.new("RGBA", (1284, 2778), (255, 255, 255, 255))
    s_target = 512
    s_sized = logo.resize((s_target, s_target), Image.LANCZOS)
    # Tint splash logo black so it's visible on the white splash background.
    s_arr = np.array(s_sized)
    s_arr[..., :3] = 0  # any visible pixel becomes black
    s_sized = Image.fromarray(s_arr, mode="RGBA")
    splash.paste(
        s_sized,
        ((1284 - s_target) // 2, (2778 - s_target) // 2),
        s_sized,
    )
    _save(splash, REPO / "assets" / "splash.png")

    print("Done. Rebuild the Android app to see the new icon.")


if __name__ == "__main__":
    main()
