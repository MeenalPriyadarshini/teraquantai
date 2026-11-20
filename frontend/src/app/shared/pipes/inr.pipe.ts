import { Pipe, PipeTransform } from '@angular/core';

const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Accepts an integer amount in paise.
 * Example: 12500000 -> ₹1,25,000; null -> "Pricing soon".
 */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(amountPaise: number | null | undefined): string {
    return amountPaise == null ? 'Pricing soon' : fmt.format(amountPaise / 100);
  }
}
