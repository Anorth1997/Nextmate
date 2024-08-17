'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	useEffect(() => {
		const startRest = async () => {
			await fetch('/api/energy/start', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({}),
			});
		};

		const stopRest = async () => {
			await fetch('/api/energy/end', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({}),
			});
		};

		// 初始加载时结算能量并根据路径进行处理
		const handleInitialLoad = async () => {
			if (pathname.startsWith('/communicate')) {
				await stopRest();
			} else {
				await startRest();
			}
		};

		handleInitialLoad();
	}, [pathname]);

	return <div className="mx-auto h-full w-full">{children}</div>;
};

export default ClientLayout;
