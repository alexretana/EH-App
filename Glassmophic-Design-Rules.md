Glassmorphism Aesthetic Rules

Color Format: Always use oklab(), not rgb/rgba.

Backgrounds: Use translucent panels with bg-white/10 to bg-white/20 or bg-slate-100/10 for dark mode.

Backdrop Blur: Apply backdrop-blur-md to backdrop-blur-2xl depending on hierarchy.

Borders: Add subtle, semi-transparent borders (border border-white/20 or border-white/10 in dark mode).

Shadows: Use soft, diffused shadows (shadow-[0_8px_32px_0_oklch(0.3382 0.1582 271.28 / 0.37)]). Avoid harsh or dark shadows.

Lighting Accents: Create contrast through inner glows or gradients, not opaque blocks. Gradients should be subtle (e.g. bg-gradient-to-br from-white/10 to-white/5).

Text Color: Keep text legible — use text-white/90 or text-slate-100 for light-on-dark, and text-slate-800/90 for dark-on-light.

# Layout and Spacing

Use a 12-column grid or flexbox with consistent gap spacing (gap-4 or gap-6).

Maintain generous padding: panels should use p-6 to p-10, sections py-20 px-6.

Ensure adequate breathing room — no element should feel “flush” against edges unless stylistically deliberate.

Align content with a max-width container (max-w-6xl mx-auto).

Keep the UI center-aligned and balanced, favoring symmetry.

 Component Styling via shadcn/ui

Wrap shadcn components (e.g. Card, Button, Dialog, Input) with the above glassmorphic layers.

Buttons: Transparent with glassy hover states (hover:bg-white/20 transition). Use rounded-xl or rounded-2xl corners.

Cards & Modals: Use backdrop-blur-xl, light border, rounded-3xl, and internal padding (p-8).

Inputs & Textareas: Semi-transparent with frosted backgrounds (bg-white/10), focus:ring-white/30.

Navbars & Footers: Fixed or sticky with translucent backgrounds (bg-slate-900/30 + backdrop-blur-lg).

# Motion & Interactivity

Use Framer Motion for smooth fades, slides, and glass shimmer transitions.

Animations should be subtle — favor soft easing and slight parallax effects.

On hover, glass panels should brighten slightly (brightness-110) and lift with a soft shadow.

# Global Style Context

Maintain a consistent z-depth system: foreground cards > navbars > background layers.

Default border radius: rounded-2xl.

Global background: gradient + soft blur overlay (e.g. bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900).

Support dark mode natively — invert transparencies and adjust blur to maintain depth perception.

# Deliverables

Implement these principles in a reusable layout component and UI theme layer.

Ensure the final result looks cohesive, minimal, and “frosted” — like light shining through ice.

Do not add a chat UI or dynamic content generation — focus purely on layout, spacing, and visual polish.