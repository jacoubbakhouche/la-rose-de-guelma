import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import sneakersPurple from '@/assets/sneakers-purple.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background py-4 md:py-8">
      <div className="container px-4">
        {/* Unified Hero Card */}
        <div className="relative bg-[#E8E6F5] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-12 lg:p-16 overflow-hidden min-h-[220px] md:min-h-[500px] flex items-center">

          {/* Subtle Background Pattern/Decoration */}
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/50 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-row items-center justify-between gap-3 md:gap-8 relative z-10 w-full">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-[1.2] md:flex-1 space-y-2 md:space-y-6 text-left rtl:text-right z-20"
            >
              <h2 className="text-[1.75rem] leading-none md:text-6xl lg:text-[4.5rem] font-bold text-[#1A1B1E] md:leading-[1.1] tracking-tight">
                Step Into
                <br />
                Style
              </h2>

              <div className="space-y-2 md:space-y-4">
                <p className="text-muted-foreground text-[10px] md:text-base font-medium leading-relaxed max-w-[140px] md:max-w-sm">
                  New AirMax 270 react brings bold design.
                </p>

                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center gap-1 md:gap-2 text-[#7C3AED] font-bold text-xs md:text-lg hover:text-[#6D28D9] transition-colors"
                >
                  <span>Show more</span>
                  <ArrowRight className="w-3 h-3 md:w-5 md:h-5" />
                </motion.a>
              </div>

              {/* Black Toast - Floating near text */}
              <div className="pt-3 md:pt-8 block">
                <div className="bg-[#1A1B1E] text-white pl-2 pr-3 py-1.5 md:pl-4 md:pr-6 md:py-3 rounded-full shadow-xl inline-flex items-center gap-2 md:gap-3 scale-90 origin-left md:scale-100">
                  <div className="w-5 h-5 md:w-8 md:h-8 bg-[#2D2E33] rounded-full flex items-center justify-center">
                    <span className="text-[10px] md:text-lg">🚚</span>
                  </div>
                  <div>
                    <p className="font-bold text-[8px] md:text-sm whitespace-nowrap">Free Shipping</p>
                    <p className="text-[8px] md:text-[10px] text-gray-400 hidden sm:block">On Orders Over $50</p>
                  </div>
                  <div className="w-3 h-3 md:w-6 md:h-6 rounded-full border border-gray-600 flex items-center justify-center ml-0.5 md:ml-2">
                    <ArrowRight className="w-2 h-2 md:w-3 md:h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Shoe in White Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 w-full max-w-xl relative flex items-center justify-center"
            >
              {/* White Card Container */}
              <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-sm aspect-square w-full flex items-center justify-center relative p-3 md:p-8">

                {/* Decorative dots inside card */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2">
                  <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-gray-300"></div>
                  <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-gray-800"></div>
                  <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-gray-300"></div>
                </div>

                <motion.img
                  animate={{
                    y: [0, -8, 0],
                    filter: ["drop-shadow(0 5px 10px rgba(0,0,0,0.1))", "drop-shadow(0 15px 20px rgba(0,0,0,0.15))", "drop-shadow(0 5px 10px rgba(0,0,0,0.1))"]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  src={sneakersPurple}
                  alt="Air Max 270"
                  className="w-[110%] h-auto object-contain max-h-[150px] md:max-h-[400px] relative z-10"
                  style={{ transform: "rotate(-12deg) scale(1.1)" }}
                />
              </div>

            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;