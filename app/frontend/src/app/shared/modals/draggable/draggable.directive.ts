/*
 *        Copyright 2017 Bagaev Dmitry
 *
 *        Licensed under the Apache License, Version 2.0 (the "License");
 *        you may not use this file except in compliance with the License.
 *        You may obtain a copy of the License at
 *
 *            http://www.apache.org/licenses/LICENSE-2.0
 *
 *        Unless required by applicable law or agreed to in writing, software
 *        distributed under the License is distributed on an "AS IS" BASIS,
 *        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *        See the License for the specific language governing permissions and
 *        limitations under the License.
 *
 */

import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
    selector: 'bind-draggable-event'
})
export class DraggableDirective {
    private _isDragging: boolean = false;

    @Output('onDragDrop')
    public onDragDrop = new EventEmitter();

    @HostBinding('style.border') get getDragStyleBorder(): string {
        return this._isDragging ? '1px dashed #bbb;' : 'none';
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: Event) {
        this._isDragging = true;
        event.preventDefault();
    }

    @HostListener('dragenter', ['$event'])
    public onDragEnter(event: Event) {
        this._isDragging = true;
        event.preventDefault();
    }

    @HostListener('dragend', ['$event'])
    public onDragEnd(event: Event) {
        this._isDragging = false;
        event.preventDefault();
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: Event) {
        this._isDragging = false;
        event.preventDefault();
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: Event) {
        this._isDragging = false;
        event.preventDefault();
        event.stopPropagation();
        this.onDragDrop.emit(event);
    }

}
