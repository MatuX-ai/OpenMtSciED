import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PromptDialogComponent, PromptDialogData } from './prompt-dialog.component';

describe('PromptDialogComponent (UX-08)', () => {
  let fixture: ComponentFixture<PromptDialogComponent>;
  let component: PromptDialogComponent;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const baseData: PromptDialogData = {
    title: '新建爬虫',
    message: '请输入爬虫名称',
    label: '名称',
  };

  function buildFixture(data: PromptDialogData = baseData): ComponentFixture<PromptDialogComponent> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PromptDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    const f = TestBed.createComponent(PromptDialogComponent);
    f.detectChanges();
    return f;
  }

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [PromptDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: baseData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize inputValue to empty string and render default cancel/confirm text', () => {
    expect(component.inputValue).toBe('');
    const compiled: HTMLElement = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons[0].textContent?.trim()).toBe('取消');
    expect(buttons[1].textContent?.trim()).toBe('确认');
    expect(compiled.textContent).toContain(baseData.title);
  });

  it('should apply defaultValue on ngOnInit when provided', () => {
    const f = buildFixture({ title: '编辑', label: '名称', defaultValue: '初始值' });
    const instance = f.componentInstance;
    expect(instance.inputValue).toBe('初始值');
  });

  it('should set the input type from data.inputType', () => {
    const f = buildFixture({ title: '新建 URL', label: '链接', inputType: 'url' });
    const input: HTMLInputElement | null = f.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.type).toBe('url');
  });

  it('should close dialog with current inputValue when confirm button is clicked', () => {
    component.inputValue = 'my-crawler';
    fixture.detectChanges();

    const compiled: HTMLElement = fixture.nativeElement;
    const confirmBtn: HTMLButtonElement | undefined = compiled.querySelector(
      'button[mat-flat-button]'
    ) as HTMLButtonElement | undefined;
    confirmBtn?.click();
    expect(dialogRef.close).toHaveBeenCalledWith('my-crawler');
  });

  it('should close dialog with null when cancel button is clicked', () => {
    component.inputValue = 'will-be-discarded';
    fixture.detectChanges();

    const compiled: HTMLElement = fixture.nativeElement;
    const cancelBtn: HTMLButtonElement | undefined = compiled.querySelector(
      'button[mat-button]'
    ) as HTMLButtonElement | undefined;
    cancelBtn?.click();
    expect(dialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should expose data and onConfirm() is a no-op (closure handled by template)', () => {
    expect(component.data).toEqual(baseData);
    expect(() => component.onConfirm()).not.toThrow();
  });

  it('should disable confirm button when inputValue is empty (template guard)', () => {
    component.inputValue = '';
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const confirmBtn: HTMLButtonElement | undefined = compiled.querySelector(
      'button[mat-flat-button]'
    ) as HTMLButtonElement | undefined;
    expect(confirmBtn?.disabled).toBe(true);
  });

  it('should enable confirm button when inputValue is non-empty (template guard)', () => {
    component.inputValue = 'non-empty';
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const confirmBtn: HTMLButtonElement | undefined = compiled.querySelector(
      'button[mat-flat-button]'
    ) as HTMLButtonElement | undefined;
    expect(confirmBtn?.disabled).toBe(false);
  });
});