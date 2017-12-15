/*
 *     Copyright 2017 Bagaev Dmitry
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

export interface IFontSizeSettings {
    readonly dynamicSizeEnabled?: boolean;
    readonly dynamicSizeWeightA?: number;
    readonly dynamicSizeWeightB?: number;
}

export class FontSizeSettings {
    public readonly dynamicSizeEnabled: boolean = false;
    public readonly dynamicSizeWeightA: number = 0.0003125;
    public readonly dynamicSizeWeightB: number = 0.4;

    constructor(fontSizeSettings: IFontSizeSettings) {
        if (fontSizeSettings.dynamicSizeEnabled !== undefined) {
            this.dynamicSizeEnabled = fontSizeSettings.dynamicSizeEnabled;
        }
        if (fontSizeSettings.dynamicSizeWeightA !== undefined) {
            this.dynamicSizeWeightA = fontSizeSettings.dynamicSizeWeightA;
        }
        if (fontSizeSettings.dynamicSizeWeightB !== undefined) {
            this.dynamicSizeWeightB = fontSizeSettings.dynamicSizeWeightB;
        }
    }
}