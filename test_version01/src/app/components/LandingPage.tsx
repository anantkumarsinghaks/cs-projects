'use client';

import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onSignInClick: () => void;
}

export default function LandingPage({ onSignInClick }: LandingPageProps) {
  // TCO Calculator State
  const [monthlySpend, setMonthlySpend] = useState<string>('50000');
  const [utilization, setUtilization] = useState<number>(30);
  const [estimatedSavings, setEstimatedSavings] = useState<number>(28000);

  // Recalculate savings based on inputs
  useEffect(() => {
    const spend = parseFloat(monthlySpend) || 0;
    const wastePercent = 100 - utilization;
    // Calculate 80% optimization efficiency on the wasted capacity
    const savings = spend * (wastePercent / 100) * 0.8;
    setEstimatedSavings(Math.round(savings));
  }, [monthlySpend, utilization]);

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-x-hidden font-body-md selection:bg-primary selection:text-on-primary-fixed">
      {/* Import the fonts and icons required by Stitch exactly */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />

      {/* Style overrides for animations and marquees */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .glass-card {
          background: rgba(17, 17, 17, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hero-glow {
          background: radial-gradient(circle at 50% 50%, rgba(163, 230, 53, 0.15) 0%, rgba(11, 19, 38, 0) 70%);
        }
        .btn-glow:hover {
          box-shadow: 0 0 15px rgba(163, 230, 53, 0.4);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1.05); }
          50% { opacity: 0.35; transform: scale(1); }
        }
        .circuit-bg-animate {
          animation: subtle-pulse 8s ease-in-out infinite;
        }
      `}} />

      {/* Top NavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-[#a3e635] shadow-lg shadow-[#a3e635]/15 shrink-0">
                <img src="/daddykart-new-logo.jpg" alt="Daddykart" className="w-full h-full object-cover object-top scale-110" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">daddy<span className="text-primary-container">kart</span></span>
                <p className="text-[9px] text-neutral-400 tracking-widest uppercase font-semibold">Cloud Storage</p>
              </div>
            </div>
            <div className="hidden md:flex gap-6 items-center">
              <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Platform</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Solutions</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Resources</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onSignInClick}
              className="text-on-surface hover:text-primary transition-colors font-body-md text-body-md cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={onSignInClick}
              className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold hover:scale-95 transition-all btn-glow flex items-center gap-2 cursor-pointer shadow-lg shadow-primary-container/15"
            >
              Get Started
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Circuit Animation Background */}
          <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 circuit-bg-animate mix-blend-screen" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQkoe0OUPUqyCCczk3B3hVt4zOFDMzCSt544vCURKwOxjvOrG-ec0HqURg47k0qt5rUZ00nmCQ2Q72b18IouRfjobjabscxF33Gr6BuTyzurfyk35OqVvhQB1h9ZpOd8tDaV4BC9wyB054TBtpwDN-SU7yhutvCLn85HfDgQkNOnCifQ7lp5ePeo-i9PkMpnmNRSZ-8WSc6daB0vWU9g4E8p02tDlWfkdCtdLOwXP6CgYhmUdhAF2G4a3d79qwaBN0zpW8wxLaeGY')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
          </div>
          <div className="absolute inset-0 hero-glow -z-10" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />

          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed font-label-mono text-label-mono uppercase tracking-wider">
                Next-Gen Cloud Storage
              </div>
              <h1 className="font-display-xl text-display-xl max-md:font-headline-lg-mobile max-md:text-headline-lg-mobile text-on-surface leading-tight">
                Intelligent, autonomous cloud storage optimization.
              </h1>
              <p className="text-on-surface-variant text-body-md max-w-xl">
                Stop overprovisioning. daddykart automatically right-sizes your block storage in real-time, reducing your cloud infrastructure spend by up to 50% without any downtime.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={onSignInClick}
                  className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold btn-glow flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-primary-container/15"
                >
                  Run a Free Assessment
                  <span className="material-symbols-outlined">analytics</span>
                </button>
                <button 
                  onClick={() => {
                    const calculator = document.getElementById('tco-calculator-section');
                    calculator?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border border-white/20 text-on-surface px-8 py-4 rounded-full font-bold hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Calculate Your Savings
                  <span className="material-symbols-outlined">calculate</span>
                </button>
              </div>
            </div>

            {/* Interactive Graphic Widget */}
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="glass-card rounded-2xl p-8 aspect-square flex flex-col justify-between overflow-hidden relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="font-label-mono text-label-mono text-primary uppercase">Storage Efficiency</span>
                    <h3 className="font-section-header text-section-header text-on-surface">+84.2%</h3>
                  </div>
                  <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined">speed</span>
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="flex-1 flex items-center justify-center relative py-12">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent blur-2xl opacity-50" />
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
                  <div className="w-4/5 h-3/4 border border-primary/20 rounded-xl relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
                    <div className="relative w-full h-full p-4 flex items-end gap-2">
                      <div className="bg-primary/40 w-full h-1/3 rounded-t-md animate-pulse" />
                      <div className="bg-primary/60 w-full h-1/2 rounded-t-md" />
                      <div className="bg-primary w-full h-4/5 rounded-t-md" />
                      <div className="bg-primary/30 w-full h-1/4 rounded-t-md" />
                      <div className="bg-primary/50 w-full h-2/3 rounded-t-md" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-high p-4 rounded-xl">
                    <p className="text-on-surface-variant text-body-sm mb-1">Provisioned</p>
                    <p className="font-bold text-on-surface">12.4 TB</p>
                  </div>
                  <div className="bg-primary-container/20 p-4 rounded-xl border border-primary-container/20">
                    <p className="text-primary-fixed text-body-sm mb-1">Optimized</p>
                    <p className="font-bold text-primary">3.1 TB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Marquee */}
        <section className="py-section-padding bg-surface-container-lowest overflow-hidden border-t border-white/5">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter mb-12 text-center">
            <h2 className="text-on-surface-variant font-label-mono text-label-mono uppercase tracking-widest">
              Trusted by Global Leaders &amp; Premier Institutions
            </h2>
          </div>
          <div className="relative flex items-center overflow-hidden select-none">
            <div className="animate-marquee gap-12 md:gap-24 items-center pr-12 md:pr-24 shrink-0">
              <PartnerLogosList />
            </div>
            <div className="animate-marquee gap-12 md:gap-24 items-center pr-12 md:pr-24 shrink-0" aria-hidden="true">
              <PartnerLogosList />
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-section-padding">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="text-center mb-20">
              <h2 className="font-headline-lg text-headline-lg max-md:font-headline-lg-mobile max-md:text-headline-lg-mobile text-on-surface mb-4">
                Precision Engineering for Storage
              </h2>
              <p className="text-on-surface-variant text-body-md max-w-2xl mx-auto">
                Our suite of AI-driven tools provides the transparency and control you need to master your cloud ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Feature Card 1 */}
              <div className="glass-card p-unit-gutter rounded-xl group hover:border-primary/50 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="h-48 mb-8 bg-surface-container rounded-lg relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    <div className="relative w-24 h-24 border-2 border-primary/20 rounded-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary/20 rounded animate-ping duration-1000" />
                      <span className="material-symbols-outlined absolute text-primary text-4xl">dynamic_form</span>
                    </div>
                  </div>
                  <h3 className="font-section-header text-section-header text-on-surface mb-3">AutoScaler</h3>
                  <p className="text-on-surface-variant text-body-md mb-8">
                    Intelligent, autonomous block storage right-sizing that scales in real-time with your demand.
                  </p>
                </div>
                <button 
                  onClick={onSignInClick}
                  className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all text-left cursor-pointer"
                >
                  Explore <span className="material-symbols-outlined">trending_flat</span>
                </button>
              </div>

              {/* Feature Card 2 */}
              <div className="glass-card p-unit-gutter rounded-xl group hover:border-primary/50 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="h-48 mb-8 bg-surface-container rounded-lg relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                    <div className="relative w-full px-8">
                      <div className="h-1 bg-white/10 rounded-full w-full" />
                      <div className="h-1 bg-primary rounded-full w-2/3 absolute top-0" />
                      <div className="flex justify-between mt-4">
                        <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_#a3e635]" />
                        <div className="w-4 h-4 bg-primary/20 rounded-full" />
                        <div className="w-4 h-4 bg-primary/20 rounded-full" />
                      </div>
                    </div>
                    <span className="material-symbols-outlined absolute text-primary text-4xl top-1/2 -translate-y-1/2">psychology</span>
                  </div>
                  <h3 className="font-section-header text-section-header text-on-surface mb-3">Humen</h3>
                  <p className="text-on-surface-variant text-body-md mb-8">
                    The intelligence engine for cloud storage, providing predictive insights and automated policy enforcement.
                  </p>
                </div>
                <button 
                  onClick={onSignInClick}
                  className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all text-left cursor-pointer"
                >
                  Explore <span className="material-symbols-outlined">trending_flat</span>
                </button>
              </div>

              {/* Feature Card 3 */}
              <div className="glass-card p-unit-gutter rounded-xl group hover:border-primary/50 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="h-48 mb-8 bg-surface-container rounded-lg relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                    <div className="grid grid-cols-3 gap-2 w-32">
                      <div className="h-12 bg-primary/40 rounded-sm" />
                      <div className="h-8 bg-primary/20 rounded-sm" />
                      <div className="h-16 bg-primary/60 rounded-sm" />
                      <div className="h-6 bg-primary/10 rounded-sm" />
                      <div className="h-10 bg-primary/30 rounded-sm" />
                      <div className="h-4 bg-primary/5 rounded-sm" />
                    </div>
                    <span className="material-symbols-outlined absolute text-primary text-4xl">search_check</span>
                  </div>
                  <h3 className="font-section-header text-section-header text-on-surface mb-3">Assessment</h3>
                  <p className="text-on-surface-variant text-body-md mb-8">
                    Find your cloud storage waste in 5 minutes with our deep-scan infrastructure audit tool.
                  </p>
                </div>
                <button 
                  onClick={onSignInClick}
                  className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all text-left cursor-pointer"
                >
                  Explore <span className="material-symbols-outlined">trending_flat</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TCO Calculator Section */}
        <section id="tco-calculator-section" className="py-section-padding bg-surface-container-low overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-12 h-1 bg-primary mb-8" />
                <h2 className="font-headline-lg text-headline-lg max-md:font-headline-lg-mobile max-md:text-headline-lg-mobile text-on-surface mb-6">
                  How much is your cloud storage actually costing you?
                </h2>
                <p className="text-on-surface-variant text-body-md mb-8">
                  Most enterprises waste 30-50% of their storage budget on over-provisioned EBS volumes. Our TCO calculator reveals the hidden costs and the immediate ROI of switching to DaddyKart.
                </p>
                <ul className="space-y-4 mb-10 text-on-surface font-semibold text-sm">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Analyze Multi-Cloud Spend
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Identify Unused Snapshots
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Projected Annualized Savings
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-2xl" />
                <div className="relative bg-surface-container-highest p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
                  <h3 className="font-section-header text-section-header text-on-surface mb-6">Run the numbers on your environment</h3>
                  <form onSubmit={(e) => { e.preventDefault(); onSignInClick(); }} className="space-y-6">
                    <div>
                      <label className="block text-on-surface-variant text-body-sm mb-2 uppercase font-label-mono text-xs font-bold">Cloud Provider</label>
                      <select className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                        <option>Amazon Web Services (AWS)</option>
                        <option>Microsoft Azure</option>
                        <option>Google Cloud Platform</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-on-surface-variant text-body-sm mb-2 uppercase font-label-mono text-xs font-bold">Monthly Storage Spend ($)</label>
                      <input 
                        type="number"
                        value={monthlySpend}
                        onChange={(e) => setMonthlySpend(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none placeholder:opacity-30" 
                        placeholder="e.g. 50,000" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-on-surface-variant text-body-sm mb-2">
                        <span className="uppercase font-label-mono text-xs font-bold">Avg. Storage Utilization</span>
                        <span className="text-primary font-bold">{utilization}%</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="100"
                        value={utilization}
                        onChange={(e) => setUtilization(Number(e.target.value))}
                        className="w-full accent-primary" 
                      />
                      <div className="flex justify-between text-on-surface-variant text-body-sm mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="bg-background/60 p-4 rounded-xl border border-white/5 text-center">
                      <p className="text-on-surface-variant text-xs uppercase tracking-wider font-bold mb-1">Estimated Monthly Savings</p>
                      <p className="text-primary text-2xl font-black">${estimatedSavings.toLocaleString()}</p>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary-container hover:bg-primary text-black py-4 rounded-full font-bold btn-glow transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-container/10"
                    >
                      Calculate My ROI
                      <span className="material-symbols-outlined">query_stats</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-section-padding relative overflow-hidden bg-gradient-to-t from-background/90 to-background/40">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="font-headline-lg text-headline-lg max-md:font-headline-lg-mobile max-md:text-headline-lg-mobile text-on-surface">
                Ready to achieve DaddyKart?
              </h2>
              <p className="text-on-surface-variant text-body-md max-w-xl mx-auto leading-relaxed">
                Join 500+ enterprises optimizing their infrastructure with autonomous storage management. Setup takes less than 10 minutes.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={onSignInClick}
                  className="bg-primary text-black px-10 py-5 rounded-full font-bold btn-glow transition-all hover:scale-105 cursor-pointer shadow-lg shadow-primary/10"
                >
                  Get Started for Free
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-white/5 py-12 text-sm text-on-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-[#a3e635] shrink-0">
                  <img src="/daddykart-new-logo.jpg" alt="Daddykart" className="w-full h-full object-cover object-top scale-110" />
                </div>
                <span className="font-extrabold text-white">daddykart</span>
              </div>
              <p className="text-on-surface-variant text-body-sm max-w-xs leading-relaxed">
                The nation's first autonomous storage orchestration platform for modern cloud teams.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Security</a>
              <a className="hover:text-primary transition-colors" href="#">Status</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p>© 2026 DaddyKart AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Partner logos list helper
function PartnerLogosList() {
  const partners = [
    { name: 'Microsoft', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFG4z7pxWx8sFq_5dMuF10fc_rkpdgZTXX7tKGx_kiGbc6YE2Y4Q-CJDlUv7AInRQej-RH7DXv8o9lhOTnjSOb_laM0Szr2ahGh8jUfYBltUj6mwsgEWhU10gsgIZBS_k7AVqGuaQ36_rrEiarNRJgINDYYJzNvF9XOpyGTmQLhiZbGHzsMyuFJHwJPo5rkxJixLaZzlLHdw5NR8zNcFBuGfbVgNkrn16ZMHD7KxG93TuW2hYwA7u3yi6EYwjOVrmzxp1dwT7nyao' },
    { name: 'IBM', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWUsJnZinBj9pE0KbH3v-fnpFyDYeiYfOuBVHU9xCQRQHUfHseYI6fXaI-z0h91bqPBA7klZ_CHPYm_zqFkRZDpjnDUBYcyCLDd-t-aEhT_OzGeMyMQ88gTYRPQ_GhG_jlrZuLVx6tp-ovWHkP0zQ9o7wW907E6xuggjY2y_pYcbWXWJT-uWUpmQEwjbazjJFayxxHR8vGs-p0HO_EWomQYev7JM9oIbEEcBTK8l31TsbjouMO-Zm2Ug7AfV_b3Vpb-EZBo8VcUtM' },
    { name: 'Apple', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbvqRb026Bz-70Z85h6mIt5pheaVJn111-3nRdmvJ1BoQZdDIV7BBTm0jQ60mVDyPG2aeYz3F_DSp52-AdQyQR2_PO6lVmySY0CUcYXbAezLu7xemJO2jZ80NjT1aFwqeZGnYqz9fodTTtOB-Buf3-CY_4EUcEAEmBr2V2CCjTu-MOjJcBVcUDofj9mDXDTi-e6Loo5DCfooUevi2ZqEKo8s9zI9PX37fWuEb57GoyESZtpuaYr2jJ1MpUZ54HW1h3rcH3BHGyktM' },
    { name: 'Samsung', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf8uPa1iU0teiHpvsw4HQGGdnWPVb0JJ9O7w-2KbVmh9xLECTyb-jt7Hhbc2DE-KJkNhSACghSqCWZgkKEI03fJhJW6kIduOJ-OOR98lkAXywajAGYnVlMsSclRboDNkMkikQ-l4RRb7IcpSqLosAIechxqPxxEa98K436VCSEcMwdMT0ofX325BMPl_L10QzQ0zZ68npoceePnFogEqjYSKnjpiOB6ARWT7FEpSPcKxjjFizzA3sf7gmpIr5VnGc--47vBAAh8E8' },
    { name: 'GoI', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwPtFVDGQwmXAUSSB1eYRFPUPBqGYU630UKCXkozf9kG4_ZCfo-V2yb4MGJQWyudauZPU3-5FjIQi41pLIbU5ZcS68k2DeA9ltXhdo87zTSRaFV6vhFWgXzom4XibgoY-tt5OCWpyqrTk-AxAQDLr3QBDp1rxUJcwumftwsuWCboxdZog_rnmjN5wZ7OPP9IKG1ehcO4aCLB2FWFyR47R5bQepppTWAayiuIv7I_A3G65Ik4hBrOI8A1BkwBLD483c8OB7bLfP44' },
    { name: 'MNNIT', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAbtFKeKUxS_9_NCZx03sfwPBntU2-spimScElz_1YiM_hgd2RH86T-4gF_yA_sAoQpi6qImsYie2XJu9cv9kuJBn0UJ_Ed72WwWVHU1s5Amr8sSVv379Clg5CyXEnAUX8QhPxKBFTSFKvsX3IjqhBzq4m6CrL75tyGnq2w9GqOip1DQpDvVCX5HKtGfcPqIvmJ7gLfHwWs5SNtblT_3FIRrOTlIGH_Jxi3Ft0Z8ewaaTT--9YUhjgD7DKMHhhxKSx-ORxXATaVlg' },
    { name: 'IITR', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUdL7YVxnslB9Z1XVM0sJZhPHXAdTOLHfGu9dR5jrmJLMU0htBCDROLG9Fyyj80PCLiGaiZURO7nx60Oe1-Sykd6Fi1Uj0DUaoBQ76q3hsRkhDguvTDdqR86OMphKgyXLcQvvX56qx7-gMXJisdKE4ygeKGrHZo7y4EBsOme8LAHXiTguu7KIXoostndY1ylRDPjbnSNHpEo4aIwhsGmIDy8ey0PMI9sgJqrj6B6Z2tSgTTaRAU09ftBoa8EB9Nx7Vh2ZLyvrS184' },
    { name: 'GLB', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnmBPsgpFjrHxuGPHuPyitQImZFLBwGYTpqRqm5jonVbOlLEhk_tyXKxV4CmY2uUjdEHVymdJpnDUFZSqKecwGFSnWO5J4qoqy8NWWN0K8Yn45PxoxR_bhF1Y9H0iNOiPV_4JHr8MeQi0e1-VlAZQC_qeeaKeexm-O3NgZInoQKvka2x2IF-9qw1GPMRXAIdVR0TRaG_UoUgQA82i48WmAJc4lRBv2J1c28qZ0l6E691DHVPgVFN07LZDd9SEHCt97V57Gm1DKul0' },
    { name: 'IIT Delhi', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaFNDC2UDn1S8lYMRJP8qJ_wvVHV5C3NR2gvhYwhxsqIoc1qEC3h8jidRkkUmwZ0zP7O6T4YoXGHo3ovSIug3HKHthqS9YA4OdL_ClYQ6YDsZBra0ytXlJu-aN_GchmeCZVQHZE_uRkDIpyW1krilVvitWoTCdI9Uz3DiCxRxwjSJCu1ptUuS6pf0wX8B9wiV3J43q4cHPs_8JOpZR68MtJunRcDqcnp5f61SXNN0Ao4wTIA3O6uCfeCkE8eyBNnnTLUHDCbgTsoM' }
  ];

  return (
    <>
      {partners.map((p, idx) => (
        <img 
          key={`${p.name}-${idx}`}
          alt={p.name} 
          src={p.src} 
          className="h-16 md:h-20 shrink-0 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 opacity-80 brightness-125 object-contain" 
        />
      ))}
    </>
  );
}
