// "use client";

// import { motion } from "framer-motion";
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

// export default function SummaryCards({ cards = [] }) {
//   const fadeUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i = 1) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.05, duration: 0.3 },
//     }),
//   };

//   return (
//     <motion.div
//       initial="hidden"
//       animate="visible"
//       variants={fadeUp}
//       className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
//     >
//       {cards.map((card, index) => (
//         <motion.div key={index} custom={index} variants={fadeUp}>
//           <Card
//             className={`bg-gradient-to-br ${card.color} border-none shadow-lg hover:shadow-xl transition-all duration-300`}
//           >
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {card.title}
//               </CardTitle>
//               {card.icon && <card.icon className="h-5 w-5 opacity-70" />}
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{card.value}</div>
//               <p className="text-sm text-muted-foreground">
//                 {card.description}
//               </p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </motion.div>
//   );
// }


"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function SummaryCards({ cards = [] }) {
  // Container Animation
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        duration: 0.3,
      },
    },
  };

  // Each Card Animation
  const item = {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      {cards.map((card, index) => (
        <motion.div key={index} variants={item}>
          <Card
            className={`bg-gradient-to-br ${card.color} border-none shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform duration-300`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon && <card.icon className="h-5 w-5 opacity-70" />}
            </CardHeader>

            <CardContent>
              <AnimatedNumber value={card.value} />
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ✨ Animated Number Component ✨ */
function AnimatedNumber({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return (
    <motion.div className="text-3xl font-bold">
      {rounded}
    </motion.div>
  );
}
