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

export interface IChartMarginConfiguration {
    readonly top?: number;
    readonly left?: number;
    readonly right?: number;
    readonly bottom?: number;
}

export class ChartMarginConfiguration {
    private static readonly topDefault: number = 0;
    private static readonly leftDefault: number = 0;
    private static readonly rightDefault: number = 0;
    private static readonly bottomDefault: number = 0;

    public readonly top: number;
    public readonly left: number;
    public readonly right: number;
    public readonly bottom: number;

    constructor(config: IChartMarginConfiguration) {
        this.top = config.top ? config.top : ChartMarginConfiguration.topDefault;
        this.left = config.left ? config.left : ChartMarginConfiguration.leftDefault;
        this.right = config.right ? config.right : ChartMarginConfiguration.rightDefault;
        this.bottom = config.bottom ? config.bottom : ChartMarginConfiguration.bottomDefault;
    }
}
