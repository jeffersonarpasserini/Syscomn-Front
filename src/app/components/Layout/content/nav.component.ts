import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { PerfilDialogComponent } from '../../Modals/perfil-dialog/perfil-dialog.component';
import { VerificarPermissoes } from 'src/app/auth/VerificarPermissoes';

import { MENU } from './menu';
import { MenuItem } from './menu.model';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  options: FormGroup;

  usuario: Usuario = {
    idUsuario: 0,
    nomeUsuario: '',
    foto: ''
  }

  idSelecionado = 0;
  posicao = null;

  menuItems = [];
  constructor(private router: Router,
              private service: UsuarioService,
              private toast: ToastrService,  
              public dialog: MatDialog,
              private auth: AuthService) {}

  ngOnInit(): void {
    this.menuItems = MENU;
    this.router.navigate(['home'])
    this.carregarUsuario()
  }

  openUpdatePassword(): void {
    const dialogRef = this.dialog.open(PerfilDialogComponent, { height: '350px',  width: '600px' });

    dialogRef.afterClosed();
  }

  setIdSelecionado(pnIdSelecionado: number, pbIsSubMenu: boolean): void {
    this.idSelecionado = pnIdSelecionado;
    
    if (!pbIsSubMenu){
      this.posicao = null;
    }
  }

  setPosicao(pnPosicao: number): void {
    this.posicao = pnPosicao;
    
    this.idSelecionado = null;
  }

  logout(){
    this.router.navigate(['login']);
    this.auth.logout();
    this.toast.info('Logout realizado com sucesso!', 'Logout')
  }
  
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  uploadFoto(event: any, usuario: Usuario) {
    const files = event.target.files;
    //Caso selecionado uma imagem altera em tempo real no banco
    if (files.length) {
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.service.upload(usuario, formData).subscribe(response => {
        this.carregarUsuario()
      });
    }
  }

  carregarUsuario() {
    this.service.getUsuarioLogado(this.usuario).subscribe(resposta => {
      //Alimenta a model de usuário
      this.usuario = resposta
    })
  }

  verificarPermissao(aRoles: String[]): boolean{
    const rolesUsuario = JSON.parse(localStorage.getItem("rolesUsuario"));
    
    if (aRoles != undefined && aRoles.length){
      return VerificarPermissoes.temPermissao(aRoles, rolesUsuario);
    }
    return true;
  }

}


