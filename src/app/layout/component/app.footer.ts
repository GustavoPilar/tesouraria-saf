import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        by
        <a href="https://gustavopilar.github.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Gustavo Pilar</a>
    </div>`
})
export class AppFooter {}
