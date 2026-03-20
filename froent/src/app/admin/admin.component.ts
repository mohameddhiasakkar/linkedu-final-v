import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Stats { employers: number; students: number; activeJobs: number; revenue: number; }
export interface Student { id: number; name: string; email: string; university: string; status: 'active'|'pending'|'inactive'; applications: number; }
export interface Employer { id: number; name: string; industry: string; jobs: number; status: 'active'|'pending'|'inactive'; joined: string; }
export interface ProductKey { id: number; keyValue: string; used: boolean; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [CurrencyPipe]
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly API = 'http://localhost:8080/api';
  private destroy$ = new Subject<void>();

  sidebarCollapsed = false;
  currentSection = 'statistics';
  isLoading = false;
  errorMessage = '';

  stats: Stats = { employers:0, students:0, activeJobs:0, revenue:0 };
  students: Student[] = [];
  employers: Employer[] = [];
  productKeys: ProductKey[] = [];
  newKeyValue = '';

  studentSearch = '';
  studentStatusFilter: 'all'|'active'|'pending'|'inactive' = 'all';
  employerSearch = '';
  employerStatusFilter: 'all'|'active'|'pending'|'inactive' = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadDashboard(); this.loadProductKeys(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  loadDashboard() {
    this.isLoading = true;
    forkJoin({
      stats: this.http.get<Stats>(`${this.API}/admin/stats`),
      students: this.http.get<Student[]>(`${this.API}/admin/students`),
      employers: this.http.get<Employer[]>(`${this.API}/admin/employers`)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: data => { this.stats = data.stats; this.students = data.students; this.employers = data.employers; this.isLoading = false; },
      error: err => { console.error(err); this.errorMessage='Failed to load dashboard'; this.isLoading=false; }
    });
  }

  loadProductKeys() {
    this.http.get<ProductKey[]>(`${this.API}/admin/product-keys/available`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.productKeys=data, error: err=>console.error(err) });
  }

  approveStudent(id:number){ this.updateStudentStatus(id,'active'); }
  deactivateStudent(id:number){ this.updateStudentStatus(id,'inactive'); }
  private updateStudentStatus(id:number,status:'active'|'inactive') {
    this.http.put(`${this.API}/admin/students/${id}/status`,{status})
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: ()=>{ const s=this.students.find(s=>s.id===id); if(s) s.status=status; }, error: err=>console.error(err) });
  }

  deleteStudent(id:number){
    if(!confirm('Are you sure?')) return;
    this.http.delete(`${this.API}/admin/students/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: ()=>{ this.students=this.students.filter(s=>s.id!==id); this.stats.students--; }, error: err=>console.error(err) });
  }

  approveEmployer(id:number){ this.updateEmployerStatus(id,'active'); }
  deactivateEmployer(id:number){ this.updateEmployerStatus(id,'inactive'); }
  private updateEmployerStatus(id:number,status:'active'|'inactive'){
    this.http.put(`${this.API}/admin/employers/${id}/status`,{status})
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: ()=>{ const e=this.employers.find(e=>e.id===id); if(e) e.status=status; }, error: err=>console.error(err) });
  }

  deleteEmployer(id:number){
    if(!confirm('Are you sure?')) return;
    this.http.delete(`${this.API}/admin/employers/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: ()=>{ this.employers=this.employers.filter(e=>e.id!==id); this.stats.employers--; }, error: err=>console.error(err) });
  }

  assignRole(userId:number, role:string){
    this.http.put(`${this.API}/admin/users/${userId}/role`, null, { params:{role} })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: ()=>console.log(`Role ${role} assigned to user ${userId}`), error: err=>console.error(err) });
  }

  createProductKey(){
    if(!this.newKeyValue.trim()) return;
    this.http.post<ProductKey>(`${this.API}/admin/product-keys`, this.newKeyValue.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next:data=>{ this.productKeys.push(data); this.newKeyValue=''; }, error: err=>console.error(err) });
  }

  toggleSidebar(){ this.sidebarCollapsed = !this.sidebarCollapsed; }
  setSection(section:string){ this.currentSection=section; }

  get filteredStudents(){ return this.students.filter(s=>{ const search = s.name+s.email+s.university; return search.toLowerCase().includes(this.studentSearch.toLowerCase()) && (this.studentStatusFilter==='all'||s.status===this.studentStatusFilter); }); }
  get filteredEmployers(){ return this.employers.filter(e=>{ const search = e.name+e.industry; return search.toLowerCase().includes(this.employerSearch.toLowerCase()) && (this.employerStatusFilter==='all'||e.status===this.employerStatusFilter); }); }
  getStatusClass(status:string){ const map:{[k:string]:string}={active:'badge-success',pending:'badge-warning',inactive:'badge-danger'}; return map[status]||'badge-secondary'; }
}