// import React, { useState, useEffect } from 'react';
// import { ensRegistryConfig } from '@/src/generated';
// import { useAccount, useContractWrite, usePrepareContractWrite, useContractRead } from 'wagmi';
// import Image from 'next/image';

// type BoxType = 'Bronze Box' | 'Silver Box' | 'Gold Box';

// type BoxInfo = {
//   id: bigint;
//   type: BoxType;
// };

// type NFTType = {
//   address: `0x${string}` | undefined;
// };

// const PurchasedBoxes: React.FC<NFTType> = ({ address }) => {
//   const [boxes, setBoxes] = useState<BoxInfo[]>([]);
//   const [tokenIdToUnbox, setTokenIdToUnbox] = useState<bigint | null>(null);

//   if (!address) {
//     return null;
//   }

//   const boxImageMapping = {
//     'Bronze Box': '/img/boxes/bronze_box.png',
//     'Silver Box': '/img/boxes/silver_box.png',
//     'Gold Box': '/img/boxes/gold_box.png',
//   };

//   const { data, error, isLoading } = useContractRead({
//     address: ensRegistryConfig.address[80001],
//     abi: ensRegistryConfig.abi,
//     functionName: 'getAvatarsByOwner',
//     args: [address],
//     watch: true,
//   });

//   useEffect(() => {
//     if (data) {
//       const boxIds: bigint[] = Array.from(data[0]);
//       const boxTypesArray: BoxType[] = data[1] as BoxType[];
//       const combinedBoxes: BoxInfo[] = boxIds.map((id, index) => ({
//         id: id,
//         type: boxTypesArray[index],
//       }));
//       setBoxes(combinedBoxes);
//     }
//   }, [data]);

//   const { config } = usePrepareContractWrite({
//     address: ensRegistryConfig.address[80001],
//     abi: ensRegistryConfig.abi,
//     functionName: 'unbox',
//     args: tokenIdToUnbox ? [tokenIdToUnbox] : undefined,
//     enabled: Boolean(tokenIdToUnbox),
//   });

//   const {
//     write,
//     isLoading: isLoadingContractWrite,
//     error: errorContractWrite,
//   } = useContractWrite(config);

//   function handleUnbox(id: bigint): void {
//     setTokenIdToUnbox(id);
//     if (write) {
//       write();
//     }
//   }

//   if (error) {
//     console.error('Error during contract write:', error);
//   }

//   return (
//     <div className="gap-3 grid">
//       <h1>Your Purchased Boxes</h1>
//       {boxes.map((box, index) => (
//         <div key={index} className="grid grid-col-1 place-items-center">
//           <Image src={boxImageMapping[box.type]} alt={`${box.type}`} width={116} height={116} />
//           <div>ID: {box.id.toString()}</div>
//           <button onClick={() => handleUnbox(box.id)} disabled={isLoading}>
//             {isLoading ? 'Processing...' : `Unbox ${box.type}`}
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PurchasedBoxes;
