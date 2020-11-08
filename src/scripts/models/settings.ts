import { VehicleType } from '../objects/traffic/vehicle'

export enum DeviceType { DESKTOP = 0, MOBILE };
export enum Controls { LEFT_RIGHT = 0, UP_DOWN };

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