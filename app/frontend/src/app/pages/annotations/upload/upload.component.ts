/*
 *
 *       Copyright 2017 Bagaev Dmitry
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UploadService } from './upload.service';

@Component({
    selector:        'upload',
    templateUrl:     './upload.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationsUploadComponent implements OnInit, OnDestroy {
    private _uploadServiceEventsSubscription: Subscription;

    @ViewChild('fileHandlerForm')
    public fileHandlerForm: ElementRef;

    constructor(public uploadService: UploadService, private changeDetector: ChangeDetectorRef) {}

    public ngOnInit(): void {
        this._uploadServiceEventsSubscription = this.uploadService.getEvents().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }

    public handleNewFiles(event: Event): void {
        this.uploadService.addItems((event.target as HTMLInputElement).files);
        this.fileHandlerForm.nativeElement.reset();
    }

    public ngOnDestroy(): void {
        if (this._uploadServiceEventsSubscription) {
            this._uploadServiceEventsSubscription.unsubscribe();
        }
    }

}
