import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; // needed for ngModel
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent, FormsModule] // <-- add FormsModule
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // detect initial bindings
    await fixture.whenStable(); // wait for async tasks
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.firstName).toBe('');
    expect(component.form.lastName).toBe('');
    expect(component.form.email).toBe('');
    expect(component.form.password).toBe('');
    expect(component.form.role).toBe('STUDENT');
  });

  it('should show success message for valid email', async () => {
    component.form.email = 'test@example.com';
    component.onSubmit();
    await new Promise(r => setTimeout(r, 1600)); // wait for fake submission
    expect(component.successMessage).toBe('Account created successfully!');
    expect(component.errorMessage).toBe('');
  });

  it('should show error message for invalid email', async () => {
    component.form.email = 'invalidemail';
    component.onSubmit();
    await new Promise(r => setTimeout(r, 1600));
    expect(component.errorMessage).toBe('Please enter a valid email');
    expect(component.successMessage).toBe('');
  });
});