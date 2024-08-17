'use client';

import React, { useEffect, useState } from 'react';
import RoleCard from '@/app/_components/RoleCard/RoleCard';
import MainMenu from '@/app/_components/MainMenu/MainMenu';
import QuizDrawer from '@/app/_components/QuizDrawer/QuizDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { withAuth } from '@/app/_components/withAuth/withAuth';
import fetchAPI from '@/lib/api';
import { setCharacters } from '@/store/slices/characterSlice';
import { fetchBalance, updateBalance } from '@/lib/balanceApi';
import { RootState, AppDispatch } from '@/store/store';
import { useSession } from 'next-auth/react';
import { useRoleList } from '@/hooks/useRoleList';
import EquipmentPanel from '@/app/_components/EquipmentPanel/EquipmentPanel';
import { GiftButton } from '@/app/_components/GiftButton/GiftButton';

const RoleCardSkeleton: React.FC = () => {
	return (
		<div className="mx-auto w-full max-w-md animate-pulse rounded-lg bg-white px-4 py-2">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex items-end">
					<div className="h-[70px] w-[70px] rounded-full bg-gray-300"></div>
					<div className="ml-[-5px] flex h-[70px] flex-col justify-end gap-2 pb-1">
						<div className="ml-4 h-6 w-24 rounded bg-gray-300"></div>
						<div className="ml-4 h-[5px] w-28 rounded-full bg-gray-300"></div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-[30px] w-[30px] rounded bg-gray-300"></div>
					<div className="h-[30px] w-[30px] rounded bg-gray-300"></div>
					<div className="h-[41px] w-[41px] rounded-full bg-gray-300"></div>
				</div>
			</div>
			<div className="relative h-[210px] w-full rounded-lg bg-gray-300"></div>
		</div>
	);
};

const Roles: React.FC = () => {
	const [isDrawerOpen, setDrawerOpen] = useState(false);
	const [isPanelOpen, setPanelOpen] = useState(false);
	const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
		null,
	);
	const dispatch = useDispatch<AppDispatch>();
	// const balance = useSelector((state: RootState) => state.balance);
	const [balance, setBalance] = useState<{
		diamond: number;
		gold: number;
		energy: number;
	} | null>(null);
	const account = useSelector((state: RootState) => state.accountInfo).account;
	const { characters, error, isLoading, refreshCharacters } = useRoleList();

	const handleOpenDrawer = (characterId: string) => {
		setSelectedCharacterId(characterId);
		setDrawerOpen(true);
	};
	const handleCloseDrawer = () => {
		setDrawerOpen(false);
	};

	const handleClosePanel = () => {
		setPanelOpen(false);
	};

	const handleOpenOutfitPanel = (characterId: string) => {
		setSelectedCharacterId(characterId);
		setPanelOpen(true);
	};

	useEffect(() => {
		const fetchAndSetBalance = async () => {
			if (account && account.id) {
				try {
					// 使用 fetchAPI 获取余额
					const response = await fetchAPI('/api/balance/get', {
						method: 'GET',
						params: { userId: account.id },
					});
					setBalance(response); // 假设 API 返回的对象中有一个 balance 字段
					console.log('balance', response);
				} catch (error) {
					console.error('Failed to fetch balance:', error);
				}
			}
		};

		fetchAndSetBalance();
	}, [account]);

	return (
		<div className="flex h-full flex-col">
			<div className="flex-grow overflow-y-scroll px-4">
				{/* 添加 pb-16 为底部导航腾出空间 */}
				{/* <div className="relative text-center text-xl font-semibold my-4 flex items-center justify-center">
          <p>Chats</p>
          <div className="absolute text-sm font-normal right-4 bg-gray-200 rounded-3xl h-5 flex items-center gap-2 px-2">
            <svg
              width="15"
              height="15"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15ZM14.3853 9.96782C14.6259 8.9652 16.0427 8.93866 16.3207 9.93157L16.8123 11.6875L19.5912 11.2425C20.5483 11.0893 21.1419 12.2509 20.4568 12.9367L18.5435 14.852L20.1439 16.7913C20.8031 17.59 19.9625 18.741 19.001 18.3562L17.0835 17.5886L16.3141 20.4739C16.0458 21.4798 14.6106 21.4573 14.374 20.4435L13.7253 17.6635L11.5979 18.452C10.6271 18.8118 9.81642 17.6401 10.4954 16.8585L12.2439 14.8458L10.2281 12.9342C9.51902 12.2617 10.0962 11.0761 11.0629 11.2194L13.9811 11.652L14.3853 9.96782Z"
                fill="#FFA943"
              />
            </svg>
            {balance.gold}
          </div>
        </div> */}
				<div className="mb-2 mt-4 flex justify-between gap-2">
					<div className="flex w-1/3 justify-center rounded-xl border border-gray-300 py-1">
						<img src={'/img/diamond.png'} width={24} height={24} />
						<div className="ml-2">{balance?.diamond}</div>
					</div>
					<div className="flex w-1/3 justify-center rounded-xl border border-gray-300 py-1">
						<img src={'/img/coin.png'} width={24} height={24} />
						<div className="ml-2">{balance?.gold}</div>
					</div>
					<div className="flex w-1/3 justify-center rounded-xl border border-gray-300 py-1">
						<img src={'/img/energy.png'} width={24} height={24} />
						<div className="ml-2">{balance?.energy}</div>
					</div>
				</div>
				<div>
					{isLoading ? (
						// Display skeletons while loading
						Array.from({ length: 2 }).map((_, index) => (
							<RoleCardSkeleton key={index} />
						))
					) : error ? (
						<div>Error: {error}</div>
					) : (
						characters.map((character, index) => (
							<RoleCard
								key={character.id}
								index={index}
								onOpenQuiz={() => handleOpenDrawer(character.id)}
								onOpenOutfitPanel={() => handleOpenOutfitPanel(character.id)}
								character={character}
								onLevelUp={refreshCharacters}
							/>
						))
					)}
					<QuizDrawer
						isOpen={isDrawerOpen}
						onClose={handleCloseDrawer}
						userCharacterId={selectedCharacterId || ''}
					/>
					<EquipmentPanel
						isOpen={isPanelOpen}
						onClose={handleClosePanel}
						userCharacterId={selectedCharacterId || ''}
					/>
				</div>
			</div>
			<MainMenu />
			<GiftButton />
		</div>
	);
};

export default withAuth(Roles);
