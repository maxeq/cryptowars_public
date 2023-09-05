import React, { useState } from 'react';
import { useAccount, useContractEvent } from 'wagmi';
import { MetaConnect } from '../buttons/metaConnect';
import { boxSalesContractConfig } from '@/src/generated';
import { AvatarImages, AvatarColors, AvatarType } from '@/types/avatarTypes';
import Image from 'next/image';

const EventListener: React.FC = () => {
  const { address } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [boxType, setBoxType] = useState<string>('Unknown');
  const [avatarId, setAvatarId] = useState<string>('Unknown');
  const [tokenAmount, setTokenAmount] = useState<string>('Unknown');
  const [avatarType, setAvatarType] = useState<string>('Unknown');
  const [rarity, setRarity] = useState<string>('Unknown');
  const [durability, setDurability] = useState<string>('Unknown');

  if (!address) {
    return <MetaConnect />;
  }

  useContractEvent({
    address: boxSalesContractConfig.address[80001],
    abi: boxSalesContractConfig.abi,
    eventName: 'BoxUnboxed',
    listener(log) {
      console.log({ log });

      // Extracting details from the log
      setAvatarId(log[0]?.args?.avatarId?.toString() ?? 'Unknown');
      setTokenAmount(log[0]?.args?.tokenAmount?.toString() ?? 'Unknown');
      const boxTypeValue = log[0]?.args?.boxType;
      const boxTypeName =
        boxTypeValue === 0
          ? 'Bronze'
          : boxTypeValue === 1
          ? 'Silver'
          : boxTypeValue === 2
          ? 'Gold'
          : 'Unknown';
      setBoxType(boxTypeName);
      setAvatarType(log[0]?.args?.avatarType ?? 'Unknown');
      setRarity(log[0]?.args?.rarity ?? 'Unknown');
      setDurability(log[0]?.args?.durability?.toString() ?? 'Unknown');

      // Show the modal with the extracted details
      setShowModal(true);
    },
  });

  return (
    <div>
      {showModal && (
        <MintedModal
          boxType={boxType}
          avatarId={avatarId}
          tokenAmount={tokenAmount}
          avatarType={avatarType}
          rarity={rarity}
          durability={durability}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

type MintedModalProps = {
  boxType: string;
  avatarId: string;
  tokenAmount: string;
  avatarType: string;
  rarity: string;
  durability: string;
  onClose: () => void;
};

const MintedModal: React.FC<MintedModalProps> = ({
  boxType,
  avatarId,
  tokenAmount,
  avatarType,
  rarity,
  durability,
  onClose,
}) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center min-h-screen">
      <div
        className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity "
        aria-hidden="true"
        onClick={onClose} // Close modal when background is clicked
      ></div>
      <div className="border relative z-20 rounded-lg p-4 max-w-md mx-auto w-full items-center justify-center flex flex-col">
        <h2 className={`text-xl font-bold mb-4 ${rarity} rounded-xl p-5`}>
          Congratulations on your new Avatar!
        </h2>
        <p>
          You have unboxed a <strong>{boxType}</strong> box.
        </p>
        <p>
          GameToken received: <strong>{tokenAmount}</strong>
        </p>
        <div
          className="font-bold sm:text-[14px] md:text-[16px] lg:text-[18px]"
          style={{
            color: AvatarColors.get(avatarType.toLowerCase() as AvatarType) ?? '',
          }}
        >
          {avatarType.toUpperCase()}
        </div>
        <div>
          <Image
            src={AvatarImages[avatarType.toLowerCase() as AvatarType]}
            alt={`${avatarType}`}
            width={116}
            height={116}
          />
        </div>
        <div className={`${rarity} rounded-lg px-3`}>{rarity}</div>
        <div>Durability: {durability}</div>
        <button className="text-white font-bold py-2 px-4 rounded mt-4" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default EventListener;
