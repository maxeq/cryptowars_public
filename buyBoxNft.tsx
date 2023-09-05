import React from 'react';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { boxSalesContractConfig } from '@/src/generated';
import Image from 'next/image';

const etherToWei = (ether: string) => {
  const weiString = (parseFloat(ether) * 10 ** 18).toString();
  return BigInt(weiString);
};

const weiToEther = (wei: BigInt) => {
  return (Number(wei) / 10 ** 18).toString();
};
const BuyBox: React.FC = () => {
  const boxTypes = [
    { type: 'Bronze', args: [0] as const, value: etherToWei('0.01') },
    { type: 'Silver', args: [1] as const, value: etherToWei('0.05') },
    { type: 'Gold', args: [2] as const, value: etherToWei('0.1') },
  ];

  const boxes = boxTypes.map((box) => {
    const {
      config,
      error: prepareError,
      isError: isPrepareError,
    } = usePrepareContractWrite({
      address: boxSalesContractConfig.address[80001],
      abi: boxSalesContractConfig.abi,
      functionName: 'buyBox',
      args: box.args,
      value: box.value,
    });

    const {
      write,
      data,
      isError,
      error,
      isLoading: metamaskLoading,
    } = useContractWrite({
      ...config,
      onError: (error) => {
        console.log(`Error buying ${box.type} box:`, error);
      },
    });

    const { isLoading: transactionLoading, isSuccess } = useWaitForTransaction({
      hash: data?.hash,
    });

    return {
      ...box,
      write,
      data,
      metamaskLoading,
      transactionLoading,
      isSuccess,
      error,
      prepareError,
      isPrepareError,
      isError,
    };
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 justify-center items-center">
        {boxes.map((box) => (
          <div
            key={box.type}
            className="py-5 flex flex-col items-center gap-3 justify-between px-5"
          >
            <Image
              src={`/img/boxes/${box.type}_box.png`.toLowerCase()}
              alt={box.type}
              width={116}
              height={116}
            />
            <span>{`${weiToEther(box.value)} MATIC`}</span>
            <button disabled={!box.write} onClick={box.write}>
              {box.transactionLoading ? `Buying ${box.type} Box...` : `Buy ${box.type} Box`}
            </button>
            <div className="flex h-16">
              {box.metamaskLoading && <div>Opening Metamask</div>}
              {box.isSuccess && (
                <div>
                  <p className="text-lime-400">Success!</p>
                  <p>
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${box.data?.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400"
                    >
                      Click to see
                    </a>
                  </p>
                </div>
              )}
              <div className="text-red-500">
                {(box.isPrepareError || box.isError) && (
                  <div>Error: {(box.prepareError || box.error)?.message.split('.')[0] + '.'}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(BuyBox);
