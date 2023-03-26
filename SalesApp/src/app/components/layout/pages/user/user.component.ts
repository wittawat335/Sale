import { UserDialogComponent } from './../../dialogs/user-dialog/user-dialog.component';
import { UtilityService } from './../../../../shared/utility/utility.service';
import { UserService } from './../../../../shared/services/user.service';
import { User } from './../../../../shared/interfaces/user';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'FullName',
    'Email',
    'RoleName',
    'isActive',
    'Actions',
  ];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private utService: UtilityService
  ) {}

  GetTableUserList() {
    this.userService.GetList().subscribe({
      next: (data) => {
        console.log(data);
        if (data.status) {
          this.dataSource = new MatTableDataSource(data.value);
        } else this.utService.showAlert(data.message, 'Oops!');
      },
      error: (e) => {},
    });
  }
  ngOnInit(): void {
    this.GetTableUserList();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  newUser() {
    this.dialog
      .open(UserDialogComponent, {
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'true') {
          this.GetTableUserList();
        }
      });
  }

  updateUser(user: User) {
    this.dialog
      .open(UserDialogComponent, {
        disableClose: true,
        data: user,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'true') this.GetTableUserList();
      });
  }

  deleteUser(user: User) {
    Swal.fire({
      title: 'Do you want delete user?',
      text: user.fullName,
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.Delete(user.userId).subscribe({
          next: (data) => {
            if (data.status) {
              this.utService.showAlert(data.message, 'success');
              this.GetTableUserList();
            } else {
              this.utService.showAlert(data.message, 'Error');
            }
          },
          error: (e) => {},
        });
      }
    });
  }
}
