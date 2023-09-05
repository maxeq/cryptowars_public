import React, { useState, useEffect } from 'react';
import { avatarsNftContractConfig } from '@/src/generated';
import { useContractRead } from 'wagmi';
import Image from 'next/image';
import { AvatarImages, AvatarColors, AvatarType } from '@/types/avatarTypes';

type AvatarInfo = {
  id: bigint;
  avatarType: string;
  rarity: string;
  durability: number;
};

type NFTType = {
  address: `0x${string}` | undefined;
};

const NftAvatarList: React.FC<NFTType> = ({ address }) => {
  const [avatars, setAvatars] = useState<AvatarInfo[]>([]);

  if (!address) {
    return null;
  }

  const { data, error, isLoading } = useContractRead({
    address: avatarsNftContractConfig.address[80001],
    abi: avatarsNftContractConfig.abi,
    functionName: 'getAvatarsByOwner',
    args: [address],
    watch: true,
  });

  useEffect(() => {
    if (data) {
      const newAvatars = data.map((avatar) => {
        return {
          id: avatar.id,
          avatarType: avatar.avatarType,
          rarity: avatar.rarity,
          durability: avatar.durability,
        };
      });
      setAvatars(newAvatars);
    }
  }, [data]);

  if (error) {
    console.error('Error during contract write:', error);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (avatars.length === 0) {
    return null;
  }
  return (
    <div>
      <h1 className="text-10">Available avatars</h1>
      <div className="gap-3 flex flex-col items-center justify-between">
        {avatars.map((avatar, index) => (
          <div key={index} className={`flex flex-col place-items-center`}>
            <div
              className="font-bold sm:text-[14px] md:text-[16px] lg:text-[18px]"
              style={{
                color: avatar.avatarType
                  ? AvatarColors.get(avatar.avatarType.toLowerCase() as AvatarType) ?? ''
                  : '',
              }}
            >
              {avatar.avatarType?.toUpperCase()}
            </div>
            <Image
              src={AvatarImages[avatar.avatarType.toLowerCase() as AvatarType]}
              alt={`${avatar.avatarType}`}
              width={116}
              height={116}
            />
            <div className={`${avatar.rarity} rounded-lg px-3`}>{avatar.rarity}</div>
            <div>Durability: {avatar.durability}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NftAvatarList;
