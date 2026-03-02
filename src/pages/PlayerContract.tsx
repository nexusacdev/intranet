import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format, addMonths } from 'date-fns';
import { Shield, CheckCircle, PenTool, LogOut, AlertCircle, Download } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function PlayerContract() {
  const { players, currentUser, updatePlayer, logout } = useAppContext();
  const navigate = useNavigate();
  const sigCanvas = useRef<SignatureCanvas>(null);

  const contractRef = useRef<HTMLDivElement>(null);
  const [nif, setNif] = useState('');
  const [address, setAddress] = useState('');
  const [consent, setConsent] = useState(false);

  const player = players.find(p => p.id === currentUser?.id);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'player' || !player) {
      navigate('/');
    }
  }, [currentUser, player, navigate]);

  if (!player) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSign = () => {
    if (!nif || !address) {
      alert('Please fill in your NIF and Address.');
      return;
    }
    if (!consent) {
      alert('You must agree to the terms.');
      return;
    }
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signature = sigCanvas.current.getCanvas().toDataURL('image/png');
      updatePlayer(player.id, {
        nif,
        address,
        playerSignature: signature,
        signedAt: Date.now(),
        status: 'player_signed'
      });
      alert('Contract signed successfully! Waiting for admin countersignature.');
    } else {
      alert('Please provide a signature.');
    }
  };

  const handleDownloadPDF = async () => {
    const element = contractRef.current;
    if (!element) return;

    // html2canvas doesn't support backdrop-filter (glass class), use solid bg
    const prevBg = element.style.background;
    const prevBackdrop = element.style.backdropFilter;
    const prevWebkitBackdrop = (element.style as any).webkitBackdropFilter || '';
    element.style.background = '#333333';
    element.style.backdropFilter = 'none';
    (element.style as any).webkitBackdropFilter = 'none';

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 10,
          filename: `contract-${player.nick}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, scrollY: -window.scrollY },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    } finally {
      element.style.background = prevBg;
      element.style.backdropFilter = prevBackdrop;
      (element.style as any).webkitBackdropFilter = prevWebkitBackdrop;
    }
  };

  const isSigned = player.status === 'player_signed' || player.status === 'fully_signed';

  return (
    <div className="min-h-screen bg-agency-black text-white p-8">
      <header className="flex justify-between items-center mb-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Shield className="text-agency-red" size={32} />
          <h1 className="text-2xl font-bold tracking-tight">Player Portal</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {isSigned && (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-start gap-4">
            <CheckCircle className="text-green-500 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-green-500 text-lg">Contract Signed</h3>
              <p className="text-green-500/80 text-sm mt-1">
                {player.status === 'fully_signed' 
                  ? 'Your contract has been fully executed and countersigned by an admin.' 
                  : 'Your signature has been recorded. Awaiting admin countersignature.'}
              </p>
            </div>
          </div>
        )}

        {player.status === 'fully_signed' && (
          <button
            onClick={handleDownloadPDF}
            className="w-full py-4 rounded-2xl bg-agency-red text-white font-bold text-lg hover:bg-agency-darkRed transition-colors flex items-center justify-center gap-3"
          >
            <Download size={20} />
            Download PDF
          </button>
        )}

        <div ref={contractRef} className="p-12 rounded-3xl glass border border-white/5 space-y-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-agency-red to-agency-darkRed"></div>
          
          <div className="text-center border-b border-white/10 pb-8">
            <h2 className="text-4xl font-bold uppercase tracking-tight mb-2">Contrato de Formação Desportiva e Agenciamento</h2>
            <p className="text-sm uppercase tracking-widest text-white/40">Celebrado entre as partes abaixo identificadas</p>
          </div>

          {!isSigned && (
            <div className="grid md:grid-cols-2 gap-8 bg-black/20 p-8 rounded-2xl border border-white/5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/60 font-bold">NIF (Tax ID)</label>
                <input 
                  type="text" 
                  value={nif}
                  onChange={e => setNif(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/10 focus:border-agency-red focus:outline-none transition-colors"
                  placeholder="Enter your NIF"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Full Address</label>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/50 border border-white/10 focus:border-agency-red focus:outline-none transition-colors resize-none h-12"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          )}

          <div className="space-y-8 text-sm leading-relaxed text-white/80">
            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Identificação das Partes</h3>
              <p><strong>PRIMEIRO OUTORGANTE:</strong> AGENCY CLAN, organização de desportos eletrónicos (Esports), adiante designada por "Organização" ou "Agency Clan".</p>
              <p><strong>SEGUNDO OUTORGANTE:</strong> {player.name}, conhecido no meio desportivo por "{player.nick}", titular do NIF {isSigned ? player.nif : (nif || '[NIF PENDING]')}, residente em {isSigned ? player.address : (address || '[ADDRESS PENDING]')}, adiante designado por "Jogador".</p>
              <p className="italic mt-6">É celebrado e reduzido a escrito o presente Contrato de Formação Desportiva, que se rege pelas cláusulas seguintes:</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Cláusula 1ª (Objeto) e Cláusula 2ª (Duração)</h3>
              <p>1. O presente contrato tem por objeto a formação desportiva e agenciamento do Jogador na modalidade de Counter-Strike 2 (CS2), integrando-o na estrutura da Agency Clan.</p>
              <p>2. O contrato tem a duração de 4 (quatro) meses, com início a 02 de março de 2026 e término a 02 de julho de 2026.</p>
              <p>3. A intenção de renovação ou denúncia do presente contrato deve ser comunicada por escrito por qualquer das partes com uma antecedência mínima de 15 (quinze) dias em relação ao seu termo.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Cláusula 3ª (Benefícios e Formação)</h3>
              <p>Durante a vigência do contrato, a Organização compromete-se a fornecer ao Jogador:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Subscrição ESEA e Pracc.</li>
                <li>Acesso a servidores de Discord e TeamSpeak.</li>
                <li>Acompanhamento dedicado por 1 Manager e 1 Coach, com suporte de toda a estrutura.</li>
              </ul>
              <p className="mt-4">Após 1 (um) mês de estabilidade e cumprimento de objetivos:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>O Jogador poderá escolher um benefício extra: Refrag, Leetify, Warmup Server ou Faceit Premium.</li>
                <li>Acesso a Masterclasses e ferramentas de Inteligência Artificial para desenvolvimento contínuo.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Cláusula 4ª (Obrigações e Direitos de Imagem)</h3>
              <p>1. O Jogador compromete-se a manter uma atitude profissional, focar-se na sua evolução no jogo e trabalhar ativamente as suas redes sociais para construção de marca pessoal em alinhamento com a Organização.</p>
              <p>2. O Jogador compromete-se a manter total transparência e comunicação aberta com a equipa de gestão.</p>
              <p>3. Pelo presente contrato, o Jogador cede os seus direitos de imagem à Agency Clan para fins promocionais, de marketing e criação de conteúdo durante a vigência do mesmo.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Cláusula 5ª (Distribuição de Prémios)</h3>
              <p>1. Os prémios obtidos em competições oficiais durante a vigência do contrato serão distribuídos da seguinte forma:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Eventos LAN:</strong> 40% para a Organização (TAC) — 60% para os Jogadores.</li>
                <li><strong>Eventos Online:</strong> 30% para a Organização (TAC) — 70% para os Jogadores.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Cláusula 6ª (Cláusula de Rescisão) e Cláusula 7ª (Foro)</h3>
              <p>1. Qualquer contacto externo referente à transferência do Jogador deve ser obrigatoriamente direcionado à Organização ou ao Manager da equipa.</p>
              <p>2. Caso o Jogador decida abandonar a Organização antes do término do contrato, fica estipulada uma cláusula de rescisão (buyout) no valor de 200€ (duzentos euros), para compensar o investimento formativo realizado.</p>
              <p>3. Bónus de Renovação: Em caso de renovação bem-sucedida após os 4 meses iniciais, o Jogador será recompensado com a Jersey Oficial da Agency Clan.</p>
              <p>4. Para dirimir quaisquer litígios emergentes da interpretação ou execução deste contrato, as partes estipulam como competente o foro da Comarca do Porto, com expressa renúncia a qualquer outro.</p>
            </div>
          </div>

          <div className="text-center py-6 mt-8 border-t border-white/10">
            <p className="text-xs uppercase tracking-widest font-bold text-white/60 italic">DIGITAL SIGNATURE — future Major sticker material. choose wisely.</p>
          </div>

          {!isSigned && (
            <div className="space-y-8 pt-8 border-t border-white/10">
              <div className="flex items-start gap-4 bg-agency-red/5 p-6 rounded-xl border border-agency-red/20">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-agency-red cursor-pointer"
                />
                <label htmlFor="consent" className="text-sm cursor-pointer select-none">
                  I, <strong>{player.name}</strong>, acknowledge that I have read, understood, and agree to be bound by the terms and conditions outlined in this Formation Agreement. I confirm that the information provided (NIF: {nif || '[PENDING]'}, Address: {address || '[PENDING]'}) is accurate.
                </label>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-white/60 font-bold flex items-center gap-2">
                  <PenTool size={16} />
                  Digital Signature
                </p>
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-dashed border-white/20">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: 'w-full h-48 cursor-crosshair' }}
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => sigCanvas.current?.clear()}
                    className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    Clear Signature
                  </button>
                  <button 
                    onClick={handleSign}
                    disabled={!consent || !nif || !address}
                    className="flex-1 px-6 py-3 rounded-xl bg-agency-red text-white font-bold hover:bg-agency-darkRed transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-agency-red/20"
                  >
                    Sign & Submit Contract
                  </button>
                </div>
              </div>
            </div>
          )}

          {isSigned && (
            <div className="grid grid-cols-2 gap-12 pt-12 mt-12 border-t border-white/10">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest font-bold text-white/40">Player Signature</p>
                <img src={player.playerSignature} alt="Player Signature" className="h-24 object-contain bg-white/5 rounded-lg border border-white/10 p-2 w-full" />
                <p className="text-xs text-white/40 font-mono">Signed on: {format(new Date(player.signedAt!), 'dd MMM yyyy HH:mm')}</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest font-bold text-white/40">Admin Signature</p>
                {player.status === 'fully_signed' ? (
                  <>
                    <img src={player.adminSignature} alt="Admin Signature" className="h-24 object-contain bg-white/5 rounded-lg border border-white/10 p-2 w-full" />
                    <p className="text-xs text-white/40 font-mono">Countersigned</p>
                  </>
                ) : (
                  <div className="h-24 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 border-dashed">
                    <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={16} />
                      Awaiting Countersignature
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
