import './App.css';
import { StoreContext, store, useStore } from './store';
import { observer } from 'mobx-react';
import { Button } from './components/Button';
import { TextField } from './components/TextField';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Switch } from 'react-aria-components';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Item, Select } from './components/Select';
import { Suspense, useRef } from 'react';
import { Earth } from './components/Earth';
import { Group } from 'three';
import { Controls } from './components/Controls';

function App() {
	return (
		<StoreContext.Provider value={store}>
			<RouterProvider router={router} />
		</StoreContext.Provider>
	);
}

const router = createBrowserRouter(
	[
		{ path: '/', element: <Landing /> },
		{ path: '/hcl', element: <HCL /> },
		{ path: '/settings', element: <Settings /> },
	],
	{ basename: import.meta.env.BASE_URL }
);

function Landing() {
	return (
		<FullScreen>
			<div className="w-full sm:w-2/3 lg:w-1/2  rounded-xl m-auto p-8">
				<div className="bg-white rounded shadow p-8">
					<div className="sm:flex sm:items-start">
						<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-400 sm:mx-0 sm:h-10 sm:w-10"></div>
						<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex gap-1 flex-col">
							<h2 className="text-xl leading-2 font-medium text-gray-900" id="modal-title">
								Human Centric Lighting
							</h2>
							<p className="text-gray-500 mt-2">
								Human Centric Lighting refers to the use of lighting that is designed to support the natural needs of
								humans, such as regulating circadian rhythms and enhancing mood and productivity.
							</p>
							<div className="flex pt-4">
								<Link className="rounded bg-yellow-400 px-4 py-2 text-white font-bold" to="/settings">
									Get started
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</FullScreen>
	);
}

function HCL() {
	return (
		<FullScreen>
			<div className="flex flex-1 flex-col-reverse sm:flex-row overflow-scroll">
				<div className="sm:w-3/12">
					<ControlsLocal>
						<Controls />
					</ControlsLocal>
				</div>
				<div className="sm:w-9/12 h-full">
					<Canvas>
						<Suspense fallback={null}>
							<EarthWithTime />
						</Suspense>
					</Canvas>
				</div>
			</div>
		</FullScreen>
	);
}

const EarthWithTime = () => {
	const store = useStore();

	const ref = useRef<Group | null>(null);

	useFrame(() => {
		if (ref.current == null) return;
		ref.current.rotation.y = store.rotation;
	});

	return <Earth lightGroupRef={ref} />;
};

const ControlsLocal: React.FC<React.HTMLAttributes<HTMLDivElement>> = observer(({ children }) => {
	const store = useStore();
	// const {now} = store;
	const { dayTime, minutes, isControlExpaned } = store;

	return (
		<div className=" bg-gray-50 rounded-xl m-8">
			<div className="bg-white rounded shadow p-4">
				<div className="flex flex-col gap-3">
					<h1 className="text-l font-medium">Controls</h1>
					<div className="flex justify-between">
						<p onClick={() => store.onPressTime()} className="text-3xl cursor-pointer">
							{dayTime}
						</p>
						<LightSwitch />
					</div>
					{isControlExpaned && (
						<div className="flex flex-col gap-4">
							{children}
							<input
								className="bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-yellow-500"
								type="range"
								min={0}
								max={24 * 60}
								value={minutes}
								onChange={e => store.onChangeMinutes(e.target.value)}
								onMouseUp={() => store.updateGroup()}
							/>
							<div className="flex gap-4">
								<Button className="flex-1" onPress={() => store.onPressSimulate()}>
									Simulate
								</Button>
								<Button className="flex-1" onPress={() => store.onPressReset()}>
									Reset
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

function Settings() {
	const store = useStore();

	return (
		<FullScreen>
			<div className="w-full sm:w-2/3 lg:w-1/2  rounded-xl m-auto p-8">
				<div className="bg-white rounded shadow p-8">
					<div className="flex flex-col gap-3">
						<h1 className="text-3xl font-bold">Settings</h1>
						<TokenInput></TokenInput>
						<Button onPress={() => store.onPressLoadNetworks()}>Load Networks</Button>
						<NetworkSelection />
						<GroupSelection />
						<ContinueButton />
					</div>
				</div>
			</div>
		</FullScreen>
	);
}

function FullScreen(props: any) {
	return (
		<div className="w-full">
			<main role="main" className="w-full flex flex-col h-screen overflow-hidden">
				{props.children}
			</main>
		</div>
	);
}

const NetworkSelection = observer(() => {
	const store = useStore();
	const networks = store.networkList;
	const networkId = store.networkId;
	if (networks.length == 0) return null;
	return (
		<Select
			label="Select a network"
			items={networks}
			selectedKey={networkId}
			onSelectionChange={selected => store.onChangeNetwork(selected as string)}
		>
			{item => <Item key={item.id}>{item.name}</Item>}
		</Select>
	);
});

const GroupSelection = observer(() => {
	const store = useStore();
	const groups = store.groupList;
	const groupId = store.group?.id;
	if (groups.length == 0) return null;
	return (
		<Select
			label="Select a group"
			items={groups}
			selectedKey={groupId}
			onSelectionChange={selected => store.onChangeGroup(selected as string)}
		>
			{item => <Item key={item.id}>{item.name}</Item>}
		</Select>
	);
});

const ContinueButton = observer(() => {
	const store = useStore();
	const groupId = store.group?.id;
	if (groupId == null) return null;
	return (
		<Link className="rounded bg-yellow-600 px-4 py-2 text-white font-bold text-center" to="/hcl">
			Start HCL
		</Link>
	);
});

const LightSwitch = observer(() => {
	const store = useStore();
	return (
		<Switch
			isSelected={store.isPoweredOn}
			onChange={_selected => store.onPressToggleLights()}
			className="group flex gap-2 items-center text-black font-semibold text-sm"
		>
			<div className="inline-flex h-[26px] w-[44px] shrink-0 cursor-default rounded-full shadow-inner bg-clip-padding border border-white/30 p-[3px] transition-colors duration-200 ease-in-out bg-yellow-600 group-data-[pressed]:bg-yellow-700 group-data-[selected]:bg-yellow-800 group-data-[selected]:group-data-[pressed]:bg-yellow-800 focus:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-black">
				<span className="h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 group-data-[selected]:translate-x-[100%]" />
			</div>
			{store.group?.name}
		</Switch>
	);
	// return <Button onPress={() => store.onPressToggleLights()}>Turn lights {store.isPoweredOn ? 'off' : 'on'}</Button>;
});

const TokenInput = observer(() => {
	const store = useStore();
	return <TextField label="Gateway Token" placeholder="Token" value={store.token} onChange={e => store.setToken(e)} />;
});

export default App;
