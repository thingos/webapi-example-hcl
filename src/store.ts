import { makeAutoObservable, observable } from 'mobx';
import React from 'react';
import Suncalc from 'suncalc';
import { Extrapolation, interpolate } from './interpolate';
import {createInterpolatorWithFallback} from "commons-math-interpolation";


export class Store {
	public api = 'https://cloud.connect-mesh.io/api/core';
	//public api = 'https://connect-mesh-dev.tools.thingos.app/api/core';

	public token: string = localStorage.getItem('token') ?? '';
	public networkId = localStorage.getItem('networkId') ?? null;
	public group: IGroup | null = null;

	public interpolationPoints: number[];
	public colorTemperatureControlPoints = [2500, 2500, 4500, 5000, 4500, 3000, 2500];
	public brightnessControlPoints = [0, 5, 70, 100, 70, 5, 0];

	private colorTemperatureInterpolant: (x: number) => number;
	private brightnessInterpolant: (x: number) => number;

	public isPoweredOn = true;
	public isProcessing = false;

	public networks = observable.array<INetwork>([]);
	public groups = observable.array<IGroup>([]);

	public get networkList() {
		return this.networks.map(network => ({
			id: network.id,
			name: network.name,
		}));
	}

	public get groupList() {
		return this.groups.slice();
	}

	public isControlExpaned = true;
	public today = 0;
	public todayStartSeconds = 0;
	public seconds = 0;
	public times = Suncalc.getTimes(new Date(), 48.8061, 9.1255);
	public timer?: number;

	public lastUpdate = Date.now();

	public get minutes() {
		return Math.floor(this.seconds / 60);
	}

	public get sunriseSeconds() {
		return this.times.sunrise.getTime() / 1000 - this.todayStartSeconds;
	}

	public get sunsetSeconds() {
		return this.times.sunset.getTime() / 1000 - this.todayStartSeconds;
	}

	public get fullDaySeconds() {
		return 24 * 60 * 60;
	}

	public get sunProgress() {
		// calculate the sun progress
		//const sunProgress = (this.now - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime());
		const sunProgress = ((this.today + this.seconds / 1000) % 60) / 60;

		// normalize the sun progress to 0..100 to int numbers and clamp it
		const normalizedSunProgress = Math.max(0, Math.min(100, Math.round(sunProgress * 100)));
		return normalizedSunProgress;
	}

	public get dayTime() {
		// calculate time from Date.now()
		const hours = Math.floor(this.seconds / 3600);
		const minutes = Math.floor((this.seconds % 3600) / 60);
		const seconds = Math.floor(this.seconds % 60);
		// format time string
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	}

	public get rotation() {
		return interpolate(
			this.seconds,
			[0, this.sunriseSeconds, this.sunsetSeconds, this.fullDaySeconds],
			[(Math.PI * 3) / 2, Math.PI, 0, -(Math.PI * 1) / 2],
			Extrapolation.CLAMP
		);
	}

	public get colorTemp() {
		return this.colorTemperatureInterpolant(this.seconds);
	}

	public get brightness() {
		return this.brightnessInterpolant(this.seconds);
	}

	constructor() {
		const groupJson = localStorage.getItem('group');
		if (groupJson) this.group = JSON.parse(groupJson);

		makeAutoObservable(this);

		this.reset();

		this.interpolationPoints = [0, this.sunriseSeconds / 3600, 9, 12, 15, this.sunsetSeconds / 3600, 24];
		this.colorTemperatureInterpolant = this.createInterpolant(this.colorTemperatureControlPoints);
		this.brightnessInterpolant = this.createInterpolant(this.brightnessControlPoints);
	}
	private createInterpolant(values: number[]) {
		return createInterpolatorWithFallback('akima', 
			this.interpolationPoints.map(hour => hour * 60 * 60),
			values
		);
	}

	public onPressTime(): void {
		if (this.isControlExpaned) {
			this.reset();
		} else {
			this.setIsControlExpanded(true);
		}
	}

	public reset() {
		this.setIsControlExpanded(false);
		this.stopTimer();

		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);
		this.todayStartSeconds = todayStart.getTime() / 1000;
		this.seconds = (Date.now() - todayStart.getTime()) / 1000;

		this.startTimer();
	}

	public onPressReset() {
		this.reset();
	}

	public onPressSimulate() {
		this.stopTimer();

		// run every second, so day seconds run through in 1 minute
		const daySeconds = 60 / this.fullDaySeconds;
		const daySecondsMili = Math.round(daySeconds * 1000);

		// start simulated timer
		this.timer = setInterval(() => {
			this.setSeconds(this.seconds + 1);
		}, daySecondsMili);
	}

	public setIsControlExpanded(isControlExpaned: boolean) {
		this.isControlExpaned = isControlExpaned;
	}

	public onChangeMinutes(minutes: string) {
		this.stopTimer();
		this.setSeconds(parseInt(minutes) * 60);
	}

	public startTimer() {
		this.timer = setInterval(() => {
			this.setSeconds(this.seconds + 1);
		}, 1000);
	}

	public stopTimer() {
		if (this.timer) clearInterval(this.timer);
	}

	public setSeconds(seconds: number) {
		this.seconds = seconds % this.fullDaySeconds;

		if (this.lastUpdate + 5000 > Date.now()) return;
		this.lastUpdate = Date.now();
		this.updateGroup();
	}

	public updateLightTemperatureControlPoint(index: number, value: number) {
		this.colorTemperatureControlPoints[index] = value;
		this.colorTemperatureInterpolant = this.createInterpolant(this.colorTemperatureControlPoints);
	}

	public updateBrightnessControlPoint(index: number, value: number) {
		this.brightnessControlPoints[index] = value;
		this.brightnessInterpolant = this.createInterpolant(this.brightnessControlPoints);
	}

	public setToken(token: string) {
		this.token = token;
		localStorage.setItem('token', token);
	}

	public setNetworkId(networkId: string) {
		this.networkId = networkId;
		localStorage.setItem('networkId', networkId);
	}

	public setGroup(group: IGroup | null) {
		this.group = group;
		if (group == null) localStorage.removeItem('groupId');
		else localStorage.setItem('group', JSON.stringify(group));
	}

	public setProcessing(isProcessing: boolean) {
		this.isProcessing = isProcessing;
	}

	public setPoweredOn(isPoweredOn: boolean) {
		this.isPoweredOn = isPoweredOn;
	}

	public async onPressLoadNetworks() {
		const networks = await this.fetchNetworks();
		this.networks.replace(networks);
	}

	public async onChangeNetwork(networkId: string) {
		this.setNetworkId(networkId);
		this.loadGroups(networkId);
	}

	public async loadGroups(networkId: string) {
		const groups = await this.fetchGroups(networkId);
		this.groups.replace(groups);
		this.setGroup(null);
	}

	public async onChangeGroup(groupId: string) {
		const group = this.groups.find(group => group.id === groupId);
		if (group != null) {
			this.setGroup(group);
		}
	}

	public async onPressToggleLights() {
		if (this.networkId == null || this.group == null) return;
		this.setProcessing(true);
		this.setPoweredOn(!this.isPoweredOn);
		await this.powerOnOffGroup(this.networkId, this.group.id, this.isPoweredOn ? 'on' : 'off');
		this.setProcessing(false);
	}

	public async updateGroup() {
		if (this.networkId == null || this.group == null || this.isPoweredOn === false) return;
		console.log('update group', this.colorTemp, this.brightness);
		await this.setTemperatureGroup(this.networkId, this.group.id, this.colorTemp);
		await this.setLightnessGroup(this.networkId, this.group.id, this.brightness / 100);
	}

	public async setTemperatureGroup(networkId: string, groupId: string, temperature: number) {
		const clamped = Math.max(0, Math.min(6000, temperature));
		return await this.fetchApi('/groups/temperature', {
			method: 'PUT',
			body: JSON.stringify({
				networkId,
				groupId,
				temperature: clamped,
				acknowledged: false,
			}),
		});
	}

	public async setLightnessGroup(networkId: string, groupId: string, lightness: number) {
		const clamped = Math.max(0, Math.min(1, lightness));
		return await this.fetchApi('/groups/lightness', {
			method: 'PUT',
			body: JSON.stringify({
				networkId,
				groupId,
				lightness: clamped,
				acknowledged: false,
			}),
		});
	}

	public async powerOnOffGroup(networkId: string, groupId: string, power: 'on' | 'off' = 'on') {
		return await this.fetchApi('/groups/power', {
			method: 'PUT',
			body: JSON.stringify({
				networkId,
				groupId,
				power,
				acknowledged: false,
			}),
		});
	}

	public async fetchGroups(networkId: string): Promise<IGroup[]> {
		return await this.fetchApi('/groups?networkId=' + networkId);
	}

	public async fetchNetworks() {
		return await this.fetchApi('/networks', { mode: 'cors' });
	}

	public async fetchApi(path: string, request: RequestInit = {}) {
		const { headers = {}, ...restRequest } = request;
		const response = await fetch(`${this.api}${path}`, {
			mode: 'cors',
			headers: {
				Authorization: `Bearer ${this.token}`,
				'Content-Type': 'application/json',
				...headers,
			},
			...restRequest,
		});
		return response.json();
	}
}

export const store = new Store();

export const StoreContext = React.createContext(store);

export const useStore = () => React.useContext(StoreContext);

interface IGroup {
	id: string;
	name: string;
}

export interface INetwork {
	id: string;
	networkKey: string;
	name: string;
	creationDate: string;
	updateDate: string;
}
