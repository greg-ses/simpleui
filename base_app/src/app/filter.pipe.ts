
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filterValues: any[]): any[] {
    if (!items) {
      return [];
    }
    if (!filterValues) {
      return items;
    }

    if (filterValues.length == 0) {
      return items;
    }
    return items['filteredData'].filter(item => {
      return filterValues.includes(item.value);
    });
  }
}
