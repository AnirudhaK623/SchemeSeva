import React, { useState } from 'react';
import { Scheme, ControllerStatusResponse } from '../../types/orchestrator.js';
import {
  Languages,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle
} from 'lucide-react';

interface LanguageExplanationPageProps {
  scheme: Scheme | null;
  status: ControllerStatusResponse | null;
}

export const LanguageExplanationPage: React.FC<LanguageExplanationPageProps> = ({
  scheme,
  status
}) => {
  const [selectedLang, setSelectedLang] = useState<'English' | 'Kannada' | 'Hindi' | 'Malayalam'>('Kannada');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Live Agent 6 telemetry
  const explanationAgent = status?.active_workflows?.[0]?.agents?.['explanation_agent'];
  const wfResults = status?.active_workflows?.[0]?.results;

  const currentSchemeName = scheme ? scheme.name : 'PM Kisan Samman Nidhi';

  const explanations = {
    English: {
      headline: `Comprehensive Citizen Guide for ${currentSchemeName}`,
      summary: `This central government initiative directly transfers ₹6,000 annually in three equal installments of ₹2,000 into the bank accounts of eligible landholding farmers via Direct Benefit Transfer (DBT).`,
      benefits: `Financial stability support of ₹6,000 per year directly credited to Aadhaar-linked savings accounts to assist with agricultural input purchases like seeds, fertilizers, and equipment.`,
      next_steps: `1. Ensure Aadhaar is linked to your bank account with NPCI mapping enabled.\n2. Complete mandatory e-KYC on the PM-Kisan portal via OTP or biometric CSC centers.\n3. Verify that your land record (RTC / Pahani) details match your Aadhaar name exactly.`,
      warning: `Beware of unauthorized third-party agents asking for application processing fees. Government scheme portal registrations are completely free of charge.`
    },
    Kannada: {
      headline: `${currentSchemeName} ವಿವರ ಮತ್ತು ಮಾರ್ಗದರ್ಶಿ`,
      summary: `ಈ ಯೋಜನೆಯಡಿ ಅರ್ಹ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕವಾಗಿ ₹6,000 ಆರ್ಥಿಕ ಸಹಾಯವನ್ನು ಮೂರು ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ (ಪ್ರತಿ ಕಂತಿಗೆ ₹2,000) ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮಾ ಮಾಡಲಾಗುತ್ತದೆ (DBT ಮೂಲಕ).`,
      benefits: `ಬೀಜ, ರಸಗೊಬ್ಬರ ಮತ್ತು ಕೃಷಿ ವೆಚ್ಚಗಳಿಗೆ ನೇರ ನಗದು ಸಹಾಯ. ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಆಧಾರ್ ಜೋಡಿತ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಹಣ ಸಂದಾಯವಾಗುತ್ತದೆ.`,
      next_steps: `1. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಲಿಂಕ್ ಮತ್ತು NPCI ಮ್ಯಾಪಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.\n2. PM-ಕಿಸಾನ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ OTP ಅಥವಾ ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರದ ಮೂಲಕ e-KYC ಪೂರ್ಣಗೊಳಿಸಿ.\n3. ಪಹಣಿ (RTC) ವಿವರಗಳಲ್ಲಿ ಹೆಸರು ಆಧಾರ್ ಕಾರ್ಡ್‌ನಂತೆಯೇ ಇರಬೇಕು.`,
      warning: `ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳಿಗೆ ಹಣ ನೀಡಬೇಡಿ. ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಣಿ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿದೆ.`
    },
    Hindi: {
      headline: `${currentSchemeName} की संपूर्ण जानकारी एवं दिशानिर्देश`,
      summary: `इस योजना के तहत पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता तीन समान किस्तों में (प्रत्येक ₹2,000) प्रत्यक्ष लाभ अंतरण (DBT) के माध्यम से बैंक खाते में दी जाती है।`,
      benefits: `कृषि आदानों (बीज, खाद, सिंचाई) की खरीद हेतु वित्तीय संबल। सीधे आधार लिंक बैंक खाते में राशि का अंतरण।`,
      next_steps: `1. सुनिश्चित करें कि आपका बैंक खाता आधार से जुड़ा हुआ है एवं NPCI मैपिंग सक्रिय है।\n2. PM-किसान पोर्टल या नजदीकी CSC केंद्र पर जाकर बायोमेट्रिक e-KYC पूरा करें।\n3. सुनिश्चित करें कि भूमि रिकॉर्ड (खतौनी/भूलेख) में आपका नाम आधार कार्ड से मेल खाता है।`,
      warning: `किसी भी अनधिकृत व्यक्ति को आवेदन शुल्क न दें। सरकारी पोर्टल पर पंजीकरण पूर्णतः निःशुल्क है।`
    },
    Malayalam: {
      headline: `${currentSchemeName} വിശദവിവരങ്ങളും മാർഗ്ഗനിർദ്ദേശങ്ങളും`,
      summary: `അർഹരായ കർഷക കുടുംബങ്ങൾക്ക് പ്രതിവർഷം ₹6,000 ധനസഹായം മൂന്ന് തുല്യ ഗഡുക്കളായി (ഓരോന്നിനും ₹2,000) നേരിട്ട് ബാങ്ക് അക്കൗണ്ടിലേക്ക് (DBT) ലഭ്യമാക്കുന്ന കേന്ദ്ര സർക്കാർ പദ്ധതിയാണിത്.`,
      benefits: `വിത്ത്, വളം, മറ്റ് കാർഷിക ആവശ്യങ്ങൾ എന്നിവയ്ക്കുള്ള സാമ്പത്തിക സഹായം. ഇടനിലക്കാരില്ലാതെ തുക നേരിട്ട് കർഷകരുടെ അക്കൗണ്ടിലെത്തുന്നു.`,
      next_steps: `1. ബാങ്ക് അക്കൗണ്ട് ആധാറുമായി ബന്ധിപ്പിച്ചിട്ടുണ്ടെന്നും NPCI മാപ്പിംഗ് സജീവമാണെന്നും ഉറപ്പാക്കുക.\n2. പോർട്ടൽ വഴി നിർബന്ധിത e-KYC നടപടികൾ പൂർത്തിയാക്കുക.\n3. ഭൂമി സംബന്ധമായ രേഖകളിലെ പേര് ആധാറിലെ പേരുമായി പൊരുത്തപ്പെടുന്നുണ്ടെന്ന് ഉറപ്പുവരുത്തുക.`,
      warning: `അപേക്ഷ സമർപ്പിക്കുന്നതിന് ആർക്കും പണം നൽകേണ്ടതില്ല. ഔദ്യോഗിക വെബ്സൈറ്റ് വഴിയുള്ള രജിസ്ട്രേഷൻ തികച്ചും സൗജന്യമാണ്.`
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        const textToSpeak = `${explanations[selectedLang].headline}. ${explanations[selectedLang].summary}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 4000);
      }
    }
  };

  const content = explanations[selectedLang];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Live Agent 6 Telemetry Banner */}
      {explanationAgent && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-sky-400">Agent 6: Local Language Explanation Agent Live</span>
              <p className="text-xs text-slate-300 mt-0.5">{explanationAgent.current_task}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">Tool: <b className="text-sky-300">{explanationAgent.current_resource || 'None'}</b></span>
            <span className="text-slate-400">Predicted Next: <b className="text-purple-300">{explanationAgent.predicted_next_resource || 'None'}</b></span>
          </div>
        </div>
      )}

      {/* Main Vernacular Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl">
        {/* Language Selection Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base text-slate-100">Vernacular AI Citizen Explanation</h3>
              <p className="text-xs text-slate-400">Natural language localized guidance tailored for Indian citizens</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {(['Kannada', 'Hindi', 'Malayalam', 'English'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLang(lang);
                  if (isPlayingAudio) {
                    window.speechSynthesis?.cancel();
                    setIsPlayingAudio(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLang === lang
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Read-aloud Action Bar */}
        <div className="flex items-center justify-between bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Stop Voice Audio' : `Read Aloud in ${selectedLang}`}</span>
            </button>
            {isPlayingAudio && (
              <div className="flex items-center space-x-1 text-sky-400 text-xs font-mono">
                <span className="w-1 h-3 bg-sky-400 animate-bounce" />
                <span className="w-1 h-5 bg-sky-400 animate-bounce delay-75" />
                <span className="w-1 h-2 bg-sky-400 animate-bounce delay-150" />
                <span className="text-[11px] text-slate-300 ml-1">Streaming audio synth...</span>
              </div>
            )}
          </div>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            A3 Pipeline: translation_model → llm
          </span>
        </div>

        {/* Localized Content Cards */}
        <div className="space-y-4 text-sm leading-relaxed">
          {/* Headline & Overview */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <h4 className="font-bold text-base text-sky-300 mb-2">{content.headline}</h4>
            <p className="text-slate-200">{content.summary}</p>
          </div>

          {/* Key Benefits */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Scheme Benefits</span>
            </h5>
            <p className="text-slate-300 text-xs">{content.benefits}</p>
          </div>

          {/* Next Steps */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Step-by-Step Action Plan</span>
            </h5>
            <div className="text-xs text-slate-300 whitespace-pre-line space-y-1">
              {content.next_steps}
            </div>
          </div>

          {/* Important Warning */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Citizen Advisory / Anti-Fraud Alert
              </h5>
              <p className="text-xs text-slate-300 mt-1">{content.warning}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
