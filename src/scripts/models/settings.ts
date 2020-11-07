import { VehicleType } from '../objects/traffic/vehicle'

export enum Controls { LEFT_RIGHT = 0, UP_DOWN };

export class SettingsModel {
    controls: Controls;
    vehicle: VehicleType;

    constructor(controls: Controls, vehicle: VehicleType) {
        this.controls = controls;
        this.vehicle = vehicle;
    }
};