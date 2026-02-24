import SchatzkarteLandingCombined from './SchatzkarteLanding_Combined';

interface LandingPageV5Props {
  onClose: () => void;
  onGuestMode?: () => void;
}

const LandingPageV5 = ({ onClose, onGuestMode }: LandingPageV5Props) => {
  // onClose = go_to_map (normaler Login-Flow auf der Schatzkarte)
  // onGuestMode = start_preview (Demo ohne Login)
  return <SchatzkarteLandingCombined onGoToMap={onClose} onGuestMode={onGuestMode || onClose} />;
};

export { LandingPageV5 };
export default LandingPageV5;
