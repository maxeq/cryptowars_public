import { AvatarImages, AvatarType, AvatarColors } from '@/types/avatarTypes';
import { Database } from '@/types/supabase';
import { useState } from 'react';
import Image from 'next/image';
import { useAvatarsContext } from '@/context/avatarContext';
import { useUser } from '@supabase/auth-helpers-react';
import { getAvatar } from '@/utils/getAvatars';
import router from 'next/router';

type AvatarRow = Database['public']['Tables']['avatars2']['Row'];

interface AvatarListProps {
  session: any;
}
const getRandomAvatarType = (): AvatarType => {
  const avatarTypes = Object.values(AvatarType);
  const randomIndex = Math.floor(Math.random() * avatarTypes.length);
  return avatarTypes[randomIndex];
};

const MintAvatar: React.FC<AvatarListProps> = ({ session }) => {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [mintedNow, setMintedNow] = useState<AvatarRow[]>([]);
  const { setAvatar, setAvatars } = useAvatarsContext();
  const [lastMintedAvatar, setLastMintedAvatar] = useState<AvatarType | null>(null);

  const mintAvatar = async () => {
    if (!user || !session) return;
    setLoading(true);

    if (loading) {
      return alert('Please wait until the previous transaction is completed!');
    }

    try {
      const newAvatarType = getRandomAvatarType();
      const res = await fetch('/api/account/insertAvatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user, newAvatarType }),
      });

      const data = await res.json();

      const dataAvatars = await getAvatar({ session, user });

      setAvatars(dataAvatars.avatars);
      if (res.ok) {
        setMintedNow(data);
        setAvatar(data[0]);
        setLastMintedAvatar(newAvatarType);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-3 text-shadow">
      <div className="flex flex-col justify-center w-full">
        {!lastMintedAvatar ? (
          <button className="px-8 py-2 mx-20" onClick={mintAvatar}>
            Mint New Avatar
          </button>
        ) : (
          <button
            onClick={() => {
              router.push('/pvp');
            }}
          >
            Proceed to Fight
          </button>
        )}
      </div>
      <div className=" w-full flex">
        {mintedNow && (
          <div className="flex justify-center w-full">
            <ul>
              {mintedNow.map((avatar) => (
                <li key={avatar.userId}>
                  <div className="text-lime-500 justify-center flex whitespace-nowrap">
                    Congratulations! Avatar of
                    <span
                      className="font-bold sm:text-[14px] md:text-[16px] lg:text-[18px] mx-1"
                      style={{
                        color: AvatarColors.get(avatar.type as AvatarType) ?? '',
                      }}
                    >
                      {avatar.type.toUpperCase()}
                    </span>
                    minted!
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="burn h-full sm:w-[90%] lg:w-[80%] flex justify-center items-center w-full">
        {lastMintedAvatar && (
          <Image
            src={AvatarImages[lastMintedAvatar.toLowerCase() as keyof typeof AvatarImages]}
            alt={lastMintedAvatar}
            width={160}
            height={380}
          />
        )}
      </div>
    </div>
  );
};

export default MintAvatar;
