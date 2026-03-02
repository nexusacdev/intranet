import React, { useState } from 'react';
import { User, Shield, Briefcase, Calendar, CheckCircle, ChevronDown, ChevronUp, Award, MousePointer2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BUDGET_ITEMS, CONTRACT_DATA } from '../../constants';
import { Player } from '../../types';

const Header = () => (
  <header className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5 px-6 py-4 flex justify-between items-center">
    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-display font-bold text-xl tracking-wider text-white cursor-pointer hover:opacity-80 transition-opacity">AGENCY CLAN <span className="text-agency-red">DOJO</span></a>
    <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
      <a href="#teams" className="hover:text-agency-red transition-colors">Academy Teams</a>
      <a href="#budget" className="hover:text-agency-red transition-colors">Financials</a>
      <a href="#terms" className="hover:text-agency-red transition-colors">Conditions</a>
      <a href="#sign" className="hover:text-white transition-colors border-l border-white/10 pl-8">Sign Now</a>
    </div>
  </header>
);

const Hero = () => (
  <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#121212_0%,_#050505_100%)]">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
    <div className="max-w-4xl mx-auto z-10 space-y-8">
      <div className="inline-block px-4 py-1.5 rounded-full border border-agency-red/30 bg-agency-red/5 text-agency-red font-display text-sm tracking-widest uppercase mb-4 animate-pulse">
        2026 Recruitment • Dojo U20
      </div>
      <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none text-white">
        ELEVATE YOUR <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-agency-red to-orange-500">POTENTIAL.</span>
      </h1>
      <p className="text-lg md:text-xl text-agency-muted max-w-2xl mx-auto font-light leading-relaxed">
        Bem-vindo à nova era do CS2 competitivo. <br />
        O recrutamento para os futuros talentos do Dojo começou.
      </p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
        <a href="#teams" className="px-10 py-4 bg-white text-black font-semibold rounded-full hover:bg-agency-red hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95">
          Young Ninjas
        </a>
        <a href="#sign" className="px-10 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
          Sign Contract
        </a>
      </div>
    </div>
    <div className="absolute bottom-12 animate-bounce cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => document.getElementById('teams')?.scrollIntoView()}>
      <ChevronDown size={32} />
    </div>
  </section>
);

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-16 space-y-4">
    <h3 className="text-agency-red font-display font-semibold tracking-widest uppercase text-sm">{subtitle}</h3>
    <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{title}</h2>
  </div>
);

const TeamsSection = ({ players }: { players: Player[] }) => {
  const raiden = players.filter(p => p.team === 'RaideN');
  const kenshin = players.filter(p => p.team === 'KenshiN');

  return (
    <section id="teams" className="py-24 px-6 max-w-7xl mx-auto">
      <SectionHeading subtitle="Active Roster" title="10 Selected Talents" />
      <div className="grid md:grid-cols-2 gap-12">
        {/* Team RaideN */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-agency-red/10 to-transparent border border-agency-red/20 red-glow">
            <h4 className="text-3xl font-display font-bold text-white mb-2 flex items-center justify-between">
              RAIDEN | 雷電
              <Shield className="text-agency-red" size={28} />
            </h4>
            <div className="w-full h-px bg-agency-red/20 my-6"></div>
            <div className="space-y-4">
              {raiden.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div>
                    <span className="text-agency-red/40 font-mono text-xs mr-4">0{idx + 1}</span>
                    <span className="font-display font-semibold text-lg text-white group-hover:text-agency-red transition-colors">{p.nick}</span>
                    <span className="text-agency-muted text-sm ml-4 font-light">{p.name}</span>
                  </div>
                  {p.status !== 'pending' && <CheckCircle className="text-green-500" size={18} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team KenshiN */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <h4 className="text-3xl font-display font-bold text-white mb-2 flex items-center justify-between">
              KENSHIN | 剣心
              <Award className="text-orange-500" size={28} />
            </h4>
            <div className="w-full h-px bg-orange-500/20 my-6"></div>
            <div className="space-y-4">
              {kenshin.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div>
                    <span className="text-orange-500/40 font-mono text-xs mr-4">0{idx + 6}</span>
                    <span className="font-display font-semibold text-lg text-white group-hover:text-orange-500 transition-colors">{p.nick}</span>
                    <span className="text-agency-muted text-sm ml-4 font-light">{p.name}</span>
                  </div>
                  {p.status !== 'pending' && <CheckCircle className="text-green-500" size={18} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BudgetSection = () => (
  <section id="budget" className="py-24 bg-agency-surface/50">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading subtitle="Financial Structure" title="2026: Budget Breakdown" />
      
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div className="p-6 rounded-2xl glass flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-agency-red/20 flex items-center justify-center text-agency-red">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-agency-muted uppercase font-bold tracking-widest">Duration</p>
            <p className="text-xl font-display text-white">4 Months from Signature</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl glass flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs text-agency-muted uppercase font-bold tracking-widest">Total Investment</p>
            <p className="text-xl font-display text-white">€{CONTRACT_DATA.totalBudget.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl glass flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-agency-muted uppercase font-bold tracking-widest">Scholarship Type</p>
            <p className="text-xl font-display text-white">Full Dojo Support</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/5 glass">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-agency-muted text-xs uppercase font-bold tracking-widest">
              <th className="px-8 py-6">Condition</th>
              <th className="px-8 py-6">Category</th>
              <th className="px-8 py-6">Description</th>
              <th className="px-8 py-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {BUDGET_ITEMS.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className={`px-8 py-6 font-display font-medium text-lg ${item.highlighted ? 'text-agency-red' : 'text-white'}`}>
                  {item.condition}
                </td>
                <td className="px-8 py-6 text-agency-muted font-light">{item.category}</td>
                <td className="px-8 py-6 text-agency-muted font-light">{item.description}</td>
                <td className="px-8 py-6 text-right font-mono font-bold text-white group-hover:text-agency-red transition-colors">
                  €{item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-agency-red/10">
              <td colSpan={3} className="px-8 py-8 font-display font-bold text-2xl text-white">TOTAL RECRUITMENT VALUE</td>
              <td className="px-8 py-8 text-right font-mono font-black text-3xl text-agency-red">€{CONTRACT_DATA.totalBudget.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </section>
);

const TermsSection = () => (
  <section id="terms" className="py-24 px-6 max-w-4xl mx-auto">
    <SectionHeading subtitle="Legal & Conditions" title="Contractual Commitments" />
    <div className="space-y-8 text-agency-muted leading-relaxed font-light">
      <div className="flex gap-4">
        <span className="text-agency-red font-bold text-xl mt-1">*</span>
        <p>Conditions marked with an asterisk (*) are contingent upon full completion of the contract term. These benefits may not be awarded during the contract period but may be granted after its conclusion at the sole discretion of the organization.</p>
      </div>
      <div className="flex gap-4">
        <span className="text-agency-red font-bold text-xl mt-1">**</span>
        <p>After the first stable month, each player may choose one premium service from the options marked with two asterisks (**): Warmup VIP, REFRAG Player, FACEIT Premium, or Leetify Pro.</p>
      </div>
      <p className="p-8 rounded-2xl glass border-l-4 border-agency-red text-sm italic">
        "The organization reserves the right to terminate the contract with any player at its sole discretion. Should any player elect to terminate the agreement prior to its natural expiration, a contractual release fee of two hundred euros (€200) shall be payable to TAC within thirty (30) days."
      </p>
      <div className="grid md:grid-cols-2 gap-8 text-sm pt-8">
        <div className="space-y-2">
          <p className="font-bold text-white uppercase tracking-widest text-xs">Esports Head</p>
          <p className="text-xl font-display text-agency-red">{CONTRACT_DATA.esportsHead}</p>
        </div>
        <div className="space-y-2">
          <p className="font-bold text-white uppercase tracking-widest text-xs">Prize Split</p>
          <p className="text-sm font-display text-white">LAN: 40% TAC — 60% Players</p>
          <p className="text-sm font-display text-white">Online: 30% TAC — 70% Players</p>
        </div>
      </div>
    </div>
  </section>
);

const SignSection = ({ players }: { players: Player[] }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'player'>('player');
  const [password, setPassword] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin') {
      if (password === 'theacore2026') {
        login('admin');
        navigate('/admin');
      } else {
        alert('Invalid password');
      }
    } else if (role === 'player') {
      if (selectedPlayerId) {
        login('player', selectedPlayerId);
        navigate('/contract');
      } else {
        alert('Please select a player');
      }
    }
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <section id="sign" className="py-24 px-6 bg-gradient-to-t from-agency-red/20 to-transparent">
      <div className="max-w-xl mx-auto glass p-10 md:p-16 rounded-[3rem] border-white/10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MousePointer2 size={120} />
        </div>
        <SectionHeading subtitle="Final Step" title="Player Endorsement" />
        
        <div className="flex justify-center gap-4 mb-8 relative z-10">
          <button
            onClick={() => setRole('player')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${role === 'player' ? 'bg-agency-red text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Player Login
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${role === 'admin' ? 'bg-agency-red text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
          {role === 'player' ? (
            <>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-agency-muted font-bold block text-left px-2">Select Your Profile</label>
                <select 
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full p-5 rounded-2xl bg-agency-dark/80 border border-white/10 text-white font-display text-lg focus:outline-none focus:border-agency-red transition-all appearance-none cursor-pointer"
                >
                  <option value="">— Select your nickname —</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.nick} ({p.team})</option>
                  ))}
                </select>
              </div>

              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/40">
                {selectedPlayer ? (
                  <div className="animate-pulse space-y-2">
                    <p className="text-agency-muted text-xs uppercase font-bold tracking-widest">Awaiting Digital Signature for</p>
                    <p className="text-3xl font-display font-bold text-white tracking-widest">{selectedPlayer.nick}</p>
                  </div>
                ) : (
                  <p className="text-agency-muted/30 italic">Select a player to activate signature field</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-agency-muted font-bold block text-left px-2">Admin Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 rounded-2xl bg-agency-dark/80 border border-white/10 text-white font-display text-lg focus:outline-none focus:border-agency-red transition-all"
                placeholder="Enter password"
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-6 rounded-2xl font-display font-bold text-xl tracking-widest uppercase transition-all transform active:scale-95 ${
              (role === 'player' && selectedPlayerId) || (role === 'admin' && password)
                ? 'bg-agency-red text-white hover:bg-white hover:text-agency-red shadow-lg shadow-agency-red/20' 
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            {role === 'player' ? 'Continue to Contract' : 'Access Dashboard'}
          </button>
          
          <p className="text-[10px] text-agency-muted/50 uppercase tracking-tighter">
            By clicking continue, you agree to all terms of the Agency Dojo Portal program as of March 2, 2026.
          </p>
        </form>
      </div>
    </section>
  );
};

const ScrollToTop = () => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-agency-red/80 hover:bg-agency-red text-white flex items-center justify-center transition-colors shadow-lg shadow-agency-red/20"
    aria-label="Scroll to top"
  >
    <ChevronUp size={24} />
  </button>
);

const Footer = () => (
  <footer className="py-12 border-t border-white/5 text-center text-agency-muted text-xs space-y-6">
    <p>© 2026 AGENCY CLAN. ALL RIGHTS RESERVED. CS2 COMPETITIVE EXCELLENCE.</p>
    <div className="w-12 h-1 bg-agency-red mx-auto"></div>
  </footer>
);

export default function Home() {
  const { players } = useAppContext();

  return (
    <div className="font-sans antialiased text-agency-text bg-agency-dark">
      <Header />
      <Hero />
      <div className="space-y-32 pb-32">
        <TeamsSection players={players} />
        <BudgetSection />
        <TermsSection />
        <SignSection players={players} />
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
