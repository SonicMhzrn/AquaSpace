import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../../../core/models';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-form.component.html',
})
export class AdminProductFormComponent implements OnInit {
  isEditMode = false;
  productId?: string;

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    categoryId: ['', Validators.required],
    subcategoryId: [''],
    brand: ['', Validators.required],
    shortDescription: ['', Validators.required],
    description: ['', Validators.required],
    image: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    salePrice: [null as number | null],
    costPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    minimumStock: [5, [Validators.required, Validators.min(0)]],
    trackInventory: [true],
    allowBackorders: [false],
    isActive: [true],
    isFeatured: [false],
    tags: [''],
    metaTitle: [''],
    metaDescription: [''],
    attributes: this.fb.array<ReturnType<typeof this.createAttributeGroup>>([]),
    specifications: this.fb.array<ReturnType<typeof this.createAttributeGroup>>([]),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productSvc: ProductService,
    public categorySvc: CategoryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.isEditMode = !!this.productId;
    if (this.isEditMode) {
      this.loadProduct(this.productId!);
    }
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }
  get specifications(): FormArray {
    return this.form.get('specifications') as FormArray;
  }

  get subcategoryOptions() {
    return this.categorySvc.getSubcategories(this.form.controls.categoryId.value);
  }

  private createAttributeGroup(label = '', value = '') {
    return this.fb.nonNullable.group({ label: [label, Validators.required], value: [value, Validators.required] });
  }

  addAttribute(): void {
    this.attributes.push(this.createAttributeGroup());
  }
  removeAttribute(i: number): void {
    this.attributes.removeAt(i);
  }
  addSpecification(): void {
    this.specifications.push(this.createAttributeGroup());
  }
  removeSpecification(i: number): void {
    this.specifications.removeAt(i);
  }

  private loadProduct(id: string): void {
    const p = this.productSvc.getById(id);
    if (!p) return;
    this.form.patchValue({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      subcategoryId: p.subcategoryId ?? '',
      brand: p.brand,
      shortDescription: p.shortDescription,
      description: p.description,
      image: p.images[0] ?? '',
      price: p.price,
      salePrice: p.salePrice ?? null,
      costPrice: p.costPrice ?? null,
      stockQuantity: p.stockQuantity,
      minimumStock: p.minimumStock,
      trackInventory: p.trackInventory,
      allowBackorders: p.allowBackorders,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      tags: p.tags.join(', '),
      metaTitle: p.seo.metaTitle,
      metaDescription: p.seo.metaDescription,
    });
    p.attributes.forEach((a) => this.attributes.push(this.createAttributeGroup(a.label, a.value)));
    p.specifications.forEach((s) => this.specifications.push(this.createAttributeGroup(s.label, s.value)));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill in all required fields.');
      return;
    }
    const v = this.form.getRawValue();
    const slugBase = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productData: Omit<Product, 'id' | 'slug' | 'rating' | 'badges' | 'currency' | 'createdAt'> = {
      sku: v.sku,
      name: v.name,
      categoryId: v.categoryId,
      subcategoryId: v.subcategoryId || undefined,
      brand: v.brand,
      shortDescription: v.shortDescription,
      description: v.description,
      images: [v.image],
      price: v.price,
      salePrice: v.salePrice ?? undefined,
      costPrice: v.costPrice ?? undefined,
      stockQuantity: v.stockQuantity,
      minimumStock: v.minimumStock,
      trackInventory: v.trackInventory,
      allowBackorders: v.allowBackorders,
      attributes: v.attributes,
      specifications: v.specifications,
      tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isActive: v.isActive,
      isFeatured: v.isFeatured,
      seo: { metaTitle: v.metaTitle || v.name, metaDescription: v.metaDescription || v.shortDescription },
    };

    if (this.isEditMode && this.productId) {
      this.productSvc.update(this.productId, productData);
      this.toast.success('Product updated');
    } else {
      const newProduct: Product = {
        ...productData,
        id: `p-${Date.now()}`,
        slug: `${slugBase}-${Date.now()}`,
        rating: { average: 0, count: 0 },
        badges: v.isFeatured ? ['NEW'] : [],
        currency: 'USD',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      this.productSvc.create(newProduct);
      this.toast.success('Product created');
    }
    this.router.navigateByUrl('/admin/products');
  }
}
