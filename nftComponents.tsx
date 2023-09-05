import { useAccount } from 'wagmi';
import { MetaConnect } from '../buttons/metaConnect';
import NftAvatarList from './nftAvatarList';
import EventListener from './eventListener';
import BuyBox from '@/components/minting/buyBoxNft';

const NftComponent: React.FC = () => {
  const { address } = useAccount();

  if (!address) {
    return <MetaConnect />;
  }

  return (
    <div>
      <MetaConnect />
      <BuyBox />
      <NftAvatarList address={address} />
      <EventListener />
    </div>
  );
};

export default NftComponent;
