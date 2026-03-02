import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format, addMonths } from 'date-fns';
import { Shield, CheckCircle, PenTool, Printer, LogOut, X, Download } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Player } from '../../types';

export default function AdminDashboard() {
  const { players, updatePlayer, logout } = useAppContext();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCountersign = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty() && selectedPlayer) {
      const signature = sigCanvas.current.getCanvas().toDataURL('image/png');
      updatePlayer(selectedPlayer.id, {
        adminSignature: signature,
        status: 'fully_signed'
      });
      setSelectedPlayer(null);
    } else {
      alert('Please provide a signature first.');
    }
  };

  const contractRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfPlayer, setPdfPlayer] = useState<Player | null>(null);

  const handleDownloadPDF = async (player: Player) => {
    setPdfPlayer(player);
    await new Promise(r => setTimeout(r, 500));

    const element = pdfRef.current;
    if (!element) return;

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
      setPdfPlayer(null);
    }
  };

  const stats = {
    total: players.length,
    active: players.filter(p => p.status === 'fully_signed').length,
    actionRequired: players.filter(p => p.status === 'player_signed').length,
    pending: players.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-agency-black text-white p-8">
      <header className="flex justify-between items-center mb-12 no-print">
        <div className="flex items-center gap-4">
          <Shield className="text-agency-red" size={32} />
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-12 no-print">
        <div className="p-6 rounded-2xl glass border border-white/5">
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Total Players</p>
          <p className="text-4xl font-mono font-bold">{stats.total}</p>
        </div>
        <div className="p-6 rounded-2xl glass border border-green-500/20 bg-green-500/5">
          <p className="text-xs uppercase tracking-widest text-green-500/60 font-bold mb-2">Active Contracts</p>
          <p className="text-4xl font-mono font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="p-6 rounded-2xl glass border border-agency-red/20 bg-agency-red/5">
          <p className="text-xs uppercase tracking-widest text-agency-red/60 font-bold mb-2">Action Required</p>
          <p className="text-4xl font-mono font-bold text-agency-red">{stats.actionRequired}</p>
        </div>
        <div className="p-6 rounded-2xl glass border border-white/5">
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Pending Signatures</p>
          <p className="text-4xl font-mono font-bold">{stats.pending}</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-white/5 overflow-hidden no-print">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-xs uppercase font-bold tracking-widest text-white/40">
              <th className="px-8 py-6">Player</th>
              <th className="px-8 py-6">Role</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Termination Date</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.map(player => {
              const termDate = player.signedAt ? format(addMonths(new Date(player.signedAt), 4), 'dd MMM yyyy') : '—';
              return (
                <tr key={player.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold">{player.name}</p>
                    <p className="text-sm text-white/40 font-mono">{player.nick}</p>
                  </td>
                  <td className="px-8 py-6 text-white/60">{player.role}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      player.status === 'fully_signed' ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                      player.status === 'player_signed' ? 'bg-agency-red/20 text-agency-red border border-agency-red/20' :
                      'bg-white/10 text-white/40 border border-white/10'
                    }`}>
                      {player.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-white/60">{termDate}</td>
                  <td className="px-8 py-6 text-right">
                    {player.status === 'player_signed' && (
                      <button 
                        onClick={() => setSelectedPlayer(player)}
                        className="px-4 py-2 bg-agency-red text-white rounded-lg text-sm font-bold hover:bg-agency-darkRed transition-colors flex items-center gap-2 ml-auto"
                      >
                        <PenTool size={16} />
                        Countersign
                      </button>
                    )}
                    {player.status === 'fully_signed' && (
                      <button
                        onClick={() => handleDownloadPDF(player)}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/20 transition-colors flex items-center gap-2 ml-auto"
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Countersign Modal */}
      {selectedPlayer && selectedPlayer.status !== 'fully_signed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
          <div ref={contractRef} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-agency-darkGray border border-white/10 p-12 relative">

            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            <div className="space-y-8">
              <div className="text-center border-b border-white/10 pb-8">
                <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Contrato de Formação Desportiva e Agenciamento</h2>
                <p className="text-sm uppercase tracking-widest opacity-60">Celebrado entre as partes abaixo identificadas</p>
              </div>

              <div className="space-y-8 text-sm leading-relaxed opacity-80">
                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Identificação das Partes</h3>
                  <p><strong>PRIMEIRO OUTORGANTE:</strong> AGENCY CLAN, organização de desportos eletrónicos (Esports), adiante designada por "Organização" ou "Agency Clan".</p>
                  <p><strong>SEGUNDO OUTORGANTE:</strong> {selectedPlayer.name}, conhecido no meio desportivo por "{selectedPlayer.nick}", titular do NIF {selectedPlayer.nif}, residente em {selectedPlayer.address}, adiante designado por "Jogador".</p>
                  <p className="italic mt-6">É celebrado e reduzido a escrito o presente Contrato de Formação Desportiva, que se rege pelas cláusulas seguintes:</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Cláusula 1ª (Objeto) e Cláusula 2ª (Duração)</h3>
                  <p>1. O presente contrato tem por objeto a formação desportiva e agenciamento do Jogador na modalidade de Counter-Strike 2 (CS2), integrando-o na estrutura da Agency Clan.</p>
                  <p>2. O contrato tem a duração de 4 (quatro) meses, com início a 02 de março de 2026 e término a 02 de julho de 2026.</p>
                  <p>3. A intenção de renovação ou denúncia do presente contrato deve ser comunicada por escrito por qualquer das partes com uma antecedência mínima de 15 (quinze) dias em relação ao seu termo.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Cláusula 3ª (Benefícios e Formação)</h3>
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
                  <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Cláusula 4ª (Obrigações e Direitos de Imagem)</h3>
                  <p>1. O Jogador compromete-se a manter uma atitude profissional, focar-se na sua evolução no jogo e trabalhar ativamente as suas redes sociais para construção de marca pessoal em alinhamento com a Organização.</p>
                  <p>2. O Jogador compromete-se a manter total transparência e comunicação aberta com a equipa de gestão.</p>
                  <p>3. Pelo presente contrato, o Jogador cede os seus direitos de imagem à Agency Clan para fins promocionais, de marketing e criação de conteúdo durante a vigência do mesmo.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Cláusula 5ª (Distribuição de Prémios)</h3>
                  <p>1. Os prémios obtidos em competições oficiais durante a vigência do contrato serão distribuídos da seguinte forma:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Eventos LAN:</strong> 40% para a Organização (TAC) — 60% para os Jogadores.</li>
                    <li><strong>Eventos Online:</strong> 30% para a Organização (TAC) — 70% para os Jogadores.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Cláusula 6ª (Cláusula de Rescisão) e Cláusula 7ª (Foro)</h3>
                  <p>1. Qualquer contacto externo referente à transferência do Jogador deve ser obrigatoriamente direcionado à Organização ou ao Manager da equipa.</p>
                  <p>2. Caso o Jogador decida abandonar a Organização antes do término do contrato, fica estipulada uma cláusula de rescisão (buyout) no valor de 200€ (duzentos euros), para compensar o investimento formativo realizado.</p>
                  <p>3. Bónus de Renovação: Em caso de renovação bem-sucedida após os 4 meses iniciais, o Jogador será recompensado com a Jersey Oficial da Agency Clan.</p>
                  <p>4. Para dirimir quaisquer litígios emergentes da interpretação ou execução deste contrato, as partes estipulam como competente o foro da Comarca do Porto, com expressa renúncia a qualquer outro.</p>
                </div>
              </div>

              <div className="text-center py-6 mt-8 border-t border-white/10">
                <p className="text-xs uppercase tracking-widest font-bold opacity-60 italic">DIGITAL SIGNATURE — future Major sticker material. choose wisely.</p>
              </div>

              <div className="grid grid-cols-2 gap-12 pt-12 mt-4 border-t border-white/10">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-60">Player Signature</p>
                  {selectedPlayer.playerSignature ? (
                    <img src={selectedPlayer.playerSignature} alt="Player Signature" className="h-24 object-contain border-b border-white/20 w-full" />
                  ) : (
                    <div className="h-24 border-b border-white/20 w-full"></div>
                  )}
                  <p className="text-xs opacity-60">Signed on: {selectedPlayer.signedAt ? format(new Date(selectedPlayer.signedAt), 'dd MMM yyyy') : 'N/A'}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-60">Admin Signature</p>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl overflow-hidden border-2 border-dashed border-white/20">
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{ className: 'w-full h-32 cursor-crosshair' }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => sigCanvas.current?.clear()}
                        className="px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleCountersign}
                        className="flex-1 px-4 py-2 rounded-lg bg-agency-red text-white font-bold text-sm hover:bg-agency-darkRed transition-colors"
                      >
                        Approve & Sign
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hidden off-screen PDF container — mirrors PlayerContract exactly */}
      {pdfPlayer && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={pdfRef} className="p-12 rounded-3xl border border-white/5 space-y-12 relative overflow-hidden" style={{ width: '800px', background: '#333333', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-agency-red to-agency-darkRed"></div>

            <div className="text-center border-b border-white/10 pb-8">
              <h2 className="text-4xl font-bold uppercase tracking-tight mb-2">Contrato de Formação Desportiva e Agenciamento</h2>
              <p className="text-sm uppercase tracking-widest text-white/40">Celebrado entre as partes abaixo identificadas</p>
            </div>

            <div className="space-y-8 text-sm leading-relaxed text-white/80">
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-agency-red mb-4 border-b border-white/10 pb-2">Identificação das Partes</h3>
                <p><strong>PRIMEIRO OUTORGANTE:</strong> AGENCY CLAN, organização de desportos eletrónicos (Esports), adiante designada por "Organização" ou "Agency Clan".</p>
                <p><strong>SEGUNDO OUTORGANTE:</strong> {pdfPlayer.name}, conhecido no meio desportivo por "{pdfPlayer.nick}", titular do NIF {pdfPlayer.nif}, residente em {pdfPlayer.address}, adiante designado por "Jogador".</p>
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

            <div className="grid grid-cols-2 gap-12 pt-12 mt-12 border-t border-white/10">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest font-bold text-white/40">Player Signature</p>
                {pdfPlayer.playerSignature ? (
                  <img src={pdfPlayer.playerSignature} alt="Player Signature" className="h-24 object-contain bg-white/5 rounded-lg border border-white/10 p-2 w-full" />
                ) : (
                  <div className="h-24 border-b border-white/20 w-full"></div>
                )}
                <p className="text-xs text-white/40 font-mono">Signed on: {pdfPlayer.signedAt ? format(new Date(pdfPlayer.signedAt), 'dd MMM yyyy HH:mm') : 'N/A'}</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest font-bold text-white/40">Admin Signature</p>
                {pdfPlayer.adminSignature ? (
                  <>
                    <img src={pdfPlayer.adminSignature} alt="Admin Signature" className="h-24 object-contain bg-white/5 rounded-lg border border-white/10 p-2 w-full" />
                    <p className="text-xs text-white/40 font-mono">Countersigned</p>
                  </>
                ) : (
                  <div className="h-24 border-b border-white/20 w-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
