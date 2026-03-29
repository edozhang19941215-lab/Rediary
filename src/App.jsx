import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import DiaryScreen from './components/DiaryScreen';
import GrowthScreen from './components/GrowthScreen';
import PetVisit from './components/PetVisit';
import { PETS, getTodaysPet } from './data/pets';
import { getEntries, getTodayVisitStatus, setVisitDismissed } from './utils/storage';

const PET_IDS = Object.keys(PETS);

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [activePetId, setActivePetId] = useState(null);
  const [activeStationery, setActiveStationery] = useState('lined');
  const [showVisit, setShowVisit] = useState(false);

  // Pet shown in PetVisit overlay (cycles with 换一只)
  const [visitPetIndex, setVisitPetIndex] = useState(() => {
    const idx = PET_IDS.indexOf(getTodaysPet().id);
    return idx >= 0 ? idx : 0;
  });

  // Pet shown in HomeScreen card (independent cycle)
  const [homePetIndex, setHomePetIndex] = useState(() => {
    const idx = PET_IDS.indexOf(getTodaysPet().id);
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    setTimeout(() => {
      setScreen('home');
      // Auto-show PetVisit on first daily launch
      const visitStatus = getTodayVisitStatus();
      if (!visitStatus.dismissed) {
        setTimeout(() => setShowVisit(true), 800);
      }
    }, 300);
  }, []);

  const visitPet = PETS[PET_IDS[visitPetIndex]];
  const homePet = PETS[PET_IDS[homePetIndex]];

  // Called from ✏️ button or HomeScreen — always shows PetVisit first
  const handleShowVisit = () => setShowVisit(true);

  // Called from PetVisit "开始写日记"
  const handleVisitStart = (stationeryId) => {
    const entryId = Date.now().toString();
    setActiveEntryId(entryId);
    setActivePetId(visitPet.id);
    setActiveStationery(stationeryId || 'lined');
    setShowVisit(false);
    setScreen('diary');
  };

  // Called from entry card tap — go directly to existing diary
  const handleOpenEntry = (entryId) => {
    const entries = getEntries();
    const entry = entries.find(e => e.id === entryId);
    setActiveEntryId(entryId);
    setActivePetId(entry?.petId || getTodaysPet().id);
    setActiveStationery(entry?.stationeryId || 'lined');
    setScreen('diary');
  };

  const handleBack = () => {
    setScreen('home');
    setActiveEntryId(null);
  };

  // "换一只" in PetVisit overlay
  const handleSwitchVisitPet = () => {
    setVisitPetIndex(prev => (prev + 1) % PET_IDS.length);
  };

  // "换一只" in HomeScreen card
  const handleSwitchHomePet = () => {
    setHomePetIndex(prev => (prev + 1) % PET_IDS.length);
  };

  const handleVisitDismiss = () => {
    setVisitDismissed();
    setShowVisit(false);
  };

  if (screen === 'loading') {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--cream)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 52, animation: 'bounce-in 0.6s ease both' }}>📔</div>
        <div style={{
          fontFamily: 'var(--font-hand)', fontSize: 28,
          color: 'var(--ink)', letterSpacing: 4,
          animation: 'fade-in 0.6s ease 0.3s both',
        }}>陪陪记</div>
      </div>
    );
  }

  if (screen === 'diary' && activeEntryId) {
    return (
      <DiaryScreen
        entryId={activeEntryId}
        petId={activePetId}
        stationeryId={activeStationery}
        onBack={handleBack}
      />
    );
  }

  if (screen === 'growth') {
    return <GrowthScreen onBack={() => setScreen('home')} />;
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <HomeScreen
        homePet={homePet}
        onSwitchPet={handleSwitchHomePet}
        onNewEntry={handleShowVisit}
        onOpenEntry={handleOpenEntry}
        onGrowth={() => setScreen('growth')}
      />
      {showVisit && (
        <PetVisit
          key={visitPet.id}
          pet={visitPet}
          onDismiss={handleVisitDismiss}
          onStartDiary={handleVisitStart}
          onSwitchPet={handleSwitchVisitPet}
        />
      )}
    </div>
  );
}
