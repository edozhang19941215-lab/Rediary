import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import DiaryScreen from './components/DiaryScreen';
import GrowthScreen from './components/GrowthScreen';
import PetVisit from './components/PetVisit';
import { PETS, getTodaysPet } from './data/pets';
import { getEntries, getTodayVisitStatus, setVisitDismissed, seedIfEmpty } from './utils/storage';

const PET_IDS = Object.keys(PETS);

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [activePetId, setActivePetId] = useState(null);
  const [activeStationery, setActiveStationery] = useState('lined');
  const [showVisit, setShowVisit] = useState(false);
  const [splashOut, setSplashOut] = useState(false);

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
    seedIfEmpty(); // populate mock data on first launch
    const fadeTimer = setTimeout(() => setSplashOut(true), 300);
    const switchTimer = setTimeout(() => {
      setScreen('home');
      const visitStatus = getTodayVisitStatus();
      if (!visitStatus.dismissed) {
        setTimeout(() => setShowVisit(true), 800);
      }
    }, 1300);
    return () => { clearTimeout(fadeTimer); clearTimeout(switchTimer); };
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
        height: '100%', position: 'relative', overflow: 'hidden',
        opacity: splashOut ? 0 : 1,
        transition: 'opacity 1s ease',
      }}>
        <img
          src="/splash.png"
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
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
