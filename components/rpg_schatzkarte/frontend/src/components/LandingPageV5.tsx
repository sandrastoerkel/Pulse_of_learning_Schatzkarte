import SchatzkarteLandingCombined from './SchatzkarteLanding_Combined';

interface LandingPageV5Props {
  onClose: () => void;
  onGuestMode?: () => void;
}

const LandingPageV5 = ({ onClose, onGuestMode }: LandingPageV5Props) => {
  // SchatzkarteLandingCombined hat Toggle zwischen Schüler- und Elternversion
  // onGuestMode wird für "Demo ansehen" Button verwendet
  return <SchatzkarteLandingCombined onGuestMode={onGuestMode || onClose} />;
};

export { LandingPageV5 };
export default LandingPageV5;
