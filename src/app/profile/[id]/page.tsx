'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
	User,
	Settings,
	Gift,
	MessageCircle,
	AlignJustify,
	UserCircle2,
} from 'lucide-react';
import { COIN_SVG } from '../../../assets/icon/coin.svg';
import InviteDrawer from '@/app/_components/InviteDrawer/InviteDrawer';
import SignInDrawer from '@/app/_components/SignInDrawer/SignInDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { withAuth } from '@/app/_components/withAuth/withAuth';
import { fetchBalance } from '@/lib/balanceApi';
import { useUserEquipment } from '@/hooks/useUserEquipment';
import { useUserStory } from '@/hooks/useUserStory';
import SlideComponent from '@/app/_components/SlideComponents/SlideCompnents';
import EquipmentCard from '@/app/_components/EquipmentCard/EquipmentCard';
import StoryCard from '@/app/_components/StoryCard/StoryCard';
import MainMenu from '@/app/_components/MainMenu/MainMenu';
import { GiftButton } from '@/app/_components/GiftButton/GiftButton';

const MinePage = () => {
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [showSignInDrawer, setShowSignInDrawer] = useState<boolean>(false);
	const [signInDays, setSignInDays] = useState<boolean[]>([
		false,
		false,
		false,
		false,
		false,
		false,
		false,
	]);
	const account = useSelector((state: RootState) => state.accountInfo.account);
	const dispatch = useDispatch<AppDispatch>();
	const balance = useSelector((state: RootState) => state.balance);
	const {
		data: equipmentData,
		error: equipmentError,
		isLoading: isEquipmentLoading,
	} = useUserEquipment(account?.id!);
	const {
		data: storyData,
		error: storyError,
		isLoading: isStoryLoading,
	} = useUserStory(account?.id!);

	const handleOpenSignInDrawer = (p0: boolean) => {
		setShowSignInDrawer(true);
	};

	const handleCloseSignInDrawer = () => {
		setShowSignInDrawer(false);
	};

	const handleSignIn = () => {
		setSignInDays(prevDays => {
			const newDays = [...prevDays];
			const today = new Date().getDay();
			newDays[today] = true;
			return newDays;
		});
		setShowSignInDrawer(false);
	};

	useEffect(() => {
		if (account && account.id) {
			dispatch(fetchBalance(account?.id));
		}
	}, [dispatch, account]);

	useEffect(() => {}, []);

	return (
		<div className="flex h-full flex-col">
			<div className="flex-grow overflow-x-hidden overflow-y-scroll">
				<div className="pt-8 text-center text-sm font-extrabold">Mine</div>
				<div className="mt-6 flex items-center justify-between px-4">
					<div className="flex items-center">
						<div className="h-16 w-16 rounded-full bg-gray-300"></div>
						<div className="ml-4">
							<div className="text-lg font-semibold">
								{account?.id?.slice(0, 8)}...
							</div>
						</div>
					</div>
					<Settings className="h-6 w-6 text-gray-600" />
				</div>
				<div className="mx-4 mt-4 flex h-32 justify-between rounded-xl bg-custom-purple-005 p-4 text-white">
					<div className="w-full">
						<div className="text-md text-center font-light">Token Balance</div>
						<div className="mt-5 flex w-full items-center justify-between">
							<div className="flex items-center gap-3">
								<img src={COIN_SVG} width={53} height={53} alt="coin" />
								<div className="text-4xl font-bold">{balance.gold}</div>
							</div>
							<button className="rounded-full bg-custom-yellow-005 px-4 py-2 font-light text-white shadow-lg">
								Top Up
							</button>
						</div>
					</div>
				</div>
				<div
					className="mx-4 mt-2 flex cursor-pointer items-center justify-between rounded-full bg-custom-purple-001 p-4 text-gray-800"
					onClick={() => setIsInviteOpen(true)}
				>
					<div>Invite friends to gain tokens</div>
					<div className="h-6 w-6 text-gray-400">{'>'}</div>
				</div>
				<div
					className="mx-4 mt-2 flex cursor-pointer items-center justify-between rounded-full bg-custom-purple-001 p-4 text-gray-800"
					onClick={() => {
						handleOpenSignInDrawer(true);
					}}
				>
					<div>Get tokens by daily check-in</div>
					<div className="h-6 w-6 text-gray-400">{'>'}</div>
				</div>
				<InviteDrawer
					isOpen={isInviteOpen}
					code={account?.invitationCode!}
					onClose={() => setIsInviteOpen(false)}
					inviterDisplay={account?.inviterDisplay ? 'A' : ''}
					userId={account?.id!}
				/>
				{account && showSignInDrawer && (
					<SignInDrawer
						onClose={handleCloseSignInDrawer}
						userId={account?.id!}
					/>
				)}
			</div>
			<MainMenu />
			<GiftButton />
		</div>
	);
};

export default withAuth(MinePage);
