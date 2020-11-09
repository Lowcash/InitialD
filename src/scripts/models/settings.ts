import { VehicleType } from '../objects/traffic/vehicle'

export enum DeviceType { DESKTOP = 0, MOBILE };
export enum Controls { LEFT_RIGHT = 0, UP_DOWN };

export enum GameState { GAME_OVER = 0, PLAY = 1 };

export enum ControlState { NOT_SELECTED = 0, PENDING = 1, SELECTED = 2 };

export class SettingsModel {
    deviceType: DeviceType;
    controls: Controls;
    vehicle: VehicleType;

    constructor(deviceType: DeviceType, controls: Controls, vehicle: VehicleType) {
        this.deviceType = deviceType;
        this.controls = controls;
        this.vehicle = vehicle;
    }
};