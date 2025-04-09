import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'app-crud-base',
    template: '',
    imports: [

    ]
})
export abstract class CrudBaseComponent implements OnInit {
    
    
    constructor() {
        
    }

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

}
