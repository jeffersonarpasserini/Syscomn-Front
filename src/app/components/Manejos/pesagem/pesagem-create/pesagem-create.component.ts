import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { AnimalChip } from 'src/app/models/animalChip';
import { Lote } from 'src/app/models/lote';
import { Pesagem } from 'src/app/models/pesagem';
import { AnimalChipService } from 'src/app/services/animal-chip.service';
import { LoteService } from 'src/app/services/lote.service';
import { PesagemService } from 'src/app/services/pesagem.service';

@Component({
  selector: 'app-pesagem-create',
  templateUrl: './pesagem-create.component.html',
  styleUrls: ['./pesagem-create.component.css']
})
export class PesagemCreateComponent implements OnInit {

  pesagem: Pesagem = {
    idPesagem: 0,
    pesoBrutoVeiculo: 0,
    pesoTaraVeiculo: 0,
    peso: 0,
    observacao: '',
    idAnimalChip: 0,
    idPessoa: 0,
    nomePessoa: '',
    idLote: 0,
    tipoPesagem: 'A'
  }
  
  animalChip: AnimalChip = {
    idAnimalChip: 0,
    chip: '',
    codigo: '',
    nome: '',
    dtaNascimento: null,
    dtaEntrada: null,
    pai: '',
    mae: '',
    custoAquisicao: 0,
    custoFinal: 0,
    pesoEntrada: 0,
    pesoAtual: 0,
    status: 0,
    ganhoMedioDiario: 0,
    idLote: 0,
    nroLote:0,
    descrLote: '',
    idSexoAnimal: 0,
    descrSexoAnimal: '',
    idRaca: 0,
    descrRaca: '',
    idEstadoAnimal: 0,
    descrEstadoAnimal: '',
    idTipoMorte: 0,
    descrTipoMorte: ''
  }

  lote: Lote = {
    idLote: '',
    descricao: '',
    nroLote: 0,
    pesoEntrada: 0,
    pesoAtual: 0,
    custoLote: 0,
    qtdeCabecasEntrada: 0,
    qtdeCabecasMorte: 0,
    qtdeCabecasAtual: 0,
    status: 0,
    curralPiquete: '',
    descricaoCurralPiquete: '',
    dataInicio: null,
    dataFinal: null,
    regimeEngorda: 0,
    descricaoRegimeEngorda: ''
  }

  lstLote: Lote[] = [];

  ELEMENT_DATA: AnimalChip[] = []

  displayedColumns: string[] = ['chip', 'nome', 'descrSexoAnimal', 'pesoAtual', 'dtaHoraUltimaPesagem', 'acoes'];
  dataSource = new MatTableDataSource<AnimalChip>(this.ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private loteService: LoteService,
              private animalService: AnimalChipService,
              private pesagemService: PesagemService,
              private toast: ToastrService) { }

  ngOnInit(): void {
    this.findAllLote();
  }

  findAllLote(): void{
    this.loteService.findAll().subscribe(resposta => {this.lstLote = resposta;});
  }

  findLote(): void{
    this.loteService.findById(this.pesagem.idLote).subscribe(resposta =>{
      this.lote = resposta;

      this.ELEMENT_DATA = resposta.lstAnimais;
      this.dataSource = new MatTableDataSource<AnimalChip>(resposta.lstAnimais);
      this.dataSource.paginator = this.paginator;
    })
  }

  findAnimalChip(idAnimalChip: number): void{
    this.animalService.findById(idAnimalChip).subscribe(resposta =>{ this.animalChip = resposta})

    this.pesagem.idAnimalChip = idAnimalChip;
    this.pesagem.peso = 0;
  }

  create(): void{
    if(this.pesagem.peso <= 0){
      this.toast.error("Peso deve ser maior que 0!");
      return;
    }

    if(this.pesagem.tipoPesagem == "A"){
      if(this.validaPesagemAnimalUnico() == false){
        return;
      }
    }else if(this.pesagem.tipoPesagem == "L"){
      if(this.validaPesagemLote() == false){
        return;
      }
    }

    this.pesagemService.create(this.pesagem).subscribe(() => {
      this.toast.success('Pesagem realizada com Sucesso!', 'Produção');

      this.atualizaTela();
    }, ex => {
      if(ex.error.lstErrors) {
        ex.error.lstErrors.forEach(element => {
          this.toast.error(element.message);
        });
      } else {
        this.toast.error(ex.error.message);
      }
    })
  }

  atualizaTela(): void{
    //Atualiza a tabela de Animais com as novas informações de pesagem
    if(this.pesagem.tipoPesagem == 'A'){
      this.findLote();
    }

    this.limpaTela(false);
  }

  limpaTela(pbLimpaLote: boolean): void{
    //Apenas limpa o lote pelo evento de troca de tipo pesagem
    if(pbLimpaLote){
      this.pesagem.idLote = 0;

      this.ELEMENT_DATA = null;
      this.dataSource = new MatTableDataSource<AnimalChip>(this.ELEMENT_DATA);
    }

    if(this.pesagem.tipoPesagem == 'A'){
      //Limpando Animal Chip
      this.animalChip.idAnimalChip = 0;
      this.animalChip.chip = '';
      this.animalChip.codigo = '';
      this.animalChip.descrSexoAnimal = '';
      this.animalChip.descrRaca = '';
      this.animalChip.descrEstadoAnimal = '';

    }else{
      //Limpando Lote
      this.lote.nroLote = 0;
      this.lote.descricao = '';
      this.lote.pesoEntrada = 0;
      this.lote.pesoAtual = 0;
      this.lote.qtdeCabecasAtual = 0;
      this.lote.descricaoCurralPiquete = '';
    }

    //Limpa Pesagem
    this.pesagem.peso = 0;
    this.pesagem.pesoBrutoVeiculo = 0;
    this.pesagem.pesoTaraVeiculo = 0;
    this.pesagem.observacao = '';

    if(this.pesagem.tipoPesagem == "L"){
      this.pesagem.idLote = 0;
    }
  }

  calculaPesoLiquido(): void{
    this.pesagem.peso = this.pesagem.pesoBrutoVeiculo - this.pesagem.pesoTaraVeiculo;
  }

  validaPesagemAnimalUnico(): boolean{
    if(this.pesagem.idLote == 0){
      this.toast.error("Necessário selecionar um Lote para pesagem!");
      return false;
    }

    if(this.pesagem.idAnimalChip == 0){
      this.toast.error("Necessário selecionar um animal para Pesagem!");
      return false;
    }

    return true
  }

  validaPesagemLote(): boolean{
    if(this.pesagem.idLote == 0){
      this.toast.error("Necessário selecionar um Lote para pesagem!");
      return false;
    }

    return true;
  }
  
}
