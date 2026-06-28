"use client"

import { motion } from "framer-motion"

export function PersonalCareBackground() {
  const lightningCore =
    "absolute h-[3px] rounded-full bg-gradient-to-r from-transparent via-purple-200 to-transparent shadow-[0_0_18px_rgba(216,180,254,0.75),0_0_42px_rgba(168,85,247,0.42)]"

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02040a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(168,85,247,0.38),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(217,70,239,0.22),transparent_30%),radial-gradient(circle_at_45%_82%,rgba(99,102,241,0.20),transparent_34%),linear-gradient(135deg,#02040a_0%,#08051a_44%,#030305_100%)]" />

      <motion.div
        animate={{ opacity: [0.22, 0.46, 0.26, 0.22], x: [0, 22, -14, 0], y: [0, -10, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(216,180,254,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_72%_24%,rgba(168,85,247,0.34)_0_1px,transparent_2px),radial-gradient(circle_at_52%_74%,rgba(192,132,252,0.28)_0_1px,transparent_2px),radial-gradient(circle_at_88%_68%,rgba(240,171,252,0.22)_0_1px,transparent_2px)] bg-[size:46px_46px]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(216,180,254,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(216,180,254,0.038)_1px,transparent_1px)] bg-[size:86px_86px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <motion.div
        animate={{ x: ["-22%", "16%", "-22%"], opacity: [0.12, 0.42, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[16%] h-[2px] w-[82%] rotate-[-12deg] bg-gradient-to-r from-transparent via-purple-300/70 to-transparent shadow-[0_0_24px_rgba(192,132,252,0.45)] blur-[0.6px]"
      />

      <motion.div
        animate={{ x: ["18%", "-14%", "18%"], opacity: [0.10, 0.34, 0.10] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[24%] right-0 h-[2px] w-[74%] rotate-[14deg] bg-gradient-to-r from-transparent via-fuchsia-300/60 to-transparent shadow-[0_0_24px_rgba(217,70,239,0.38)] blur-[0.6px]"
      />

      {/* Relámpagos morados: hechos con divs animados, sin librerías externas */}
      <motion.div
        animate={{ opacity: [0, 0, 0.95, 0.18, 0.78, 0], scaleX: [0.75, 0.75, 1.04, 0.92, 1.08, 0.75] }}
        transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        className="absolute left-[9%] top-[33%] h-[150px] w-[240px]"
      >
        <div className={`${lightningCore} left-0 top-0 w-[92px] rotate-[28deg]`} />
        <div className={`${lightningCore} left-[74px] top-[43px] w-[86px] rotate-[-48deg]`} />
        <div className={`${lightningCore} left-[126px] top-[82px] w-[110px] rotate-[25deg]`} />
        <div className="absolute left-[112px] top-[56px] h-2 w-2 rounded-full bg-purple-100 shadow-[0_0_28px_rgba(216,180,254,0.95)]" />
      </motion.div>

      <motion.div
        animate={{ opacity: [0, 0.82, 0.08, 0.72, 0], scaleX: [0.85, 1.05, 0.90, 1.12, 0.85] }}
        transition={{ duration: 5.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut", delay: 1.2 }}
        className="absolute right-[8%] top-[22%] h-[170px] w-[270px]"
      >
        <div className={`${lightningCore} right-[140px] top-[18px] w-[120px] rotate-[-24deg]`} />
        <div className={`${lightningCore} right-[74px] top-[54px] w-[94px] rotate-[45deg]`} />
        <div className={`${lightningCore} right-[18px] top-[100px] w-[126px] rotate-[-22deg]`} />
        <div className="absolute right-[106px] top-[73px] h-2 w-2 rounded-full bg-fuchsia-100 shadow-[0_0_30px_rgba(240,171,252,0.95)]" />
      </motion.div>

      <motion.div
        animate={{ opacity: [0, 0, 0.64, 0.10, 0.58, 0], scaleX: [0.80, 0.80, 1.10, 0.92, 1.04, 0.80] }}
        transition={{ duration: 6.4, repeat: Infinity, repeatDelay: 4.2, ease: "easeInOut", delay: 2.1 }}
        className="absolute bottom-[18%] left-[34%] h-[130px] w-[280px]"
      >
        <div className={`${lightningCore} left-[8px] top-[22px] w-[122px] rotate-[10deg]`} />
        <div className={`${lightningCore} left-[110px] top-[50px] w-[84px] rotate-[-42deg]`} />
        <div className={`${lightningCore} left-[168px] top-[84px] w-[94px] rotate-[18deg]`} />
      </motion.div>

      <motion.div
        animate={{ x: [0, 36, -24, 0], y: [0, -22, 24, 0], scale: [1, 1.12, 0.98, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[4%] top-[14%] h-[34rem] w-[34rem] rounded-full bg-purple-500/[0.18] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -28, 24, 0], y: [0, 22, -18, 0], scale: [1, 0.96, 1.10, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[5%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/[0.11] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, -18, 0], y: [0, -16, 16, 0], opacity: [0.10, 0.24, 0.12, 0.10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-[36%] h-[24rem] w-[24rem] rounded-full bg-indigo-500/[0.12] blur-3xl"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(2,4,10,0.48)_100%)]" />
    </div>
  )
}
