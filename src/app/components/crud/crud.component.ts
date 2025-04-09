import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import * as XLSX from 'xlsx';
import { ConfirmationService } from 'primeng/api';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

export class Entity {
  date: number;
  description: string;
  action: string;
  price: number;
}

@Component({
  selector: 'app-crud',
  imports: [
    CommonModule,
    FileUploadModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule
  ],
  providers: [
    ConfirmationService
  ],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.scss'
})
export class CrudComponent {

  public actions: any[] = [];

  public entities: Entity[] = [];
  public selectedEntities: any[];
  public cols: Column[];

  public modal: boolean = false;
  public selectedEntity: any;

  constructor() {
    this.actions = [
      { description: 'Entrada'},
      { description: 'Saída' }
    ]
    this.cols = [];  
  }

  onUpload(event: any) {
    const file: File = event.files[0]; // Aqui pegamos o primeiro arquivo enviado (no caso, o Excel).
  
    const reader = new FileReader(); // Criamos um FileReader, que é um objeto do navegador usado para ler arquivos localmente.

    reader.onload = (e: any) => { // Aqui dizemos o que vai acontecer quando o arquivo terminar de ser lido. A função que vem depois disso será executada com os dados do arquivo carregado.

      const data = new Uint8Array(e.target.result); // Transformamos o conteúdo do arquivo em um array de bytes (Uint8Array), pois a biblioteca do Excel (XLSX) precisa desses dados em forma binária para ler corretamente.

      const workbook = XLSX.read(data, { type: 'array' });
      /**
       * Usamos a biblioteca xlsx (talvez instalada como xlsx ou SheetJS) para ler o conteúdo do Excel.
       *
       * workbook é o conjunto de planilhas no arquivo.
       *
       * type: 'array' diz que os dados são binários (array buffer).
       */
  
      const sheetName = workbook.SheetNames[0]; // Aqui pegamos o nome da primeira planilha dentro do arquivo.

      const worksheet = workbook.Sheets[sheetName]; // Agora obtemos os dados da primeira planilha.
  
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      /**
       * Convertendo a planilha para um array de arrays, onde:
       *
       * Cada linha da planilha vira um array,
       *
       * E cada célula da linha é um valor dentro desse array.
       */

  
      console.log('Conteúdo do Excel:', jsonData);

      let total: number = 0;

      for (let i: number = 5; i < 50; i++) {
        let array: any[] = jsonData[i];

        if (array[0] != undefined) {
          let entity: Entity = {
            date: 0,
            action: '',
            description: '',
            price: 0
          };

          entity.date = array[0];
          entity.description = array[2];
          
          if (array[3] != null) {
            entity.price = array[3];
            entity.action = 'Entrada'
            total += entity.price;
          }
          else {
            entity.price = array[4];
            entity.action = 'Saída'
            total -= entity.price;
          }

          this.entities.push(entity);
        }
      }

      console.log(total);
    };
  
    reader.readAsArrayBuffer(file);
  }
}
