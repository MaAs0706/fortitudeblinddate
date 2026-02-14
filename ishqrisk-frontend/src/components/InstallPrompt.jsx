import { useState, useEffect } from "react";
import { onInstallStateChange, promptInstall } from "../utils/pwa"; // Adjust path
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
  const [installState, setInstallState] = useState({ canInstall: false, isStandalone: false });


    useEffect(() => {
    // Listen for the browser's install availability
    const unsubscribe = onInstallStateChange((state) => {
      setInstallState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === "accepted") {
      console.log("PWA Installed from Waiting area");
    }
  };
  useEffect(() => {
    // Subscribe to your PWA utility listeners
    const unsubscribe = onInstallStateChange((state) => {
      setInstallState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result.outcome === "accepted") {
      console.log("User accepted the PWA install");
    }
  };

  // Hide the prompt if already installed (standalone) or if the browser hasn't enabled it yet
  if (installState.isStandalone || !installState.canInstall) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-6 right-6 z-50 p-4 bg-[#2d1f44]/95 backdrop-blur-xl border border-[#ed9e6f]/30 rounded-2xl shadow-2xl flex items-center justify-between"
      >
        <div className="flex flex-col">
          <p className="text-[#ed9e6f] font-bold text-sm tracking-wide uppercase">
            ✦ Install IshqRisk
          </p>
          <p className="text-white/60 text-[10px]">
            Add to home screen for the full experience.
          </p>
        </div>
        
        <button
          onClick={handleInstallClick}
          className="bg-[#ed9e6f] text-[#0c111f] px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
        >
          INSTALL
        </button>
      </motion.div>
    </AnimatePresence>
  );
}