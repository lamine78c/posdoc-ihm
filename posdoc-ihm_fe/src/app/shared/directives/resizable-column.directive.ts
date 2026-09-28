import { Directive, ElementRef, HostListener, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResizableColumn]',
  standalone: false,
})
export class ResizableColumnDirective implements OnDestroy {
  resizableColumn!: HTMLElement;
  adjacentColumn!: HTMLElement | null;
  parentElement!: HTMLElement;
  startX: number;
  resizeHandleWidth: number;
  initialWidth: number;
  adjacentInitialWidth: number;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.addResizableClass();
    this.init();
  }

  addResizableClass(): void {
    this.parentElement = this.el.nativeElement.closest('table'); // Assuming the parent is a table
    if (this.parentElement) {
      this.renderer.addClass(this.parentElement, 'resizable-table');
    }
  }

  init(): void {
    this.startX = 0;
    this.resizeHandleWidth = 10;
    this.initialWidth = 0;
    this.adjacentInitialWidth = 0;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.resizableColumn = (event.target as HTMLElement).closest('th');
    if (!this.resizableColumn) return;
    const rect = this.resizableColumn.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    // Determine if the click is near the left or right border
    const isNearLeft = offsetX < this.resizeHandleWidth;
    const isNearRight = Math.abs(rect.width - offsetX) < this.resizeHandleWidth;
    if (!isNearLeft && !isNearRight) return;
    this.startX = event.pageX;
    if (isNearLeft) {
      // Adjust the previous column and current column
      this.adjacentColumn = this.resizableColumn.previousElementSibling as HTMLElement;
    } else {
      // Adjust the current column and next column
      this.adjacentColumn = this.resizableColumn.nextElementSibling as HTMLElement;
    }
    this.initialWidth = this.resizableColumn.offsetWidth;
    this.adjacentInitialWidth = this.adjacentColumn?.offsetWidth || 0;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent): void => {
    const deltaX = event.pageX - this.startX;
    if (this.adjacentColumn) {
      const newWidth = this.initialWidth + deltaX;
      const adjacentNewWidth = this.adjacentInitialWidth - deltaX;
      newWidth && this.renderer.setStyle(this.resizableColumn, 'width', `${newWidth}px`);
      adjacentNewWidth && this.renderer.setStyle(this.adjacentColumn, 'width', `${adjacentNewWidth}px`);
    }
  };

  onMouseUp = (): void => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
  
  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
    
}
