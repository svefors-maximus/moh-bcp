import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'bcp-subheading-review-container',
    templateUrl: './subheading-review-container.component.html',
    styleUrls: ['./subheading-review-container.component.scss'],
})
export class SubheadingReviewContainerComponent implements OnInit {
    @Input() hideReviewSection: boolean = false;
    @Input() header: string | null;
    @Input() redirectPath: string | null;
    @Input() sectionItems: any | null;
    @Input() sections: any | null;
    @Input() showCheckBoxList: boolean = false;

    // Display as print view - no icons, no grey boxes
    @Input() displayPrintView: boolean = false;

    constructor(private router: Router) {}

    ngOnInit() {}

    redirect(routeName: string) {
        this.router.navigate([routeName]);
    }

    containsMultiLine(text: string): boolean {
        if (!text) {
            return false;
        }
        const lineCount = text.split(/\r\n|\r|\n/).length;
        return lineCount > 1;
    }

    getMultiLineHTML(text: string): string {
        if (!text) {
            return null;
        }
        const str = this.escapeHTML(text);
        return str.replace(/\n/g, '<br\/>');
    }

    private escapeHTML(text: string): string {
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
    }
}