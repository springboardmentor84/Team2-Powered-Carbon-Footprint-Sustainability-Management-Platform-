import { Component, Inject } from '@angular/core';

import {
MAT_DIALOG_DATA,
MatDialogModule,
MatDialogRef
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

@Component({
selector:'app-delete-confirm-dialog',
standalone:true,
imports:[
CommonModule,
MatDialogModule,
MatButtonModule
],
templateUrl:'./delete-confirm-dialog.html',
styleUrl:'./delete-confirm-dialog.css'
})
export class DeleteConfirmDialog{

constructor(
private dialogRef:MatDialogRef<DeleteConfirmDialog>,
@Inject(MAT_DIALOG_DATA) public title:string
){}

cancel(){

this.dialogRef.close(false);

}

delete(){

this.dialogRef.close(true);

}

}
