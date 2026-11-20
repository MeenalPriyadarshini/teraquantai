import { Pipe, PipeTransform } from '@angular/core';

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** 125000 -> ₹1,25,000 ; null -> "Pricing soon" */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? 'Pricing soon' : fmt.format(value);
  }
}
