import type { Variants } from "framer-motion"

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.055 } },
}

export const itemVariants: Variants = {
  hidden: { y: 12, opacity: 0, filter: "blur(3px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)" },
}

export const clampPct = (value: number) => Math.min(Math.max(Math.round(value || 0), 0), 100)

export const profileImageSrc = "/images/jose-dashboard.png"
