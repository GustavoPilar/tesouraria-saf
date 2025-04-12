import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import * as XLSX from 'xlsx-js-style';
import { Entity } from '../crud/crud.component';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TagModule,
    FileUploadModule,
    DialogModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumberModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  public entities: any[] = []
  public totalValue: number = 0;
  public modal: boolean = false;
  public selectedEntity: any = null;
  public selectedIndex: number = -1;
  public form: FormGroup;

  public actions: any[] = [
    {
      id: 0, description: 'Entrada'
    },
    {
      id: 1, description: 'Saída'
    }
  ]

  /**
   *
   */
  constructor(
    private formBuilder: FormBuilder
  ) {
    
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      date: [1],
      description: [''],
      price: [0],
      action: [0] // 0 = 'Entrada'; 1 = 'Saída'
    });
  }

  openNew() {
    this.modal = true;
  }

  hideDialog() {
    this.selectedEntity = null;
    this.selectedIndex = -1;
    this.modal = false;
  }

  saveEntity() {
    let entity: any = {
      date: this.form.get('date').value,
      description: this.form.get('description').value,
      price: this.form.get('price').value,
      action: this.form.get('action').value == 0 ? 'Entrada' : 'Saída' 
    }

    if (this.selectedEntity) {
      this.entities[this.selectedIndex] = entity;
    }
    else {
      this.entities.push(entity);
    }
    
    
    this.updateTotal(entity);
    this.updateEntities()
    this.hideDialog();
  }

  editEntity(entity, index ) {
    this.selectedEntity = entity;
    this.selectedIndex = index;

    this.form.patchValue({
      date: entity.date,
      description: entity.description,
      price: entity.price,
      action: entity.action == 'Entrada' ? 0 : 1
    })

    this.modal = true;
  }

  public updateTotal(entity: any) {
    
    let count = 0;
    for (let entity of this.entities) {
      if (entity.action == 'Entrada') {
        count += entity.price;
      }
      else {
        count -= entity.price;
      }
    }

    this.totalValue = count;
  }

  private updateEntities() {

    this.entities.sort((a, b) => a.date - b.date);
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

      let total: number = 0;

      for (let i: number = 5; i < 50; i++) {
        let array: any[] = jsonData[i];

        if (array[0] != undefined && array[0] != '') {
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

      this.totalValue = total;
    };
  
    reader.readAsArrayBuffer(file);
  }

  exportExcel() {
    // Dados da planilha
    let data = [
      [`${new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()} / ${new Date().getFullYear()}`],
      [''],
      ['DÉBITO','', '', 'CAIXA','', 'CRÉDITO'],
      [''],
      ['DATA', 'ITEM', 'DESCRIÇÃO', 'ENTRADA', 'SAÍDA', '', '']
    ];
  
    let inValue: number = 0;
    let outValue: number = 0;
    this.entities.forEach((entity: Entity, index: number) => {
      let array: any[] = [
        entity.date,
        (index + 1),
        entity.description
      ];
  
      if (entity.action == 'Entrada') {
        array.push(entity.price);
        array.push('');
        inValue += entity.price;
      } else {
        array.push('');
        array.push(entity.price);
        outValue += entity.price;
      }
  
      array.push('');
      array.push('');
      data.push(array);
    });
  
    // Linha de totais
    data.push(['', '', '', `${inValue}`, `${outValue}`, '', '']);

    let dif = 49 - (this.entities.length + 5);

    for (let i = 0; i < dif; i++) {
      data.push(['', '', '', '', '', '', '']);
    }
  
    data.push(['', '', '', '', '', '', `${inValue - outValue}`]);

    // Criar worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
  
    // Mesclagens
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: 2, c: 3 }, e: { r: 3, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 3, c: 6 } }
    ];
  
  // Estilo das bordas e ajustes
  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellRef];
      if (!cell) continue;
  
      // Verifica se é a coluna de entrada (coluna 3) ou saída (coluna 4)
      const isMoneyCol = (C === 3 || C === 4) && R > 4; // R > 4 evita formatar cabeçalhos
  
      cell.s = {
        border: {
          top:    { style: 'medium', color: { rgb: "000000" } },
          bottom: { style: 'medium', color: { rgb: "000000" } },
          left:   { style: 'medium', color: { rgb: "000000" } },
          right:  { style: 'medium', color: { rgb: "000000" } }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        },
        font: {
          name: 'Arial',
          sz: 10
        },
        ...(isMoneyCol ? { numFmt: 'R$ #,##0.00' } : {}) // aplica formatação de moeda
      };
    }
  }

  // Ajustar largura das colunas automaticamente
  const colWidths = data[0].map((_, colIndex) => {
    const maxLength = data.reduce((max, row) => {
      const cell = row[colIndex];
      return Math.max(max, cell ? cell.toString().length : 0);
    }, 10); // mínimo de largura
    return { wch: maxLength + 2 }; // +2 para folga
  });
  worksheet['!cols'] = colWidths;
  
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, new Date().toLocaleString('pt-BR', { month: 'long' }));
  
    // Gerar e salvar
    XLSX.writeFile(workbook, `${new Date().toLocaleString('pt-BR', { month: 'long' })}.xlsx`);
  }
}
