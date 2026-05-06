import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// CDK Drag & Drop para gestión de productos (Proyecto 3 requirement)
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: 'OnPush',
  template: `
    <div class="admin-panel">
      <h2>Panel de Administración</h2>

      <!-- Filtro por categoría -->
      @if (categories().length > 0) {
        <select (change)="setCategory($event.target.value)" [value]="currentCategory()" class="category-select">
          <option value="">Todas las categorías</option>
          @for (cat of categories(); track cat.id) {
            <option value="{{ cat.id }}">{{ cat.name }}</option>
          }
        </select>
      }

      <!-- Lista de productos con Drag & Drop -->
      @if (!loading() && products().length > 0) {
        <div class="products-list">
          <h3>Ordenar Productos (Drag & Drop)</h3>
          
          <cdk-drop-list [cdkDropListData]="products()" (cdkDropListDropped)="drop($event)">
            @for (product of products(); track product.id; let i = $index) {
              <div classd-cdk-drag>class="product-item"
                cdkDrag
                [cdkDragData]="{id: product.id, name: product.name, price: product.price}"
                [cdkDragDisabled]="!canEdit(product)">
                
                <div class="drag-handle">☰</div>
                <span>{{ i + 1 }}. {{ product.name }}</span>
                <span class="price">${{ product.price }}</span>
                @if (product.stock > 0) {
                  <span class="stock-badge stock-available">Stock: {{ product.stock }}</span>
                } @else {
                  <span class="stock-badge stock-zero">Sin Stock</span>
                }
              </cdk-drag>
            }
          </cdk-drop-list>

          <!-- Barra de herramientas Admin -->
          <div class="admin-toolbar">
            <button class="btn btn-primary" (click)="showForm(true)">+ Nuevo Producto</button>
            <button class="btn btn-warning" (click)="applySorting()">Aplicar Orden</button>
            @if (currentCategory()) {
              <button class="btn btn-secondary" (click)="exportToCSV()">Exportar CSV</button>
            }
          </div>
        </div>
      } @else if (!loading()) {
        <p>No hay productos disponibles.</p>
      } @else {
        <div class="loading">Cargando...</div>
      }

      <!-- Modal/Formulario para agregar/editar producto -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="product-form-modal" (click)="$event.stopPropagation()">
            <h3>{{ editingId ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
            
            <form (ngSubmit)="saveProduct($event)">
              <input type="text" [(ngModel)]="editForm.name" name="name" placeholder="Nombre" required class="form-control">
              <textarea [(ngModel)]="editForm.description" name="description" placeholder="Descripción" class="form-control"></textarea>
              
              <div class="form-group">
                <input type="number" step="0.01" [(ngModel)]="editForm.price" name="price" placeholder="Precio" required min="0" class="form-control price-input">
              </div>
              
              <div class="form-group">
                <input type="number" [(ngModel)]="editForm.stock" name="stock" placeholder="Stock inicial" required min="0" class="form-control stock-input">
              </div>

              <select [(ngModel)]="editForm.categoryId" name="categoryId" class="form-control">
                @for (cat of categories(); track cat.id) {
                  <option value="{{ cat.id }}">{{ cat.name }}</option>
                }
              </select>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="editForm.isActive" name="isActive"> Activo
                </label>
              </div>

              <button type="submit" class="btn btn-success">Guardar</button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-panel {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    h2 { text-align: center; color: #333; margin-bottom: 2rem; }
    
    .category-select {
      width: 100%;
      max-width: 300px;
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid #ddd;
      margin-bottom: 1rem;
    }

    .products-list {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    cdk-drop-list {
      min-height: 400px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .product-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      margin-bottom: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
    }

    .drag-handle {
      color: #9e9e9e;
      margin-right: 1rem;
      font-size: 1.2em;
    }

    .price {
      font-weight: bold;
      color: #28a745;
      margin-left: auto;
      background-color: rgba(40, 167, 69, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }

    .stock-badge {
      margin-left: 0.5rem;
      font-size: 0.8em;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .stock-available { background-color: #d4edda; color: #155724; }
    .stock-zero { background-color: #f8d7da; color: #721c24; }

    .admin-toolbar {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #e9ecef;
      border-radius: 6px;
    }

    .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
    .btn-primary { background-color: #0d8aef; color: white; }
    .btn-success { background-color: #28a745; color: white; }
    .btn-warning { background-color: #ffc107; color: #333; }
    .btn-secondary { background-color: #6c757d; color: white; }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .product-form-modal {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .price-input, .stock-input {
      color: #333;
      font-weight: bold;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AdminPanelComponent {
  // TODO: Inyectar ProductService para cargar/editar productos
  
  products = signal<any[]>([]); // Array de productos cargados
  categories = signal<any[]>([]);
  loading = signal(false);
  showForm = signal(false);
  currentCategory = signal<string>('');
  editingId: number | null = null;
  editForm = { name: '', description: '', price: 0, stock: 0, categoryId: null, isActive: true };

  canEdit(product: any) {
    // Solo editable si tiene stock o es admin - lógica simplificada
    return true;
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.products(), event.previousIndex, event.currentIndex);
    this.products.set([...this.products()]); // Trigger signal update
    console.log('Nueva orden de productos:', this.products());
  }

  setCategory(catId: string) {
    this.currentCategory.set(catId);
    // Filtrar productos por categoría (todo)
  }

  showForm(show: boolean = true, productId?: number) {
    if (show && productId) {
      const prod = this.products().find(p => p.id === productId);
      if (prod) {
        this.editingId = productId;
        Object.assign(this.editForm, { ...prod, price: parseFloat(prod.price), stock: parseInt(prod.stock) });
      }
    } else if (!show) {
      this.closeModal();
    }
  }

  closeModal() {
    this.showForm.set(false);
    this.editingId = null;
    Object.assign(this.editForm, { name: '', description: '', price: 0, stock: 0, categoryId: null, isActive: true });
  }

  saveProduct(event: Event) {
    event.preventDefault();
    // TODO: Llamar al backend para crear/editar producto
    this.closeModal();
  }

  applySorting() {
    console.log('Aplicando orden:', this.products().map(p => p.id));
    // TODO: Enviar array de IDs al backend para actualizar orden
  }

  exportToCSV() {
    const rows = this.products().map((p, i) => 
      `"${i+1}","${p.name}",${p.price},${p.stock}`
    ).join('\n');
    const csv = 'ID,Nombre,Precio,Stock\n' + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productos_${new Date().toISOString()}.csv`;
    link.click();
  }
}
