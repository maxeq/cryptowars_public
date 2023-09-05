// components/itemMint.tsx
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { InventoryItemStore } from '@/types/inventoryItem';
import debounce from '@/utils/debounce';
import { Agility, Luck, Stamina, Strength } from '../customSvg';
import { useInventoryStore } from '@/components/store/intenvoryStore';
import { supabase } from '@/utils/supabaseClient';
import useStoreRef, { MyState } from '../store/inventoryRef';
import { useSession, useUser } from '@supabase/auth-helpers-react';

interface ItemMintProps {
  avatarId: string;
  fightId: string;
}

const ItemMint: React.FC<ItemMintProps> = ({ avatarId, fightId }) => {
  const session = useSession();
  const user = useUser();
  const { globalRoundMint } = useInventoryStore();
  const { addInventoryItem, removeInventoryItem } = useInventoryStore();
  const [mintedItems, setOptimisticMintedItems] = useState<InventoryItemStore[]>([]);
  const [isMintItemsVisible, setMintItemsVisible] = useState(false);
  const debouncedPickItem = debounce(pickItem, 100); // Wait 100ms after the last call to execute the function
  const [isPurchasing, setIsPurchasing] = useState(false);

  const excludedButtonRef = useStoreRef((state: MyState) => state.excludedButtonRef);
  const excludedButtonRef2 = useStoreRef((state: MyState) => state.excludedButtonRef2);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shoppingButtonRef = useRef<HTMLDivElement | null>(null);
  const rerollRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        shoppingButtonRef.current &&
        !shoppingButtonRef.current.contains(event.target as Node) &&
        rerollRef.current &&
        !rerollRef.current.contains(event.target as Node) &&
        excludedButtonRef &&
        excludedButtonRef.current &&
        !excludedButtonRef.current.contains(event.target as Node) &&
        excludedButtonRef2 &&
        excludedButtonRef2.current &&
        !excludedButtonRef2.current.contains(event.target as Node)
      ) {
        const clickInsideItem = itemRefs.current.some((ref) => ref?.contains(event.target as Node));
        if (!clickInsideItem) {
          setMintItemsVisible(false);
        }
      }
    };
    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      // Detach the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [itemRefs, shoppingButtonRef, rerollRef, excludedButtonRef, excludedButtonRef2]);

  useEffect(() => {
    if (globalRoundMint || globalRoundMint[avatarId]) {
      async function rerollItems() {
        try {
          if (globalRoundMint && globalRoundMint[avatarId]) {
            const roundMint = await globalRoundMint[avatarId][fightId];
            if (roundMint === true) {
              const confirmedMintedItems = await mintItems2(avatarId, fightId);
              setOptimisticMintedItems(confirmedMintedItems);
              setMintItemsVisible(true);
            }
          }
        } catch (error) {
          alert('Failed to reroll items. Please try again.');
        } finally {
          if (!session || !user) return;
          const res = await fetch('/api/minting/roundMint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ user, fightId, avatarId }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(`Failed to reroll items: ${data.error}`);
          }
        }
      }
      rerollItems();
    }
  }, [globalRoundMint[avatarId][fightId]]);

  async function mintItems(avatarId: string, fightId: string): Promise<InventoryItemStore[]> {
    if (!session) throw new Error('You must be logged in to mint items');

    const response = await fetch('/api/minting/mintItems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ avatarId, fightId, session, user }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to mint items: ${data.error}`);
    }

    return data;
  }

  async function mintItems2(avatarId: string, fightId: string): Promise<InventoryItemStore[]> {
    if (!session) throw new Error('You must be logged in to mint items');
    const response = await fetch('/api/minting/mintItems2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ avatarId, fightId, session, user }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to mint items: ${data.error}`);
    }

    return data;
  }

  // pickItem function is called when the user clicks on an item from the minted items
  async function pickItem(instanceId: string, itemId: string, avatarId: string, fightId: string) {
    if (!session) throw new Error('You must be logged in to pick an item');
    setIsPurchasing(true); // Set isPurchasing to true when a purchase starts
    const response = await fetch('/api/minting/pickItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        instanceId: instanceId,
        itemId: itemId,
        fightId: fightId,
        avatarId: avatarId,
        user,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    const data = await response.json();

    // If the item is an upgrade, we need to remove the old item from the inventory and add the new item
    if ('upgradedItem' in data && 'instanceIdsToDelete' in data) {
      const { upgradedItem, instanceIdsToDelete } = data;
      if (instanceIdsToDelete) {
        // Remove the instanceIdsToDelete items from the inventory
        instanceIdsToDelete.forEach((instanceIdToDelete: string) => {
          removeInventoryItem(avatarId, fightId, instanceIdToDelete);
        });
      }
      // Add the upgradedItem to the inventory
      if (upgradedItem) {
        const upgradedItem = data.upgradedItem[0];
        addInventoryItem(
          avatarId,
          fightId,
          upgradedItem.instanceId,
          upgradedItem.itemId,
          upgradedItem.agility,
          upgradedItem.strength,
          upgradedItem.luck,
          upgradedItem.stamina,
          upgradedItem.itemPrice,
          upgradedItem.itemLevel,
        );
        // Remove the picked item from mintedItems
        setOptimisticMintedItems((prevItems) =>
          prevItems.filter((i) => i.instanceId !== upgradedItem.instanceId),
        );
      }
    } else {
      // If the item is not an upgrade, we just add the item to the inventory
      const [item] = data;
      // Remove the picked item from mintedItems
      setOptimisticMintedItems((prevItems) =>
        prevItems.filter((i) => i.instanceId !== item.instanceId),
      );
      // Add the picked item to the inventory
      addInventoryItem(
        avatarId,
        fightId,
        item.instanceId,
        item.itemId,
        item.agility,
        item.strength,
        item.luck,
        item.stamina,
        item.itemPrice,
        item.itemLevel,
      );
    }
    setIsPurchasing(false); // Set isPurchasing to false when the purchase is complete
  }

  const toggleShop = () => {
    setMintItemsVisible((prevIsMintItemsVisible) => !prevIsMintItemsVisible);
  };

  return (
    <div className="flex justify-center">
      <div className="gap-3 flex flex-col mt-5">
        <div
          ref={shoppingButtonRef}
          onClick={toggleShop}
          style={{
            backgroundImage: 'url(/img/buttons/stash3.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            zIndex: 1000,
            borderRadius: '50%',
          }}
        >
          <p
            className={`${
              isMintItemsVisible ? 'border-for-buttons' : ''
            } sm:text-[14px] md:text-[16px] lg:text-[16px] flex-col pt-5 text-shadow sm:w-[84.15px] sm:h-[84.15px] md:w-[96.17px] md:h-[96.17px] lg:w-[108.19px] lg:h-[108.19px] font-bold flex items-center justify-center  relative cursor-pointer}`}
          ></p>
        </div>

        {isMintItemsVisible && (
          <div
            className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          >
            <div
              className="flex flex-row absolute left-0 right-0 top-0 bottom-0 m-auto justify-center lg:h-[50%] lg:-top-96"
              style={{
                position: 'fixed',
                maxWidth: '70%',
                maxHeight: '90%',
                overflow: 'auto',
                minHeight: '200px',
                zIndex: 1000,
              }}
            >
              <div className="flex items-center flex-col ">
                <div className=" grid grid-cols-3 sm:gap-1 md:gap-1.5 lg:gap-2 xl:gap-3">
                  {mintedItems.map((item, index) => {
                    return (
                      <div
                        key={item.instanceId}
                        ref={(el) => (itemRefs.current[index] = el)}
                        className={`sm:mx-0.5 mx-3 flex flex-col items-center flex-wrap align-middle  rounded  justify-center `}
                      >
                        <div
                          className={`text-shadow ${item.itemQuality}  border-${item.itemQuality} min-w-full min-h-full border justify-between flex flex-col items-center align-middle cursor-pointer hover:shadow-black/80 shadow-md`}
                        >
                          <div
                            className="relative flex items-center burn justify-center"
                            onClick={() => {
                              if (isPurchasing) {
                                alert('Please wait for the previous purchase to finish.');
                              } else {
                                debouncedPickItem(item.instanceId, item.itemId, avatarId, fightId);
                              }
                            }}
                          >
                            <div
                              className={`align-middle justify-between items-center flex border shadow-inner border-black/30`}
                            >
                              <div className="sm:max-w-[78px] md:max-w-none">
                                <Image
                                  className={`p-0.5 shadow-sm shadow-black`}
                                  src={item.image}
                                  title={item.name}
                                  width={200}
                                  height={200}
                                  alt={item.name}
                                />
                              </div>
                              <div
                                className={`w-full mx-auto sm:text-[12px] md:text-[16px] lg:text-[18px] font-bold align-middle justify-end`}
                              >
                                <div className="flex-col flex">
                                  <div className="flex flex-row justify-evenly p-1">
                                    <p className="flex whitespace-normal sm:gap-1 md:gap-1.5">
                                      <Strength
                                        color="black"
                                        size="50"
                                        className="md:min-w-[26px] sm:max-w-[18px] lg:min-w-[22px] xl:max-w-[35px]"
                                      />
                                      {item.strength}
                                    </p>
                                    <p className="flex whitespace-normal sm:gap-1 md:gap-1.5">
                                      <Agility
                                        color="black"
                                        size="50"
                                        className="md:min-w-[26px] sm:max-w-[18px] lg:min-w-[22px] xl:max-w-[35px]"
                                      />
                                      {item.agility}
                                    </p>
                                  </div>
                                  <div className="flex flex-row justify-evenly ">
                                    <p className="flex whitespace-normal sm:gap-1 md:gap-1.5">
                                      <Luck
                                        color="black"
                                        size="50"
                                        className="md:min-w-[26px] sm:max-w-[18px] lg:min-w-[22px] xl:max-w-[35px]"
                                      />
                                      {item.luck}
                                    </p>
                                    <p className="flex whitespace-normal sm:gap-1 md:gap-1.5">
                                      <Stamina
                                        color="black"
                                        size="50"
                                        className="md:min-w-[26px] sm:max-w-[18px] lg:min-w-[22px] xl:max-w-[35px]"
                                      />
                                      {item.stamina}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`${item.itemQuality}border border-${item.itemQuality} shadow-inner p-1.5 whitespace-nowrap flex flex-row w-full sm:text-[12px] md:text-[15px] lg:text-[16px] font-bold align-middle justify-evenly`}
                          >
                            <p className="flex-auto text-cut-off">{item.name}</p>
                            <p className="whitespace flex sm:gap-0.5 md:gap-1">
                              <Image
                                src="/img/buttons/gold.png"
                                alt="Gold Icon"
                                width={14}
                                height={14}
                                style={{ objectFit: 'contain' }}
                                className="pulse"
                              />
                              {item.itemPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  ref={rerollRef}
                  className="active:bg-[#32E215] mt-2 sm:h-10 md:h-12 lg:h-14 xl:h-16 sm:text-[16px] md:text-[18px] lg:text-[20px] text-shadow font-bold flex items-center justify-center relative cursor-pointer"
                  onClick={async () => {
                    // Optimistic UI: Pre-generate the new items immediately
                    //setMintItemsVisible(true);
                    try {
                      const confirmedMintedItems = await mintItems(avatarId, fightId);
                      // If the re-roll operation was successful, update the actual mintedItems state with the confirmed items
                      setOptimisticMintedItems(confirmedMintedItems);
                    } catch (error) {
                      // If the re-roll operation failed, we revert the state to its previous state
                      alert(`${error}`);
                    }
                  }}
                >
                  Re-Roll Items For
                  <p className="ml-3 font-normal col-row flex sm:gap-1 md:gap-1 lg:gap-2 sm:text-[16px] md:text-[18px] lg:text-[20px] ">
                    <Image
                      src="/img/buttons/gold.png"
                      alt="Gold Icon"
                      className="sm:max-w-[16px] md:max-w-[18px] lg:max-w-[20px] shadow-md"
                      width={20}
                      height={20}
                      style={{ objectFit: 'contain' }}
                    />
                    2
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ItemMint);
