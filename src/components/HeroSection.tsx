import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import sneakersPurple from '@/assets/sneakers-purple.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background py-4 md:py-8">
      <div className="container px-4">
        {/* Unified Hero Card */}
        <div className="relative bg-[#E8E6F5] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 lg:p-16 overflow-hidden min-h-[250px] md:min-h-[500px] flex items-center">

          {/* Subtle Background Pattern/Decoration */}
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/50 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-row items-center justify-between gap-2 md:gap-8 relative z-10 w-full">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-[1.4] md:flex-1 space-y-3 md:space-y-6 text-left rtl:text-right z-20"
            >
              <h2 className="text-3xl md:text-6xl lg:text-[4.5rem] font-bold text-[#1A1B1E] leading-[1.1] tracking-tight">
                Step Into
                <br />
                Style
              </h2>

              <div className="space-y-3 md:space-y-4">
                <p className="text-muted-foreground text-xs md:text-base font-medium leading-relaxed max-w-[150px] md:max-w-sm">
                  New AirMax 270 react brings bold design.
                </p>

                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center gap-1 md:gap-2 text-[#7C3AED] font-bold text-sm md:text-lg hover:text-[#6D28D9] transition-colors"
                >
                  <span>Show more</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>
              </div>

              {/* Black Toast - Floating near text on desktop, scaled on mobile */}
              <div className="pt-4 md:pt-8 block">
                <div className="bg-[#1A1B1E] text-white pl-3 pr-4 py-2 md:pl-4 md:pr-6 md:py-3 rounded-full shadow-xl inline-flex items-center gap-2 md:gap-3 scale-90 origin-left md:scale-100">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#2D2E33] rounded-full flex items-center justify-center">
                    <span className="text-xs md:text-lg">🚚</span>
                  </div>
                  <div>
                    <p className="font-bold text-[10px] md:text-sm whitespace-nowrap">Free Shipping</p>
                    <p className="text-[8px] md:text-[10px] text-gray-400 hidden sm:block">On Orders Over $50</p>
                  </div>
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full border border-gray-600 flex items-center justify-center ml-1 md:ml-2">
                    <ArrowRight className="w-2 h-2 md:w-3 md:h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Shoe Image (No Card) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 w-full max-w-xl relative flex items-center justify-center"
            >
              {/* Product Background Blob REMOVED as per request */}

              <motion.img
                animate={{
                  y: [0, -10, 0],
                  filter: ["drop-shadow(0 10px 20px rgba(0,0,0,0.15))", "drop-shadow(0 20px 30px rgba(0,0,0,0.2))", "drop-shadow(0 10px 20px rgba(0,0,0,0.15))"]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src={sneakersPurple}
                alt="Air Max 270"
                className="w-[160%] md:w-[110%] h-auto object-contain max-h-[220px] md:max-h-[550px] relative z-10 -mr-6 md:-mr-8"
                style={{ transform: "rotate(-12deg) scale(1.1)" }}
              />

              {/* Decorative Floating Elements (like NOVA) - Hidden on mobile to reduce clutter */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-10 p-3 bg-white rounded-2xl shadow-sm hidden md:block z-20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;