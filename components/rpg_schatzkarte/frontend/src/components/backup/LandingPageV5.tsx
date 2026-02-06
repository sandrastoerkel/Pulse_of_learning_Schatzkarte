import LandingVersionErgebnis from './LandingVersionErgebnis';

interface LandingPageProps {
  onClose: () => void;
  onGuestMode?: () => void;
}

const LandingPageV5 = ({ onClose, onGuestMode }: LandingPageProps) => {
  return <LandingVersionErgebnis onClose={onClose} onGuestMode={onGuestMode} />;
};

export { LandingPageV5 };
export default LandingPageV5;
