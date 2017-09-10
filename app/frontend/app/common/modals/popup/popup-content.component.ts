import { ChangeDetectorRef, Component, ElementRef, Input } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";


@Component({
    selector: "popup-content",
    templateUrl: './popup-content.component.html'
})
export class PopupContentComponent {
    @Input()
    hostElement: HTMLElement;

    @Input()
    content: SafeHtml;

    @Input()
    header: string;

    @Input()
    popupWidth: "" | "wide" | "very wide" = "";

    @Input()
    placement: "top" | "bottom" | "left" | "right" = "top";

    top: number = -100000;
    left: number = -100000;

    constructor(private element: ElementRef, private cdr: ChangeDetectorRef) {
    }

    ngAfterViewInit(): void {
        this.show();
        this.cdr.detectChanges();
    }

    show(): void {
        if (!this.hostElement) {
            return;
        }

        const p = this.positionElements(this.hostElement, this.element.nativeElement.children[ 0 ], this.placement);
        this.top = p.top;
        this.left = p.left;
    }

    hide(): void {
        this.top = -100000;
        this.left = -100000;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private positionElements(hostEl: HTMLElement, targetEl: HTMLElement, positionStr: string, appendToBody: boolean = false): { top: number, left: number } {
        let positionStrParts = positionStr.split("-");
        let pos0 = positionStrParts[ 0 ];
        let pos1 = positionStrParts[ 1 ] || "center";
        let hostElPos = appendToBody ? PopupContentComponent.offset(hostEl) : PopupContentComponent.position(hostEl);
        let targetElWidth = targetEl.offsetWidth;
        let targetElHeight = targetEl.offsetHeight;
        let shiftWidth: any = {
            center: function (): number {
                return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
            },
            left:   function (): number {
                return hostElPos.left;
            },
            right:  function (): number {
                return hostElPos.left + hostElPos.width;
            }
        };

        let shiftHeight: any = {
            center: function (): number {
                return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
            },
            top:    function (): number {
                return hostElPos.top;
            },
            bottom: function (): number {
                return hostElPos.top + hostElPos.height;
            }
        };

        let targetElPos: { top: number, left: number };
        switch (pos0) {
            case "right":
                targetElPos = {
                    top:  shiftHeight[ pos1 ](),
                    left: shiftWidth[ pos0 ]()
                };
                break;

            case "left":
                targetElPos = {
                    top:  shiftHeight[ pos1 ](),
                    left: hostElPos.left - targetElWidth
                };
                break;

            case "bottom":
                targetElPos = {
                    top:  shiftHeight[ pos0 ](),
                    left: shiftWidth[ pos1 ]()
                };
                break;

            default:
                targetElPos = {
                    top:  hostElPos.top - targetElHeight,
                    left: shiftWidth[ pos1 ]()
                };
                break;
        }

        return targetElPos;
    }

    private static position(nativeEl: HTMLElement): { width: number, height: number, top: number, left: number } {
        let offsetParentBCR = { top: 0, left: 0 };
        const elBCR = PopupContentComponent.offset(nativeEl);
        const offsetParentEl = PopupContentComponent.parentOffsetEl(nativeEl);
        if (offsetParentEl !== window.document) {
            offsetParentBCR = PopupContentComponent.offset(offsetParentEl);
            offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
            offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width:  boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top:    elBCR.top - offsetParentBCR.top,
            left:   elBCR.left - offsetParentBCR.left
        };
    }

    private static offset(nativeEl: any): { width: number, height: number, top: number, left: number } {
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width:  boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top:    boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop),
            left:   boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft)
        };
    }

    private static getStyle(nativeEl: HTMLElement, cssProp: string): string {
        if ((nativeEl as any).currentStyle) // IE
        {
            return (nativeEl as any).currentStyle[ cssProp ];
        }

        if (window.getComputedStyle) {
            return (window.getComputedStyle(nativeEl) as any)[ cssProp ];
        }

        // finally try and get inline style
        return (nativeEl.style as any)[ cssProp ];
    }

    private static isStaticPositioned(nativeEl: HTMLElement): boolean {
        return (PopupContentComponent.getStyle(nativeEl, 'position') || 'static' ) === 'static';
    }

    private static parentOffsetEl(nativeEl: HTMLElement): any {
        let offsetParent: any = nativeEl.offsetParent || window.document;
        while (offsetParent && offsetParent !== window.document && PopupContentComponent.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || window.document;
    }
}
